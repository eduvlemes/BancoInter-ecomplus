const { createCobrancaClient, CobrancaHelpers } = require('../../lib/banco-inter')
const { getAppData } = require('../../lib/store-api/get-app-data')

/**
 * Endpoint para testar operações de Cobrança (Boleto com PIX)
 * POST /banco-inter/cobranca/test
 */
exports.post = async ({ appSdk }, req, res) => {
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

    // Cria cliente de cobrança
    const cobrancaClient = createCobrancaClient(appData, storeId, appData.sandbox !== false)
    
    const { action, data } = req.body
    let result

    switch (action) {
      case 'create_cobranca':
        result = await testCreateCobranca(cobrancaClient, data)
        break
        
      case 'get_cobranca':
        result = await testGetCobranca(cobrancaClient, data)
        break
        
      case 'list_cobrancas':
        result = await testListCobrancas(cobrancaClient, data)
        break
        
      case 'update_cobranca':
        result = await testUpdateCobranca(cobrancaClient, data)
        break
        
      case 'cancel_cobranca':
        result = await testCancelCobranca(cobrancaClient, data)
        break
        
      case 'get_pdf':
        result = await testGetPdf(cobrancaClient, data)
        break
        
      case 'get_sumario':
        result = await testGetSumario(cobrancaClient, data)
        break
        
      default:
        return res.status(400).json({
          error: 'Ação inválida',
          availableActions: [
            'create_cobranca',
            'get_cobranca',
            'list_cobrancas', 
            'update_cobranca',
            'cancel_cobranca',
            'get_pdf',
            'get_sumario'
          ]
        })
    }

    res.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erro no teste Cobrança:', error)
    
    res.status(500).json({
      error: 'Erro interno',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Testa criação de cobrança
 */
async function testCreateCobranca(cobrancaClient, data = {}) {
  // Dados de teste padrão
  const defaultData = {
    valorNominal: 50.00,
    numDiasAgenda: 30,
    pagador: {
      cpfCnpj: '12345678901',
      tipoPessoa: 'FISICA',
      nome: 'João da Silva',
      endereco: 'Rua Teste, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01000000',
      email: 'joao@teste.com',
      ddd: '11',
      telefone: '999999999'
    }
  }

  const cobrancaData = { ...defaultData, ...data }
  
  // Gera seuNumero único
  cobrancaData.seuNumero = cobrancaClient.generateSeuNumero('TEST')
  
  // Gera data de vencimento
  cobrancaData.dataVencimento = cobrancaClient.generateDueDate(7)
  
  // Mensagem padrão
  cobrancaData.mensagem = {
    linha1: 'Cobrança de teste',
    linha2: 'Via API Banco Inter',
    linha3: 'Pagamento via PIX disponível',
    linha4: 'ou código de barras',
    linha5: ''
  }

  // Valida dados
  cobrancaClient.validateCobrancaData(cobrancaData)

  const response = await cobrancaClient.createCobranca(cobrancaData)
  
  return {
    cobrancaData,
    response: response.data
  }
}

/**
 * Testa consulta de cobrança
 */
async function testGetCobranca(cobrancaClient, data = {}) {
  const { codigoSolicitacao } = data
  
  if (!codigoSolicitacao) {
    throw new Error('codigoSolicitacao é obrigatório para consultar cobrança')
  }

  const response = await cobrancaClient.getCobranca(codigoSolicitacao)
  
  return {
    codigoSolicitacao,
    response: response.data
  }
}

/**
 * Testa listagem de cobranças
 */
async function testListCobrancas(cobrancaClient, data = {}) {
  // Busca cobranças dos últimos 30 dias por padrão
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  
  const params = CobrancaHelpers.buildDateRangeParams(
    data.dataInicial || startDate.toISOString().split('T')[0],
    data.dataFinal || endDate.toISOString().split('T')[0]
  )
  
  // Adiciona paginação
  Object.assign(params, CobrancaHelpers.buildPaginationParams(0, 10))
  
  // Outros filtros
  if (data.situacao) params.situacao = data.situacao
  if (data.tipoCobranca) params.tipoCobranca = data.tipoCobranca
  
  const response = await cobrancaClient.listCobrancas(params)
  
  return {
    params,
    response: response.data
  }
}

/**
 * Testa edição de cobrança
 */
async function testUpdateCobranca(cobrancaClient, data = {}) {
  const { codigoSolicitacao, updateData } = data
  
  if (!codigoSolicitacao) {
    throw new Error('codigoSolicitacao é obrigatório para editar cobrança')
  }
  
  if (!updateData) {
    throw new Error('dados de atualização são obrigatórios')
  }

  const response = await cobrancaClient.updateCobranca(codigoSolicitacao, updateData)
  
  return {
    codigoSolicitacao,
    updateData,
    response: response.data
  }
}

/**
 * Testa cancelamento de cobrança
 */
async function testCancelCobranca(cobrancaClient, data = {}) {
  const { codigoSolicitacao, motivoCancelamento } = data
  
  if (!codigoSolicitacao) {
    throw new Error('codigoSolicitacao é obrigatório para cancelar cobrança')
  }
  
  const motivo = motivoCancelamento || 'Teste de cancelamento via API'

  const response = await cobrancaClient.cancelCobranca(codigoSolicitacao, motivo)
  
  return {
    codigoSolicitacao,
    motivoCancelamento: motivo,
    response: response.data
  }
}

/**
 * Testa obtenção do PDF da cobrança
 */
async function testGetPdf(cobrancaClient, data = {}) {
  const { codigoSolicitacao } = data
  
  if (!codigoSolicitacao) {
    throw new Error('codigoSolicitacao é obrigatório para obter PDF')
  }

  const response = await cobrancaClient.getCobrancaPdf(codigoSolicitacao)
  
  return {
    codigoSolicitacao,
    hasPdf: !!response.data.pdf,
    pdfSize: response.data.pdf ? response.data.pdf.length : 0
  }
}

/**
 * Testa sumário de cobranças
 */
async function testGetSumario(cobrancaClient, data = {}) {
  // Busca sumário dos últimos 30 dias por padrão
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  
  const params = CobrancaHelpers.buildDateRangeParams(
    data.dataInicial || startDate.toISOString().split('T')[0],
    data.dataFinal || endDate.toISOString().split('T')[0]
  )
  
  // Outros filtros
  if (data.situacao) params.situacao = data.situacao
  if (data.tipoCobranca) params.tipoCobranca = data.tipoCobranca
  
  const response = await cobrancaClient.getSumarioCobrancas(params)
  
  return {
    params,
    response: response.data
  }
}
