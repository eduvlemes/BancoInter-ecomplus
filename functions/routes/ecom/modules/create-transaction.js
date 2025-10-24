const { 
  createPixClient, 
  createCobrancaClient, 
  PixHelpers, 
  CobrancaHelpers 
} = require('../../../lib/banco-inter')
const { getAppData } = require('../../../lib/store-api/get-app-data')

exports.post = async ({ appSdk, admin }, req, res) => {
  /**
   * Requests coming from Modules API have two object properties on body: `params` and `application`.
   * `application` is a copy of your app installed by the merchant,
   * including the properties `data` and `hidden_data` with admin settings configured values.
   * JSON Schema reference for the Create Transaction module objects:
   * `params`: https://apx-mods.e-com.plus/api/v1/create_transaction/schema.json?store_id=100
   * `response`: https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
   */

  const { params, application } = req.body
  const { storeId } = req
  
  // Merge all app options configured by merchant
  const appData = Object.assign({}, application.data, application.hidden_data)
  
  // Setup required `transaction` response object
  const transaction = {
    intermediator: {
      transaction_id: '',
      transaction_reference: '',
      transaction_code: ''
    }
  }

  // Indicates whether the buyer should be redirected to payment link right after checkout
  let redirectToPayment = false

  try {
    // Validar dados do pedido
    if (!params.order_id) {
      throw new Error('ID do pedido é obrigatório')
    }

    // Buscar dados completos do pedido
    const order = await appSdk.apiRequest(storeId, `orders/${params.order_id}.json`)
    const orderData = order.response.data

    // Determinar tipo de pagamento e processar
    switch (params.payment_method.code) {
      
      case 'account_deposit': // PIX
        const pixResult = await handlePixPayment(appData, storeId, orderData, params)
        Object.assign(transaction, pixResult.transaction)
        redirectToPayment = pixResult.redirectToPayment
        break
        
      case 'banking_billet': // Boleto com PIX
        const boletoResult = await handleBoletoPayment(appData, storeId, orderData, params)
        Object.assign(transaction, boletoResult.transaction)
        redirectToPayment = boletoResult.redirectToPayment
        break
        
      default:
        throw new Error(`Método de pagamento não suportado: ${params.payment_method.code}`)
    }

    // Salvar referência da transação no Firestore para webhook
    if (transaction.intermediator.transaction_id) {
      await saveTransactionReference(admin, storeId, orderData._id, transaction)
    }

  } catch (error) {
    console.error('Erro ao criar transação Banco Inter:', error)
    
    // Retorna erro para a E-Com Plus
    transaction.status = {
      current: 'unknown'
    }
    transaction.notes = `Erro ao processar pagamento: ${error.message}`
  }

  res.send({
    redirect_to_payment: redirectToPayment,
    transaction
  })
}

/**
 * Processa pagamento via PIX
 */
async function handlePixPayment(appData, storeId, order, params) {
  const pixClient = createPixClient(appData, storeId, appData.sandbox !== false)
  
  // Validar dados do pedido para PIX
  PixHelpers.validateOrderForPix(order)
  
  // Determinar se é PIX imediato ou com vencimento
  const isPixComVencimento = params.payment_method.name?.includes('Vencimento') || 
                            appData.pix_due_days > 0

  let pixResponse
  let txid = pixClient.generateTxid('PIX')

  if (isPixComVencimento) {
    // PIX com vencimento
    const diasVencimento = appData.pix_due_days || 1
    const dataVencimento = PixHelpers.generateDueDate(diasVencimento)
    
    const cobvData = PixHelpers.buildCobvFromOrder(order, appData, {
      chave: appData.pix_key || appData.client_id, // Fallback para client_id se não tiver chave configurada
      dataDeVencimento: dataVencimento,
      validadeAposVencimento: 30
    })
    
    pixResponse = await pixClient.createCobv(txid, cobvData)
  } else {
    // PIX imediato
    const expiracao = appData.pix_expiration || 3600 // 1 hora padrão
    
    const cobData = PixHelpers.buildCobFromOrder(order, appData, {
      chave: appData.pix_key || appData.client_id,
      expiracao
    })
    
    pixResponse = await pixClient.createCob(txid, cobData)
  }

  const paymentInfo = PixHelpers.extractPaymentInfo(pixResponse)
  
  return {
    transaction: {
      intermediator: {
        transaction_id: paymentInfo.txid,
        transaction_reference: paymentInfo.txid,
        transaction_code: paymentInfo.txid
      },
      status: {
        current: 'pending'
      },
      payment_link: paymentInfo.location?.location,
      pix: {
        qr_code: paymentInfo.pixCopiaECola,
        expires_at: paymentInfo.expiracao ? 
          new Date(Date.now() + (paymentInfo.expiracao * 1000)).toISOString() : 
          paymentInfo.dataVencimento
      },
      notes: `PIX criado com sucesso. TXID: ${paymentInfo.txid}`
    },
    redirectToPayment: false // PIX não precisa de redirect
  }
}

