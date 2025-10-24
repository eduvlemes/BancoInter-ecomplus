const { createPixClient, PixHelpers } = require('../../lib/banco-inter')
const { getAppData } = require('../../lib/store-api/get-app-data')

/**
 * Endpoint para testar operações PIX
 * POST /banco-inter/pix/test
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

    // Cria cliente PIX
    const pixClient = createPixClient(appData, storeId, appData.sandbox !== false)
    
    const { action, data } = req.body
    let result

    switch (action) {
      case 'create_cob':
        result = await testCreateCob(pixClient, data)
        break
        
      case 'get_cob':
        result = await testGetCob(pixClient, data)
        break
        
      case 'list_cob':
        result = await testListCob(pixClient, data)
        break
        
      case 'create_cobv':
        result = await testCreateCobv(pixClient, data)
        break
        
      case 'get_pix':
        result = await testGetPix(pixClient, data)
        break
        
      case 'list_pix':
        result = await testListPix(pixClient, data)
        break
        
      default:
        return res.status(400).json({
          error: 'Ação inválida',
          availableActions: [
            'create_cob',
            'get_cob', 
            'list_cob',
            'create_cobv',
            'get_pix',
            'list_pix'
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
    console.error('Erro no teste PIX:', error)
    
    res.status(500).json({
      error: 'Erro interno',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Testa criação de cobrança imediata
 */
async function testCreateCob(pixClient, data = {}) {
  // Dados de teste padrão
  const defaultData = {
    valor: '10.00',
    devedor: {
      cpf: '12345678901',
      nome: 'João da Silva'
    },
    chave: 'teste@inter.co', // Usar chave de teste
    expiracao: 3600
  }

  const cobData = { ...defaultData, ...data }
  const txid = pixClient.generateTxid('TEST')
  
  // Constrói objeto cob
  const cob = {
    calendario: {
      expiracao: cobData.expiracao
    },
    devedor: cobData.devedor,
    valor: {
      original: cobData.valor
    },
    chave: cobData.chave,
    infoAdicionais: [
      {
        nome: 'Teste',
        valor: 'Cobrança de teste via API'
      }
    ]
  }

  const response = await pixClient.createCob(txid, cob)
  
  return {
    txid,
    cob,
    response: response.data
  }
}

/**
 * Testa consulta de cobrança
 */
async function testGetCob(pixClient, data = {}) {
  const { txid } = data
  
  if (!txid) {
    throw new Error('txid é obrigatório para consultar cobrança')
  }

  const response = await pixClient.getCob(txid)
  
  return {
    txid,
    response: response.data
  }
}

/**
 * Testa listagem de cobranças
 */
async function testListCob(pixClient, data = {}) {
  // Busca cobranças dos últimos 30 dias por padrão
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  
  const params = PixHelpers.buildDateRangeParams(
    data.inicio || startDate.toISOString(),
    data.fim || endDate.toISOString()
  )
  
  // Adiciona paginação
  Object.assign(params, PixHelpers.buildPaginationParams(0, 10))
  
  const response = await pixClient.listCob(params)
  
  return {
    params,
    response: response.data
  }
}

/**
 * Testa criação de cobrança com vencimento
 */
async function testCreateCobv(pixClient, data = {}) {
  // Dados de teste padrão
  const defaultData = {
    valor: '25.00',
    devedor: {
      cpf: '12345678901', 
      nome: 'Maria da Silva'
    },
    chave: 'teste@inter.co',
    dataDeVencimento: PixHelpers.generateDueDate(7) // 7 dias
  }

  const cobvData = { ...defaultData, ...data }
  const txid = pixClient.generateTxid('TESTV')
  
  // Constrói objeto cobv
  const cobv = {
    calendario: {
      dataDeVencimento: cobvData.dataDeVencimento,
      validadeAposVencimento: 30
    },
    devedor: cobvData.devedor,
    valor: {
      original: cobvData.valor
    },
    chave: cobvData.chave,
    infoAdicionais: [
      {
        nome: 'Teste',
        valor: 'Cobrança com vencimento de teste'
      }
    ]
  }

  const response = await pixClient.createCobv(txid, cobv)
  
  return {
    txid,
    cobv,
    response: response.data
  }
}

/**
 * Testa consulta de PIX específico
 */
async function testGetPix(pixClient, data = {}) {
  const { e2eid } = data
  
  if (!e2eid) {
    throw new Error('e2eid é obrigatório para consultar PIX')
  }

  const response = await pixClient.getPix(e2eid)
  
  return {
    e2eid,
    response: response.data
  }
}

/**
 * Testa listagem de PIX recebidos
 */
async function testListPix(pixClient, data = {}) {
  // Busca PIX dos últimos 7 dias por padrão
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)
  
  const params = PixHelpers.buildDateRangeParams(
    data.inicio || startDate.toISOString(),
    data.fim || endDate.toISOString()
  )
  
  // Adiciona paginação
  Object.assign(params, PixHelpers.buildPaginationParams(0, 5))
  
  const response = await pixClient.listPix(params)
  
  return {
    params,
    response: response.data
  }
}
