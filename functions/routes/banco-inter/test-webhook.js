/**
 * Endpoint para testar webhooks do Banco Inter
 * POST /banco-inter/test-webhook
 * 
 * Permite simular diferentes tipos de notificações para teste
 */
exports.post = async ({ appSdk, admin }, req, res) => {
  const { type, customData } = req.body
  
  console.log('Teste de webhook solicitado:', { type, customData })
  
  try {
    let testWebhookData
    
    switch (type) {
      case 'pix':
        testWebhookData = {
          evento: 'pix',
          pix: {
            endToEndId: `E12345678${Date.now()}9876543210`,
            txid: `TEST${Date.now()}`,
            valor: '10.50',
            horario: new Date().toISOString(),
            infoPagador: 'Teste PIX webhook'
          },
          ...customData
        }
        break
        
      case 'cobranca':
        testWebhookData = {
          codigoSolicitacao: `TEST${Date.now()}`,
          nossoNumero: `12345${Date.now()}`,
          seuNumero: `ORDER${Date.now()}`,
          situacao: 'RECEBIDO',
          dataVencimento: new Date().toISOString().split('T')[0],
          valorNominal: 25.99,
          valorTotalRecebimento: 25.99,
          dataRecebimento: new Date().toISOString(),
          ...customData
        }
        break
        
      case 'test':
        testWebhookData = {
          test: true,
          message: 'Webhook de teste',
          timestamp: new Date().toISOString(),
          ...customData
        }
        break
        
      default:
        return res.status(400).json({
          error: 'Tipo de teste inválido',
          validTypes: ['pix', 'cobranca', 'test']
        })
    }
    
    console.log('Dados de teste gerados:', testWebhookData)
    
    // Simular chamada para o webhook principal
    const webhookModule = require('./webhook')
    const mockReq = {
      body: testWebhookData,
      headers: {
        'content-type': 'application/json',
        'x-webhook-test': 'true'
      }
    }
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log('Resposta do webhook:', { code, data })
          return res.status(200).json({
            testSuccess: true,
            webhookResponse: { code, data },
            testData: testWebhookData
          })
        }
      })
    }
    
    await webhookModule.post({ appSdk, admin }, mockReq, mockRes)
    
  } catch (error) {
    console.error('Erro no teste de webhook:', error)
    res.status(500).json({
      error: 'Erro ao executar teste de webhook',
      message: error.message
    })
  }
}

/**
 * Endpoint para listar logs de webhooks
 * GET /banco-inter/test-webhook
 */
exports.get = async ({ appSdk, admin }, req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const type = req.query.type || null
    
    let query = admin.firestore()
      .collection('bancoInterWebhookLogs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
    
    if (type) {
      query = query.where('type', '==', type)
    }
    
    const snapshot = await query.get()
    const logs = []
    
    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
      })
    })
    
    res.json({
      logs,
      total: logs.length,
      filters: { limit, type }
    })
    
  } catch (error) {
    console.error('Erro ao buscar logs de webhook:', error)
    res.status(500).json({
      error: 'Erro ao buscar logs',
      message: error.message
    })
  }
}
