const BancoInterClient = require('./client')

/**
 * Cliente para API de Cobrança (Boleto com PIX) do Banco Inter
 */
class CobrancaClient extends BancoInterClient {
  constructor(appData, storeId, isSandbox = true) {
    super(appData, storeId, isSandbox)
  }

  // ==================== COBRANÇAS ====================

  /**
   * Recuperar coleção de cobranças
   * GET /cobrancas
   */
  async listCobrancas(params = {}) {
    const queryParams = new URLSearchParams()
    
    // Parâmetros obrigatórios
    if (params.dataInicial) queryParams.append('dataInicial', params.dataInicial)
    if (params.dataFinal) queryParams.append('dataFinal', params.dataFinal)
    
    // Parâmetros opcionais
    if (params.filtrarDataPor) queryParams.append('filtrarDataPor', params.filtrarDataPor)
    if (params.situacao) queryParams.append('situacao', params.situacao)
    if (params.pessoaPagadora) queryParams.append('pessoaPagadora', params.pessoaPagadora)
    if (params.cpfCnpjPessoaPagadora) queryParams.append('cpfCnpjPessoaPagadora', params.cpfCnpjPessoaPagadora)
    if (params.seuNumero) queryParams.append('seuNumero', params.seuNumero)
    if (params.tipoCobranca) queryParams.append('tipoCobranca', params.tipoCobranca)
    if (params.ordenarPor) queryParams.append('ordenarPor', params.ordenarPor)
    if (params.tipoOrdenacao) queryParams.append('tipoOrdenacao', params.tipoOrdenacao)
    
    // Paginação
    if (params.paginacao) {
      if (params.paginacao.itensPorPagina !== undefined) {
        queryParams.append('paginacao.itensPorPagina', params.paginacao.itensPorPagina)
      }
      if (params.paginacao.paginaAtual !== undefined) {
        queryParams.append('paginacao.paginaAtual', params.paginacao.paginaAtual)
      }
    }

    const endpoint = `/cobrancas?${queryParams.toString()}`
    return this.cobrancaRequest(endpoint, 'GET')
  }

  /**
   * Emitir cobrança
   * POST /cobrancas
   */
  async createCobranca(cobrancaData) {
    return this.cobrancaRequest('/cobrancas', 'POST', cobrancaData)
  }

  /**
   * Recuperar cobrança específica
   * GET /cobrancas/{codigoSolicitacao}
   */
  async getCobranca(codigoSolicitacao) {
    const endpoint = `/cobrancas/${codigoSolicitacao}`
    return this.cobrancaRequest(endpoint, 'GET')
  }

  /**
   * Editar cobrança
   * PATCH /cobrancas/{codigoSolicitacao}
   */
  async updateCobranca(codigoSolicitacao, updateData) {
    const endpoint = `/cobrancas/${codigoSolicitacao}`
    return this.cobrancaRequest(endpoint, 'PATCH', updateData)
  }

  /**
   * Consultar status da edição da cobrança
   * GET /cobrancas/edicao/{codigoEdicao}
   */
  async getEdicaoStatus(codigoEdicao) {
    const endpoint = `/cobrancas/edicao/${codigoEdicao}`
    return this.cobrancaRequest(endpoint, 'GET')
  }

  /**
   * Recuperar cobrança em PDF
   * GET /cobrancas/{codigoSolicitacao}/pdf
   */
  async getCobrancaPdf(codigoSolicitacao) {
    const endpoint = `/cobrancas/${codigoSolicitacao}/pdf`
    return this.cobrancaRequest(endpoint, 'GET')
  }

  /**
   * Cancelar cobrança
   * POST /cobrancas/{codigoSolicitacao}/cancelar
   */
  async cancelCobranca(codigoSolicitacao, motivoCancelamento) {
    const endpoint = `/cobrancas/${codigoSolicitacao}/cancelar`
    const data = { motivoCancelamento }
    return this.cobrancaRequest(endpoint, 'POST', data)
  }

