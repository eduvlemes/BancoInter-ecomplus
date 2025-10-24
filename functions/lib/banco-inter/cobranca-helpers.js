/**
 * Helpers para construir objetos de cobrança (Boleto com PIX)
 * baseados em pedidos da E-Com Plus
 */

class CobrancaHelpers {
  
  /**
   * Constrói objeto de cobrança a partir de um pedido E-Com Plus
   */
  static buildCobrancaFromOrder(order, appData, options = {}) {
    const {
      numDiasAgenda = 30,
      seuNumero,
      mensagem,
      desconto,
      multa,
      mora,
      beneficiarioFinal,
      formasRecebimento = ['BOLETO', 'PIX']
    } = options

    // Validações
    if (!order.amount || !order.amount.total) {
      throw new Error('Valor do pedido é obrigatório')
    }

    if (order.amount.total < 2.5) {
      throw new Error('Valor mínimo para cobrança é R$ 2,50')
    }

    // Monta pagador a partir dos dados do cliente
    const pagador = this.buildPagadorFromOrder(order)

    // Gera data de vencimento baseada na configuração do app
    const diasVencimento = appData.boleto_expire_days || 7
    const dataVencimento = this.generateDueDate(diasVencimento)

    const cobranca = {
      seuNumero: seuNumero || this.generateSeuNumero(order),
      valorNominal: this.formatValue(order.amount.total),
      dataVencimento,
      numDiasAgenda,
      pagador,
      formasRecebimento
    }

    // Adiciona configurações opcionais se fornecidas
    if (desconto) cobranca.desconto = desconto
    if (multa) cobranca.multa = multa  
    if (mora) cobranca.mora = mora
    if (beneficiarioFinal) cobranca.beneficiarioFinal = beneficiarioFinal

    // Mensagem padrão ou personalizada
    if (mensagem) {
      cobranca.mensagem = mensagem
    } else {
      cobranca.mensagem = this.buildDefaultMessage(order)
    }

    return cobranca
  }

  /**
   * Constrói objeto pagador a partir dos dados do pedido
   */
  static buildPagadorFromOrder(order) {
    const buyer = order.buyers?.[0]
    const shippingAddress = order.shipping_lines?.[0]?.to
    
    if (!buyer) {
      throw new Error('Dados do comprador não encontrados no pedido')
    }

    const pagador = {
      nome: buyer.name
    }

    // CPF ou CNPJ
    if (buyer.doc_number) {
      const docNumber = buyer.doc_number.replace(/\D/g, '')
      pagador.cpfCnpj = docNumber
      pagador.tipoPessoa = docNumber.length === 11 ? 'FISICA' : 'JURIDICA'
    } else {
      throw new Error('CPF/CNPJ do comprador é obrigatório')
    }

    // Email se disponível
    if (buyer.main_email) {
      pagador.email = buyer.main_email
    }

    // Telefone
    if (buyer.phones?.[0]) {
      const phone = buyer.phones[0]
      if (phone.country_code === 55 && phone.number) {
        // Extrai DDD e número
        const fullNumber = phone.number.replace(/\D/g, '')
        if (fullNumber.length >= 10) {
          pagador.ddd = fullNumber.substring(0, 2)
          pagador.telefone = fullNumber.substring(2)
        }
      }
    }

    // Endereço (prioriza endereço de entrega, senão usa endereço de cobrança)
    const address = shippingAddress || buyer.address

    if (address) {
      pagador.endereco = this.buildEnderecoString(address)
      pagador.bairro = address.borough || 'Centro'
      pagador.cidade = address.city || ''
      pagador.uf = address.province_code || address.province || ''
      pagador.cep = address.zip ? address.zip.replace(/\D/g, '') : ''
      
      if (address.number) {
        pagador.numero = address.number.toString()
      }
      
      if (address.complement) {
        pagador.complemento = address.complement
      }
    }

    return pagador
  }

  /**
   * Constrói string de endereço
   */
  static buildEnderecoString(address) {
    const parts = []
    
    if (address.street) parts.push(address.street)
    if (address.number) parts.push(address.number)
    
    return parts.join(', ') || 'Endereço não informado'
  }

