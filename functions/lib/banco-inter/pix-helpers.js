/**
 * Helpers para construir objetos de cobrança PIX
 * baseados em pedidos da E-Com Plus
 */

class PixHelpers {
  
  /**
   * Constrói objeto de cobrança imediata (cob) a partir de um pedido E-Com Plus
   */
  static buildCobFromOrder(order, appData, options = {}) {
    const {
      chave,
      expiracao = 3600, // 1 hora por padrão
      solicitacaoPagador,
      infoAdicionais = []
    } = options

    // Validações
    if (!chave) {
      throw new Error('Chave PIX é obrigatória')
    }

    if (!order.amount || !order.amount.total) {
      throw new Error('Valor do pedido é obrigatório')
    }

    // Monta devedor a partir dos dados do cliente
    const devedor = this.buildDevedorFromOrder(order)

    // Valor da cobrança
    const valor = {
      original: this.formatMoney(order.amount.total)
    }

    // Informações adicionais padrão
    const defaultInfoAdicionais = [
      {
        nome: 'Pedido',
        valor: order.number?.toString() || order._id
      }
    ]

    if (order.domain) {
      defaultInfoAdicionais.push({
        nome: 'Loja',
        valor: order.domain
      })
    }

    const cob = {
      calendario: {
        expiracao
      },
      devedor,
      valor,
      chave,
      infoAdicionais: [...defaultInfoAdicionais, ...infoAdicionais]
    }

    // Adiciona solicitação do pagador se fornecida
    if (solicitacaoPagador) {
      cob.solicitacaoPagador = solicitacaoPagador
    }

    return cob
  }

  /**
   * Constrói objeto de cobrança com vencimento (cobv) a partir de um pedido E-Com Plus
   */
  static buildCobvFromOrder(order, appData, options = {}) {
    const {
      chave,
      dataDeVencimento,
      validadeAposVencimento = 30,
      solicitacaoPagador,
      infoAdicionais = [],
      multa,
      juros,
      desconto,
      abatimento
    } = options

    // Validações
    if (!chave) {
      throw new Error('Chave PIX é obrigatória')
    }

    if (!dataDeVencimento) {
      throw new Error('Data de vencimento é obrigatória para cobv')
    }

    if (!order.amount || !order.amount.total) {
      throw new Error('Valor do pedido é obrigatório')
    }

    // Monta devedor a partir dos dados do cliente
    const devedor = this.buildDevedorFromOrder(order)

    // Valor da cobrança
    const valor = {
      original: this.formatMoney(order.amount.total)
    }

    // Adiciona configurações de multa, juros, etc se fornecidas
    if (multa) valor.multa = multa
    if (juros) valor.juros = juros
    if (desconto) valor.desconto = desconto
    if (abatimento) valor.abatimento = abatimento

    // Informações adicionais padrão
    const defaultInfoAdicionais = [
      {
        nome: 'Pedido',
        valor: order.number?.toString() || order._id
      }
    ]

    if (order.domain) {
      defaultInfoAdicionais.push({
        nome: 'Loja',
        valor: order.domain
      })
    }

    const cobv = {
      calendario: {
        dataDeVencimento,
        validadeAposVencimento
      },
      devedor,
      valor,
      chave,
      infoAdicionais: [...defaultInfoAdicionais, ...infoAdicionais]
    }

    // Adiciona solicitação do pagador se fornecida
    if (solicitacaoPagador) {
      cobv.solicitacaoPagador = solicitacaoPagador
    }

    return cobv
  }

  /**
   * Constrói objeto devedor a partir dos dados do pedido
   */
  static buildDevedorFromOrder(order) {
    const buyer = order.buyers?.[0]
    
    if (!buyer) {
      throw new Error('Dados do comprador não encontrados no pedido')
    }

    const devedor = {
      nome: buyer.name
    }

    // CPF ou CNPJ
    if (buyer.doc_number) {
      const docNumber = buyer.doc_number.replace(/\D/g, '')
      
      if (docNumber.length === 11) {
        devedor.cpf = docNumber
      } else if (docNumber.length === 14) {
        devedor.cnpj = docNumber
      }
    }

    // Email se disponível
    if (buyer.main_email) {
      devedor.email = buyer.main_email
    }

    return devedor
  }