  /**
   * Recuperar sumário de cobranças
   * GET /cobrancas/sumario
   */
  async getSumarioCobrancas(params = {}) {
    const queryParams = new URLSearchParams()
    
    // Parâmetros obrigatórios
    if (params.dataInicial) queryParams.append('dataInicial', params.dataInicial)
    if (params.dataFinal) queryParams.append('dataFinal', params.dataFinal)
    
    // Parâmetros opcionais
    if (params.filtrarDataPor) queryParams.append('filtrarDataPor', params.filtrarDataPor)
    if (params.situacao) queryParams.append('situacao', params.situacao)
    if (params.tipoCobranca) queryParams.append('tipoCobranca', params.tipoCobranca)
    if (params.seuNumero) queryParams.append('seuNumero', params.seuNumero)
    if (params.pessoaPagadora) queryParams.append('pessoaPagadora', params.pessoaPagadora)
    if (params.cpfCnpjPessoaPagadora) queryParams.append('cpfCnpjPessoaPagadora', params.cpfCnpjPessoaPagadora)

    const endpoint = `/cobrancas/sumario?${queryParams.toString()}`
    return this.cobrancaRequest(endpoint, 'GET')
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Gera número sequencial para "seuNumero"
   */
  generateSeuNumero(prefix = 'CB') {
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `${prefix}${timestamp}${random}`.substring(0, 15)
  }

  /**
   * Valida dados mínimos para criar cobrança
   */
  validateCobrancaData(data) {
    const errors = []

    if (!data.seuNumero) {
      errors.push('seuNumero é obrigatório')
    }

    if (!data.valorNominal || data.valorNominal < 2.5 || data.valorNominal > 99999999.99) {
      errors.push('valorNominal deve estar entre 2.50 e 99999999.99')
    }

    if (!data.dataVencimento) {
      errors.push('dataVencimento é obrigatória')
    }

    if (data.numDiasAgenda === undefined || data.numDiasAgenda < 0 || data.numDiasAgenda > 60) {
      errors.push('numDiasAgenda deve estar entre 0 e 60')
    }

    if (!data.pagador) {
      errors.push('dados do pagador são obrigatórios')
    } else {
      if (!data.pagador.cpfCnpj) {
        errors.push('CPF/CNPJ do pagador é obrigatório')
      }
      if (!data.pagador.nome) {
        errors.push('nome do pagador é obrigatório')
      }
    }

    if (errors.length > 0) {
      throw new Error(`Dados inválidos para cobrança: ${errors.join(', ')}`)
    }

    return true
  }

  /**
   * Valida data de vencimento
   */
  validateDataVencimento(dataVencimento) {
    const vencimento = new Date(dataVencimento + 'T00:00:00.000Z')
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    if (vencimento < hoje) {
      throw new Error('Data de vencimento não pode ser anterior a hoje')
    }

    return true
  }

  /**
   * Formata valor monetário
   */
  formatValue(value) {
    if (typeof value === 'number') {
      return parseFloat(value.toFixed(2))
    }
    
    if (typeof value === 'string') {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) {
        throw new Error('Valor inválido')
      }
      return parseFloat(numValue.toFixed(2))
    }
    
    throw new Error('Tipo de valor inválido')
  }

  /**
   * Mapeia situação da cobrança para status E-Com Plus
   */
  mapSituacaoToEcomStatus(situacao) {
    const statusMap = {
      'RECEBIDO': 'paid',
      'MARCADO_RECEBIDO': 'paid',
      'A_RECEBER': 'pending',
      'EM_PROCESSAMENTO': 'pending',
      'ATRASADO': 'pending',
      'CANCELADO': 'cancelled',
      'EXPIRADO': 'cancelled',
      'FALHA_EMISSAO': 'cancelled'
    }

    return statusMap[situacao] || 'pending'
  }

  /**
   * Gera data de vencimento baseada em dias
   */
  generateDueDate(days = 3) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  /**
   * Constrói parâmetros de consulta para período
   */
  buildDateRangeParams(startDate, endDate, extraParams = {}) {
    return {
      dataInicial: startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate,
      dataFinal: endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate,
      ...extraParams
    }
  }

  /**
   * Constrói parâmetros de paginação
   */
  buildPaginationParams(page = 0, itemsPerPage = 100) {
    return {
      paginacao: {
        paginaAtual: page,
        itensPorPagina: Math.min(itemsPerPage, 1000)
      }
    }
  }
}

module.exports = CobrancaClient