const { createCobrancaClient } = require('../../lib/banco-inter')
const { getAppData } = require('../../lib/store-api/get-app-data')

/**
 * Endpoint para servir PDF do boleto
 * GET /banco-inter/boleto/{codigoSolicitacao}/pdf
 */
exports.get = async ({ appSdk }, req, res) => {
  const { codigoSolicitacao } = req.params
  const storeId = parseInt(req.get('x-store-id') || req.query.store_id, 10)
  
  if (!storeId) {
    return res.status(400).json({
      error: 'Store ID é obrigatório',
      message: 'Informe o store_id via header X-Store-ID ou query parameter'
    })
  }

  if (!codigoSolicitacao) {
    return res.status(400).json({
      error: 'Código da solicitação é obrigatório'
    })
  }

  try {
    // Obtém configuração da loja
    const appData = await getAppData({ appSdk, storeId })
    
    if (!appData) {
      return res.status(404).json({
        error: 'App não configurado',
        message: 'Configure o app no painel administrativo da loja'
      })
    }

    // Cria cliente de cobrança
    const cobrancaClient = createCobrancaClient(appData, storeId, appData.sandbox !== false)
    
    // Obtém PDF do boleto
    const pdfResponse = await cobrancaClient.getCobrancaPdf(codigoSolicitacao)
    
    if (!pdfResponse.data.pdf) {
      return res.status(404).json({
        error: 'PDF não encontrado',
        message: 'O boleto ainda não foi processado ou não existe'
      })
    }

    // Converte base64 para buffer
    const pdfBuffer = Buffer.from(pdfResponse.data.pdf, 'base64')
    
    // Define headers para PDF
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="boleto-${codigoSolicitacao}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length)
    
    // Envia o PDF
    res.send(pdfBuffer)
    
  } catch (error) {
    console.error('Erro ao obter PDF do boleto:', error)
    
    if (error.message.includes('404')) {
      return res.status(404).json({
        error: 'Boleto não encontrado',
        message: 'O boleto solicitado não foi encontrado'
      })
    }
    
    res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao processar solicitação do PDF'
    })
  }
}