/**
 * Processa pagamento via Boleto com PIX
 */
async function handleBoletoPayment(appData, storeId, order, params) {
  const cobrancaClient = createCobrancaClient(appData, storeId, appData.sandbox !== false)
  
  // Validar dados do pedido para cobrança
  CobrancaHelpers.validateOrderForCobranca(order)
  
  // Construir dados da cobrança
  const cobrancaData = CobrancaHelpers.buildCobrancaFromOrder(order, appData, {
    numDiasAgenda: appData.boleto_expire_days || 7,
    desconto: appData.boleto_discount ? CobrancaHelpers.buildDesconto('PERCENTUALDATAINFORMADA', appData.boleto_discount, 3) : undefined,
    multa: appData.boleto_multa ? CobrancaHelpers.buildMulta(appData.boleto_multa) : undefined,
    mora: appData.boleto_mora ? CobrancaHelpers.buildMora(appData.boleto_mora) : undefined
  })
  
  const cobrancaResponse = await cobrancaClient.createCobranca(cobrancaData)
  const paymentInfo = CobrancaHelpers.extractPaymentInfo(cobrancaResponse)
  
  return {
    transaction: {
      intermediator: {
        transaction_id: paymentInfo.codigoSolicitacao,
        transaction_reference: paymentInfo.seuNumero,
        transaction_code: paymentInfo.codigoSolicitacao
      },
      status: {
        current: 'pending'
      },
      banking_billet: {
        code: paymentInfo.boleto?.linhaDigitavel,
        barcode: paymentInfo.boleto?.codigoBarras,
        valid_thru: paymentInfo.dataVencimento,
        link: `${req.protocol}://${req.get('host')}/banco-inter/boleto/${paymentInfo.codigoSolicitacao}/pdf`
      },
      pix: paymentInfo.pix ? {
        qr_code: paymentInfo.pix.pixCopiaECola,
        expires_at: paymentInfo.dataVencimento
      } : undefined,
      notes: `Boleto criado com sucesso. Código: ${paymentInfo.codigoSolicitacao}`
    },
    redirectToPayment: false
  }
}

/**
 * Salva referência da transação para uso nos webhooks
 */
async function saveTransactionReference(admin, storeId, orderId, transaction) {
  try {
    const transactionRef = {
      storeId,
      orderId,
      transactionId: transaction.intermediator.transaction_id,
      paymentMethod: transaction.banking_billet ? 'boleto' : 'pix',
      createdAt: admin.firestore.Timestamp.now(),
      status: 'pending'
    }
    
    await admin.firestore()
      .collection('bancoInterTransactions')
      .doc(transaction.intermediator.transaction_id)
      .set(transactionRef)
      
    console.log('Referência da transação salva:', transaction.intermediator.transaction_id)
  } catch (error) {
    console.error('Erro ao salvar referência da transação:', error)
  }
}