  /**
   * Constrói mensagem padrão para o boleto
   */
  static buildDefaultMessage(order) {
    const lines = []
    
    // Linha 1: Pedido
    if (order.number) {
      lines.push(`Pedido: ${order.number}`)
    } else {
      lines.push(`Pedido: ${order._id.substring(0, 8)}`)
    }
    
    // Linha 2: Loja
    if (order.domain) {
      lines.push(`Loja: ${order.domain}`)
    }
    
    // Linha 3: Data do pedido
    if (order.created_at) {
      const date = new Date(order.created_at).toLocaleDateString('pt-BR')
      lines.push(`Data: ${date}`)
    }
    
    // Linha 4: Instrução
    lines.push('Pagamento via PIX disponível no boleto')
    
    // Linha 5: Vazia ou informação adicional
    lines.push('')

    // Retorna nas 5 linhas permitidas
    return {
      linha1: lines[0] || '',
      linha2: lines[1] || '',
      linha3: lines[2] || '',
      linha4: lines[3] || '',
      linha5: lines[4] || ''
    }
  }

  /**
   * Gera "seuNumero" baseado no pedido
   */
  static generateSeuNumero(order) {
    if (order.number) {
      // Usa número do pedido se disponível, limitado a 15 caracteres
      return `PED${order.number}`.substring(0, 15)
    }
    
    // Senão usa parte do ID do pedido
    const orderId = order._id.substring(0, 8).toUpperCase()
    return `ORD${orderId}`
  }

  /**
   * Gera data de vencimento
   */
  static generateDueDate(days = 7) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  /**
   * Formata valor monetário
   */
  static formatValue(value) {
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
   * Constrói configuração de desconto
   */
  static buildDesconto(type = 'PERCENTUALDATAINFORMADA', taxa = 5, quantidadeDias = 3) {
    return {
      codigo: type,
      taxa,
      quantidadeDias
    }
  }

  /**
   * Constrói configuração de multa
   */
  static buildMulta(taxa = 2) {
    return {
      codigo: 'PERCENTUAL',
      taxa
    }
  }

  /**
   * Constrói configuração de mora
   */
  static buildMora(taxa = 1) {
    return {
      codigo: 'TAXAMENSAL',
      taxa
    }
  }

  /**
   * Extrai informações relevantes de uma resposta de cobrança
   */
  static extractPaymentInfo(cobrancaResponse) {
    const { data } = cobrancaResponse
    
    const paymentInfo = {
      codigoSolicitacao: data.codigoSolicitacao
    }

    // Informações da cobrança se já processada
    if (data.cobranca) {
      paymentInfo.seuNumero = data.cobranca.seuNumero
      paymentInfo.situacao = data.cobranca.situacao
      paymentInfo.valorNominal = data.cobranca.valorNominal
      paymentInfo.dataVencimento = data.cobranca.dataVencimento
    }

    // Informações do boleto
    if (data.boleto) {
      paymentInfo.boleto = {
        nossoNumero: data.boleto.nossoNumero,
        codigoBarras: data.boleto.codigoBarras,
        linhaDigitavel: data.boleto.linhaDigitavel
      }
    }

    // Informações do PIX
    if (data.pix) {
      paymentInfo.pix = {
        txid: data.pix.txid,
        pixCopiaECola: data.pix.pixCopiaECola
      }
    }

    return paymentInfo
  }

  /**
   * Valida dados mínimos do pedido para cobrança
   */
  static validateOrderForCobranca(order) {
    const errors = []

    if (!order.amount?.total) {
      errors.push('Valor do pedido é obrigatório')
    }

    if (order.amount?.total < 2.5) {
      errors.push('Valor mínimo para cobrança é R$ 2,50')
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
      throw new Error(`Dados inválidos para cobrança: ${errors.join(', ')}`)
    }

    return true
  }

  /**
   * Constrói parâmetros de consulta para período
   */
  static buildDateRangeParams(startDate, endDate, extraParams = {}) {
    return {
      dataInicial: startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate,
      dataFinal: endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate,
      ...extraParams
    }
  }

  /**
   * Constrói parâmetros de paginação
   */
  static buildPaginationParams(page = 0, itemsPerPage = 100) {
    return {
      paginacao: {
        paginaAtual: page,
        itensPorPagina: Math.min(itemsPerPage, 1000)
      }
    }
  }
}

module.exports = CobrancaHelpers