/**
 * Webhook unificado para receber notificações do Banco Inter
 * POST /banco-inter/webhook
 * 
 * Este endpoint pode receber qualquer tipo de notificação do Banco Inter
 * e rotear para o processamento correto baseado no conteúdo
 */
exports.post = async ({ appSdk, admin }, req, res) => {
  const webhookData = req.body
  const headers = req.headers
  
  console.log('Webhook Banco Inter recebido:', {
    headers: headers,
    body: JSON.stringify(webhookData, null, 2)
  })

  try {
    // Identificar tipo de webhook baseado na estrutura dos dados
    const webhookType = identifyWebhookType(webhookData)
    
    console.log('Tipo de webhook identificado:', webhookType)

    switch (webhookType) {
      case 'pix':
        // Redirecionar para processamento PIX
        const pixModule = require('./webhook-pix')
        return pixModule.post({ appSdk, admin }, req, res)
        
      case 'cobranca':
        // Redirecionar para processamento de cobrança
        const cobrancaModule = require('./webhook-cobranca')
        return cobrancaModule.post({ appSdk, admin }, req, res)
        
      case 'test':
        // Webhook de teste
        console.log('Webhook de teste recebido')
        return res.status(200).json({
          status: 'test_received',
          message: 'Webhook de teste processado com sucesso',
          timestamp: new Date().toISOString()
        })
        
      case 'unknown':
      default:
        console.warn('Tipo de webhook não reconhecido:', webhookData)
        
        // Log para análise posterior
        await logUnknownWebhook(admin, webhookData, headers)
        
        return res.status(200).json({
          status: 'received',
          message: 'Webhook recebido mas tipo não reconhecido'
        })
    }

  } catch (error) {
    console.error('Erro ao processar webhook Banco Inter:', error)
    
    // Log do erro para debugging
    await logWebhookError(admin, webhookData, headers, error)
    
    res.status(500).json({
      error: 'Erro interno ao processar webhook',
      message: error.message
    })
  }
}

/**
 * Identifica o tipo de webhook baseado na estrutura dos dados
 */
function identifyWebhookType(data) {
  // Webhook PIX
  if (data.pix || data.endToEndId || (data.evento && data.evento === 'pix')) {
    return 'pix'
  }
  
  // Webhook de Cobrança
  if (data.codigoSolicitacao || data.nossoNumero || data.situacao) {
    return 'cobranca'
  }
  
  // Webhook de teste (estrutura comum de teste)
  if (data.test || data.tipo === 'teste' || (typeof data === 'string' && data.includes('test'))) {
    return 'test'
  }
  
  // PIX Automático (para implementação futura)
  if (data.recorrencia || data.solicRec || data.cobr) {
    return 'pix_automatico'
  }
  
  return 'unknown'
}

/**
 * Registra webhook desconhecido para análise
 */
async function logUnknownWebhook(admin, webhookData, headers) {
  try {
    await admin.firestore()
      .collection('bancoInterWebhookLogs')
      .add({
        type: 'unknown',
        data: webhookData,
        headers: headers,
        timestamp: admin.firestore.Timestamp.now()
      })
  } catch (error) {
    console.error('Erro ao registrar webhook desconhecido:', error)
  }
}

/**
 * Registra erro de webhook para debugging
 */
async function logWebhookError(admin, webhookData, headers, error) {
  try {
    await admin.firestore()
      .collection('bancoInterWebhookLogs')
      .add({
        type: 'error',
        data: webhookData,
        headers: headers,
        error: {
          message: error.message,
          stack: error.stack
        },
        timestamp: admin.firestore.Timestamp.now()
      })
  } catch (logError) {
    console.error('Erro ao registrar log de erro:', logError)
  }
}