  /**
   * Formata valor monetário para o padrão da API PIX
   */
  static formatMoney(value) {
    if (typeof value === 'number') {
      return value.toFixed(2)
    }
    
    if (typeof value === 'string') {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) {
        throw new Error('Valor inválido')
      }
      return numValue.toFixed(2)
    }
    
    throw new Error('Tipo de valor inválido')
  }

  /**
   * Gera data de vencimento baseada em dias úteis
   */
  static generateDueDate(days = 3) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    
    // Formata para YYYY-MM-DD
    return date.toISOString().split('T')[0]
  }

  /**
   * Valida se uma data de vencimento é válida (não pode ser passada)
   */
  static validateDueDate(dateString) {
    const dueDate = new Date(dateString + 'T00:00:00.000Z')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return dueDate >= today
  }

  /**
   * Constrói parâmetros de consulta para listar cobranças por período
   */
  static buildDateRangeParams(startDate, endDate, extraParams = {}) {
    const params = {
      inicio: startDate instanceof Date ? startDate.toISOString() : startDate,
      fim: endDate instanceof Date ? endDate.toISOString() : endDate,
      ...extraParams
    }

    return params
  }

  /**
   * Constrói parâmetros de paginação
   */
  static buildPaginationParams(page = 0, itemsPerPage = 100) {
    return {
      paginacao: {
        paginaAtual: page,
        itensPorPagina: Math.min(itemsPerPage, 1000) // API tem limite
      }
    }
  }

  /**
   * Extrai informações relevantes de uma resposta de cobrança para a E-Com Plus
   */
  static extractPaymentInfo(cobResponse) {
    const { data } = cobResponse
    
    const paymentInfo = {
      txid: data.txid,
      status: data.status,
      valor: data.valor?.original,
      devedor: data.devedor
    }

    // Informações específicas de cada tipo
    if (data.calendario) {
      if (data.calendario.expiracao) {
        paymentInfo.expiracao = data.calendario.expiracao
      }
      if (data.calendario.dataDeVencimento) {
        paymentInfo.dataVencimento = data.calendario.dataDeVencimento
      }
    }

    // Location para QR Code
    if (data.loc) {
      paymentInfo.location = data.loc
    }

    // PIX Copia e Cola se disponível
    if (data.pixCopiaECola) {
      paymentInfo.pixCopiaECola = data.pixCopiaECola
    }

    return paymentInfo
  }

  /**
   * Mapeia status da API PIX para status da E-Com Plus
   */
  static mapPixStatusToEcom(pixStatus) {
    const statusMap = {
      'ATIVA': 'pending',
      'CONCLUIDA': 'paid',
      'REMOVIDA_PELO_USUARIO_RECEBEDOR': 'cancelled',
      'REMOVIDA_PELO_PSP': 'cancelled'
    }

    return statusMap[pixStatus] || 'pending'
  }

  /**
   * Valida dados mínimos para criar uma cobrança
   */
  static validateOrderForPix(order) {
    const errors = []

    if (!order.amount?.total) {
      errors.push('Valor do pedido é obrigatório')
    }

    if (!order.buyers?.[0]) {
      errors.push('Dados do comprador são obrigatórios')
    }

    const buyer = order.buyers?.[0]
    if (buyer && !buyer.name) {
      errors.push('Nome do comprador é obrigatório')
    }

    if (buyer && !buyer.doc_number) {
      errors.push('CPF/CNPJ do comprador é obrigatório')
    }

    if (errors.length > 0) {
      throw new Error(`Dados inválidos para PIX: ${errors.join(', ')}`)
    }

    return true
  }
}

module.exports = PixHelpers