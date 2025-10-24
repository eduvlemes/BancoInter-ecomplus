const BancoInterClient = require('./client')

/**
 * Cliente para API PIX do Banco Inter
 * Suporta cobranças imediatas (cob), cobranças com vencimento (cobv) e gerenciamento de PIX
 */
class PixClient extends BancoInterClient {
  constructor(appData, storeId, isSandbox = true) {
    super(appData, storeId, isSandbox)
  }

  // ==================== COBRANÇAS IMEDIATAS (COB) ====================

  /**
   * Criar cobrança imediata
   * PUT /cob/{txid}
   */
  async createCob(txid, cobData) {
    const endpoint = `/cob/${txid}`
    return this.pixRequest(endpoint, 'PUT', cobData)
  }

  /**
   * Consultar cobrança imediata específica
   * GET /cob/{txid}
   */
  async getCob(txid, revisao = null) {
    let endpoint = `/cob/${txid}`
    if (revisao) {
      endpoint += `?revisao=${revisao}`
    }
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Listar cobranças imediatas
   * GET /cob
   */
  async listCob(params = {}) {
    const queryParams = new URLSearchParams()
    
    // Parâmetros obrigatórios
    if (params.inicio) queryParams.append('inicio', params.inicio)
    if (params.fim) queryParams.append('fim', params.fim)
    
    // Parâmetros opcionais
    if (params.cpf) queryParams.append('cpf', params.cpf)
    if (params.cnpj) queryParams.append('cnpj', params.cnpj)
    if (params.locationPresente !== undefined) {
      queryParams.append('locationPresente', params.locationPresente)
    }
    if (params.status) queryParams.append('status', params.status)
    if (params.loteCobVId) queryParams.append('loteCobVId', params.loteCobVId)
    
    // Paginação
    if (params.paginacao) {
      if (params.paginacao.paginaAtual !== undefined) {
        queryParams.append('paginacao.paginaAtual', params.paginacao.paginaAtual)
      }
      if (params.paginacao.itensPorPagina !== undefined) {
        queryParams.append('paginacao.itensPorPagina', params.paginacao.itensPorPagina)
      }
    }

    const endpoint = `/cob?${queryParams.toString()}`
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Alterar cobrança imediata
   * PATCH /cob/{txid}
   */
  async updateCob(txid, updateData) {
    const endpoint = `/cob/${txid}`
    return this.pixRequest(endpoint, 'PATCH', updateData)
  }

  // ==================== COBRANÇAS COM VENCIMENTO (COBV) ====================

  /**
   * Criar cobrança com vencimento
   * PUT /cobv/{txid}
   */
  async createCobv(txid, cobvData) {
    const endpoint = `/cobv/${txid}`
    return this.pixRequest(endpoint, 'PUT', cobvData)
  }

  /**
   * Consultar cobrança com vencimento específica
   * GET /cobv/{txid}
   */
  async getCobv(txid, revisao = null) {
    let endpoint = `/cobv/${txid}`
    if (revisao) {
      endpoint += `?revisao=${revisao}`
    }
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Listar cobranças com vencimento
   * GET /cobv
   */
  async listCobv(params = {}) {
    const queryParams = new URLSearchParams()
    
    // Parâmetros obrigatórios
    if (params.inicio) queryParams.append('inicio', params.inicio)
    if (params.fim) queryParams.append('fim', params.fim)
    
    // Parâmetros opcionais
    if (params.cpf) queryParams.append('cpf', params.cpf)
    if (params.cnpj) queryParams.append('cnpj', params.cnpj)
    if (params.locationPresente !== undefined) {
      queryParams.append('locationPresente', params.locationPresente)
    }
    if (params.status) queryParams.append('status', params.status)
    if (params.loteCobVId) queryParams.append('loteCobVId', params.loteCobVId)
    
    // Paginação
    if (params.paginacao) {
      if (params.paginacao.paginaAtual !== undefined) {
        queryParams.append('paginacao.paginaAtual', params.paginacao.paginaAtual)
      }
      if (params.paginacao.itensPorPagina !== undefined) {
        queryParams.append('paginacao.itensPorPagina', params.paginacao.itensPorPagina)
      }
    }

    const endpoint = `/cobv?${queryParams.toString()}`
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Alterar cobrança com vencimento
   * PATCH /cobv/{txid}
   */
  async updateCobv(txid, updateData) {
    const endpoint = `/cobv/${txid}`
    return this.pixRequest(endpoint, 'PATCH', updateData)
  }

  // ==================== LOTES DE COBRANÇA COM VENCIMENTO ====================

  /**
   * Criar lote de cobranças com vencimento
   * PUT /lotecobv/{id}
   */
  async createLoteCobv(id, loteData) {
    const endpoint = `/lotecobv/${id}`
    return this.pixRequest(endpoint, 'PUT', loteData)
  }

  /**
   * Consultar lote de cobranças com vencimento
   * GET /lotecobv/{id}
   */
  async getLoteCobv(id) {
    const endpoint = `/lotecobv/${id}`
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Listar lotes de cobranças com vencimento
   * GET /lotecobv
   */
  async listLoteCobv(params = {}) {
    const queryParams = new URLSearchParams()
    
    // Parâmetros obrigatórios
    if (params.inicio) queryParams.append('inicio', params.inicio)
    if (params.fim) queryParams.append('fim', params.fim)
    
    // Paginação
    if (params.paginacao) {
      if (params.paginacao.paginaAtual !== undefined) {
        queryParams.append('paginacao.paginaAtual', params.paginacao.paginaAtual)
      }
      if (params.paginacao.itensPorPagina !== undefined) {
        queryParams.append('paginacao.itensPorPagina', params.paginacao.itensPorPagina)
      }
    }

    const endpoint = `/lotecobv?${queryParams.toString()}`
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Alterar lote de cobranças com vencimento
   * PATCH /lotecobv/{id}
   */
  async updateLoteCobv(id, updateData) {
    const endpoint = `/lotecobv/${id}`
    return this.pixRequest(endpoint, 'PATCH', updateData)
  }

  // ==================== LOCATIONS ====================

  /**
   * Criar location
   * POST /loc
   */
  async createLocation(locationData) {
    return this.pixRequest('/loc', 'POST', locationData)
  }

  /**
   * Consultar location específica
   * GET /loc/{id}
   */
  async getLocation(id) {
    const endpoint = `/loc/${id}`
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Listar locations
   * GET /loc
   */
  async listLocations(params = {}) {
    const queryParams = new URLSearchParams()
    
    // Parâmetros obrigatórios
    if (params.inicio) queryParams.append('inicio', params.inicio)
    if (params.fim) queryParams.append('fim', params.fim)
    
    // Parâmetros opcionais
    if (params.txIdPresente !== undefined) {
      queryParams.append('txIdPresente', params.txIdPresente)
    }
    if (params.tipoCob) queryParams.append('tipoCob', params.tipoCob)
    
    // Paginação
    if (params.paginacao) {
      if (params.paginacao.paginaAtual !== undefined) {
        queryParams.append('paginacao.paginaAtual', params.paginacao.paginaAtual)
      }
      if (params.paginacao.itensPorPagina !== undefined) {
        queryParams.append('paginacao.itensPorPagina', params.paginacao.itensPorPagina)
      }
    }

    const endpoint = `/loc?${queryParams.toString()}`
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Desvincular cobrança de location
   * DELETE /loc/{id}/txid
   */
  async unlinkLocationFromTxid(id) {
    const endpoint = `/loc/${id}/txid`
    return this.pixRequest(endpoint, 'DELETE')
  }

  // ==================== PIX RECEBIDOS ====================

  /**
   * Consultar PIX recebidos
   * GET /pix
   */
  async listPix(params = {}) {
    const queryParams = new URLSearchParams()
    
    // Parâmetros obrigatórios
    if (params.inicio) queryParams.append('inicio', params.inicio)
    if (params.fim) queryParams.append('fim', params.fim)
    
    // Parâmetros opcionais
    if (params.txid) queryParams.append('txid', params.txid)
    if (params.txIdPresente !== undefined) {
      queryParams.append('txIdPresente', params.txIdPresente)
    }
    if (params.devolucaoPresente !== undefined) {
      queryParams.append('devolucaoPresente', params.devolucaoPresente)
    }
    if (params.cpf) queryParams.append('cpf', params.cpf)
    if (params.cnpj) queryParams.append('cnpj', params.cnpj)
    
    // Paginação
    if (params.paginacao) {
      if (params.paginacao.paginaAtual !== undefined) {
        queryParams.append('paginacao.paginaAtual', params.paginacao.paginaAtual)
      }
      if (params.paginacao.itensPorPagina !== undefined) {
        queryParams.append('paginacao.itensPorPagina', params.paginacao.itensPorPagina)
      }
    }

    const endpoint = `/pix?${queryParams.toString()}`
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Consultar PIX específico
   * GET /pix/{e2eid}
   */
  async getPix(e2eid) {
    const endpoint = `/pix/${e2eid}`
    return this.pixRequest(endpoint, 'GET')
  }

  // ==================== DEVOLUÇÕES ====================

  /**
   * Solicitar devolução
   * PUT /pix/{e2eid}/devolucao/{id}
   */
  async createDevolucao(e2eid, id, devolucaoData) {
    const endpoint = `/pix/${e2eid}/devolucao/${id}`
    return this.pixRequest(endpoint, 'PUT', devolucaoData)
  }

  /**
   * Consultar devolução
   * GET /pix/{e2eid}/devolucao/{id}
   */
  async getDevolucao(e2eid, id) {
    const endpoint = `/pix/${e2eid}/devolucao/${id}`
    return this.pixRequest(endpoint, 'GET')
  }

  // ==================== WEBHOOKS ====================

  /**
   * Configurar webhook
   * PUT /webhook/{chave}
   */
  async setWebhook(chave, webhookData) {
    const endpoint = `/webhook/${chave}`
    return this.pixRequest(endpoint, 'PUT', webhookData)
  }

  /**
   * Consultar webhook
   * GET /webhook/{chave}
   */
  async getWebhook(chave) {
    const endpoint = `/webhook/${chave}`
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Listar webhooks
   * GET /webhook
   */
  async listWebhooks(params = {}) {
    const queryParams = new URLSearchParams()
    
    // Parâmetros obrigatórios
    if (params.inicio) queryParams.append('inicio', params.inicio)
    if (params.fim) queryParams.append('fim', params.fim)
    
    // Paginação
    if (params.paginacao) {
      if (params.paginacao.paginaAtual !== undefined) {
        queryParams.append('paginacao.paginaAtual', params.paginacao.paginaAtual)
      }
      if (params.paginacao.itensPorPagina !== undefined) {
        queryParams.append('paginacao.itensPorPagina', params.paginacao.itensPorPagina)
      }
    }

    const endpoint = `/webhook?${queryParams.toString()}`
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Remover webhook
   * DELETE /webhook/{chave}
   */
  async deleteWebhook(chave) {
    const endpoint = `/webhook/${chave}`
    return this.pixRequest(endpoint, 'DELETE')
  }

  // ==================== PAYLOADS ====================

  /**
   * Consultar payload via location
   * GET /{pixUrlAccessToken}
   */
  async getPayloadFromLocation(pixUrlAccessToken) {
    const endpoint = `/${pixUrlAccessToken}`
    return this.pixRequest(endpoint, 'GET')
  }

  /**
   * Consultar payload de cobrança com vencimento via location
   * GET /cobv/{pixUrlAccessToken}
   */
  async getPayloadCobvFromLocation(pixUrlAccessToken, params = {}) {
    let endpoint = `/cobv/${pixUrlAccessToken}`
    
    const queryParams = new URLSearchParams()
    if (params.codMun) queryParams.append('codMun', params.codMun)
    if (params.DPP) queryParams.append('DPP', params.DPP)
    
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`
    }
    
    return this.pixRequest(endpoint, 'GET')
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Gera um txid único
   */
  generateTxid(prefix = 'TXN') {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `${prefix}${timestamp}${random}`.substring(0, 35).toUpperCase()
  }

  /**
   * Valida formato de um txid
   */
  validateTxid(txid) {
    if (!txid || typeof txid !== 'string') {
      return false
    }
    
    // Txid deve ter entre 26 e 35 caracteres alfanuméricos
    const regex = /^[A-Za-z0-9]{26,35}$/
    return regex.test(txid)
  }

  /**
   * Formata timestamp para ISO string com timezone
   */
  formatTimestamp(date = new Date()) {
    return date.toISOString()
  }

  /**
   * Valida valor monetário (em centavos)
   */
  validateValue(value) {
    if (typeof value === 'string') {
      // Converte string para número
      value = parseFloat(value)
    }
    
    return Number.isFinite(value) && value > 0 && value <= 99999999.99
  }

  /**
   * Converte valor de reais para string formatada
   */
  formatValue(value) {
    if (typeof value === 'number') {
      return value.toFixed(2)
    }
    return value
  }
}

module.exports = PixClient