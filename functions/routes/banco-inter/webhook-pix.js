const { updateAppData } = require('../../lib/store-api/update-app-data')

/**
 * Webhook para receber notificações PIX do Banco Inter
 * POST /banco-inter/webhook/pix
 */
exports.post = async ({ appSdk, admin }, req, res) => {
  const webhookData = req.body
  
  console.log('Webhook PIX recebido:', JSON.stringify(webhookData, null, 2))

  try {
    // Validar estrutura básica do webhook
    if (!webhookData.pix || !webhookData.pix.endToEndId) {
      console.warn('Webhook PIX inválido - estrutura incorreta')
      return res.status(400).json({ error: 'Estrutura de webhook inválida' })
    }

    const pixData = webhookData.pix
    const e2eid = pixData.endToEndId

    // Buscar transação relacionada no Firestore
    const transactionDoc = await admin.firestore()
      .collection('bancoInterTransactions')
      .where('paymentMethod', '==', 'pix')
      .get()

    let transactionRef = null
    let storeId = null
    let orderId = null

    // Procurar por transação relacionada (pode ser por txid se disponível)
    if (pixData.txid) {
      const txidDoc = await admin.firestore()
        .collection('bancoInterTransactions')
        .doc(pixData.txid)
        .get()
      
      if (txidDoc.exists) {
        transactionRef = txidDoc.data()
        storeId = transactionRef.storeId
        orderId = transactionRef.orderId
      }
    }

    // Se não encontrou por txid, buscar por outros campos
    if (!transactionRef && transactionDoc.size > 0) {
      // Implementar lógica adicional de busca se necessário
      console.warn('Transação PIX não encontrada para e2eid:', e2eid)
    }

    if (!transactionRef) {
      console.warn('Nenhuma transação encontrada para o PIX:', e2eid)
      return res.status(200).json({ 
        status: 'ignored',
        message: 'Transação não encontrada' 
      })
    }

    // Mapear status do PIX
    const pixStatus = mapPixStatus(pixData.status || webhookData.evento)
    
    if (pixStatus === 'paid') {
      // PIX foi pago - atualizar pedido na E-Com Plus
      await updateOrderPaymentStatus(appSdk, storeId, orderId, {
        status: 'paid',
        transaction_id: pixData.txid || e2eid,
        notification_code: e2eid,
        value: pixData.valor,
        paid_at: new Date().toISOString()
      })

      // Atualizar status da transação no Firestore
      await admin.firestore()
        .collection('bancoInterTransactions')
        .doc(transactionRef.transactionId || pixData.txid)
        .update({
          status: 'paid',
          paidAt: admin.firestore.Timestamp.now(),
          e2eid: e2eid,
          webhookData: webhookData
        })

      console.log(`PIX pago - Pedido ${orderId} atualizado`)
    }

    res.status(200).json({ 
      status: 'processed',
      orderId,
      pixStatus 
    })

  } catch (error) {
    console.error('Erro ao processar webhook PIX:', error)
    res.status(500).json({ 
      error: 'Erro interno ao processar webhook',
      message: error.message 
    })
  }
}

/**
 * Mapeia status do PIX para status da E-Com Plus
 */
function mapPixStatus(status) {
  const statusMap = {
    'CONCLUIDA': 'paid',
    'ATIVA': 'pending',
    'REMOVIDA_PELO_USUARIO_RECEBEDOR': 'cancelled',
    'REMOVIDA_PELO_PSP': 'cancelled',
    // Eventos de webhook
    'pix': 'paid',
    'cobrança': 'pending'
  }

  return statusMap[status] || 'pending'
}

/**
 * Atualiza status de pagamento do pedido na E-Com Plus
 */
async function updateOrderPaymentStatus(appSdk, storeId, orderId, paymentData) {
  try {
    // Criar entrada no histórico de pagamentos
    const paymentHistory = {
      date_time: paymentData.paid_at,
      status: paymentData.status,
      transaction_id: paymentData.transaction_id,
      notification_code: paymentData.notification_code,
      flags: ['banco-inter', 'pix']
    }

    // Adicionar valor se disponível
    if (paymentData.value) {
      paymentHistory.amount = parseFloat(paymentData.value)
    }

    // Fazer requisição para adicionar ao histórico
    await appSdk.apiRequest(storeId, `orders/${orderId}/payments_history.json`, 'POST', paymentHistory)

    // Se foi pago, atualizar status financeiro do pedido
    if (paymentData.status === 'paid') {
      await appSdk.apiRequest(storeId, `orders/${orderId}.json`, 'PATCH', {
        financial_status: {
          current: 'paid'
        }
      })
    }

    console.log(`Status de pagamento atualizado para pedido ${orderId}:`, paymentData.status)

  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error)
    throw error
  }
}