/**
 * Webhook para receber notificações de Cobrança (Boleto) do Banco Inter
 * POST /banco-inter/webhook/cobranca
 */
exports.post = async ({ appSdk, admin }, req, res) => {
  const webhookData = req.body
  
  console.log('Webhook Cobrança recebido:', JSON.stringify(webhookData, null, 2))

  try {
    // Validar estrutura básica do webhook
    if (!webhookData.codigoSolicitacao && !webhookData.nossoNumero) {
      console.warn('Webhook Cobrança inválido - estrutura incorreta')
      return res.status(400).json({ error: 'Estrutura de webhook inválida' })
    }

    const codigoSolicitacao = webhookData.codigoSolicitacao
    const situacao = webhookData.situacao || webhookData.status

    // Buscar transação relacionada no Firestore
    const transactionDoc = await admin.firestore()
      .collection('bancoInterTransactions')
      .doc(codigoSolicitacao)
      .get()

    if (!transactionDoc.exists) {
      console.warn('Transação de cobrança não encontrada:', codigoSolicitacao)
      return res.status(200).json({ 
        status: 'ignored',
        message: 'Transação não encontrada' 
      })
    }

    const transactionRef = transactionDoc.data()
    const { storeId, orderId } = transactionRef

    // Mapear situação da cobrança
    const paymentStatus = mapCobrancaStatus(situacao)
    
    // Atualizar pedido na E-Com Plus baseado na situação
    switch (paymentStatus) {
      case 'paid':
        await updateOrderPaymentStatus(appSdk, storeId, orderId, {
          status: 'paid',
          transaction_id: codigoSolicitacao,
          notification_code: webhookData.nossoNumero || codigoSolicitacao,
          value: webhookData.valorTotalRecebido || webhookData.valorNominal,
          paid_at: webhookData.dataSituacao || new Date().toISOString(),
          payment_method: webhookData.origemRecebimento || 'boleto'
        })
        break
        
      case 'cancelled':
        await updateOrderPaymentStatus(appSdk, storeId, orderId, {
          status: 'cancelled',
          transaction_id: codigoSolicitacao,
          notification_code: webhookData.nossoNumero || codigoSolicitacao,
          cancelled_at: webhookData.dataSituacao || new Date().toISOString()
        })
        break
        
      case 'pending':
        // Para status intermediários, apenas log
        console.log(`Cobrança ${codigoSolicitacao} em situação: ${situacao}`)
        break
    }

    // Atualizar status da transação no Firestore
    await admin.firestore()
      .collection('bancoInterTransactions')
      .doc(codigoSolicitacao)
      .update({
        status: paymentStatus,
        situacao: situacao,
        lastWebhook: admin.firestore.Timestamp.now(),
        webhookData: webhookData
      })

    console.log(`Cobrança processada - Pedido ${orderId}, Status: ${paymentStatus}`)

    res.status(200).json({ 
      status: 'processed',
      orderId,
      codigoSolicitacao,
      paymentStatus 
    })

  } catch (error) {
    console.error('Erro ao processar webhook Cobrança:', error)
    res.status(500).json({ 
      error: 'Erro interno ao processar webhook',
      message: error.message 
    })
  }
}

/**
 * Mapeia situação da cobrança para status da E-Com Plus
 */
function mapCobrancaStatus(situacao) {
  const statusMap = {
    'RECEBIDO': 'paid',
    'MARCADO_RECEBIDO': 'paid',
    'A_RECEBER': 'pending',
    'EM_PROCESSAMENTO': 'pending',
    'ATRASADO': 'pending',
    'CANCELADO': 'cancelled',
    'EXPIRADO': 'cancelled',
    'FALHA_EMISSAO': 'cancelled',
    'PROTESTO': 'pending'
  }

  return statusMap[situacao] || 'pending'
}

/**
 * Atualiza status de pagamento do pedido na E-Com Plus
 */
async function updateOrderPaymentStatus(appSdk, storeId, orderId, paymentData) {
  try {
    // Criar entrada no histórico de pagamentos
    const paymentHistory = {
      date_time: paymentData.paid_at || paymentData.cancelled_at || new Date().toISOString(),
      status: paymentData.status,
      transaction_id: paymentData.transaction_id,
      notification_code: paymentData.notification_code,
      flags: ['banco-inter', 'boleto']
    }

    // Adicionar valor se disponível
    if (paymentData.value) {
      paymentHistory.amount = parseFloat(paymentData.value)
    }

    // Adicionar método de pagamento se especificado
    if (paymentData.payment_method) {
      paymentHistory.flags.push(paymentData.payment_method)
    }

    // Fazer requisição para adicionar ao histórico
    await appSdk.apiRequest(storeId, `orders/${orderId}/payments_history.json`, 'POST', paymentHistory)

    // Atualizar status financeiro do pedido
    if (paymentData.status === 'paid') {
      await appSdk.apiRequest(storeId, `orders/${orderId}.json`, 'PATCH', {
        financial_status: {
          current: 'paid'
        }
      })
    } else if (paymentData.status === 'cancelled') {
      await appSdk.apiRequest(storeId, `orders/${orderId}.json`, 'PATCH', {
        financial_status: {
          current: 'voided'
        }
      })
    }

    console.log(`Status de pagamento atualizado para pedido ${orderId}:`, paymentData.status)

  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error)
    throw error
  }
}
