const { createClient } = require('../../lib/banco-inter')
const { getAppData } = require('../../lib/store-api/get-app-data')

/**
 * Endpoint para testar conexão com Banco Inter
 * GET /banco-inter/test-connection
 */
exports.get = async ({ appSdk }, req, res) => {
  const storeId = parseInt(req.get('x-store-id') || req.query.store_id, 10)
  
  if (!storeId) {
    return res.status(400).json({
      error: 'Store ID é obrigatório',
      message: 'Informe o store_id via header X-Store-ID ou query parameter'
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

    // Cria cliente do Banco Inter
    const bancoInterClient = createClient(appData, storeId, appData.sandbox !== false)
    
    // Testa conexão
    const testResult = await bancoInterClient.testConnection()
    
    // Informações do ambiente
    const envInfo = bancoInterClient.getEnvironmentInfo()
    
    const response = {
      ...testResult,
      ...envInfo,
      timestamp: new Date().toISOString(),
      configuredFeatures: {
        pix: appData.enable_pix !== false,
        pixAuto: appData.enable_pix_auto === true,
        boleto: appData.enable_boleto !== false,
        contaCorrente: !!appData.conta_corrente
      }
    }
    
    const status = testResult.success ? 200 : 400
    res.status(status).json(response)
    
  } catch (error) {
    console.error('Erro ao testar conexão Banco Inter:', error)
    
    res.status(500).json({
      error: 'Erro interno',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}