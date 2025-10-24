const { validateMinimalConfig } = require('../../../lib/banco-inter')

exports.post = ({ appSdk }, req, res) => {
  /**
   * Requests coming from Modules API have two object properties on body: `params` and `application`.
   * `application` is a copy of your app installed by the merchant,
   * including the properties `data` and `hidden_data` with admin settings configured values.
   * JSON Schema reference for the List Payments module objects:
   * `params`: https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
   * `response`: https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
   */

  const { params, application } = req.body
  const { storeId } = req
  
  // Setup basic required response object
  const response = {
    payment_gateways: []
  }
  
  // Merge all app options configured by merchant
  const appData = Object.assign({}, application.data, application.hidden_data)

  try {
    // Validar configuração mínima antes de oferecer métodos de pagamento
    validateMinimalConfig(appData)
    
    // Verificar se o app está habilitado
    if (appData.enabled === false) {
      console.log('App Banco Inter desabilitado para a loja', storeId)
      return res.send(response)
    }

    // Dados básicos do intermediador
    const intermediator = {
      code: 'banco_inter',
      link: 'https://www.bancointer.com.br',
      name: 'Banco Inter'
    }

    // ========== PIX ==========
    if (appData.enable_pix !== false) {
      // PIX Imediato
      response.payment_gateways.push({
        intermediator,
        type: 'payment',
        payment_method: {
          code: 'account_deposit',
          name: 'PIX'
        },
        label: 'PIX - Pagamento Instantâneo',
        icon: 'https://logoeps.com/wp-content/uploads/2022/12/pix-vector-logo.png',
        text: 'Pague de forma rápida e segura com PIX',
        js_client: {
          script_uri: 'https://js.bancointer.com.br/pix/sdk.js',
          onload_expression: 'window.BancoInterPix && window.BancoInterPix.init()'
        }
      })

      // PIX com Vencimento (se configurado)
      const pixVencimentoDias = appData.pix_due_days || 1
      if (pixVencimentoDias > 0) {
        response.payment_gateways.push({
          intermediator,
          type: 'payment',
          payment_method: {
            code: 'account_deposit',
            name: 'PIX com Vencimento'
          },
          label: `PIX - Vencimento em ${pixVencimentoDias} dia${pixVencimentoDias > 1 ? 's' : ''}`,
          icon: 'https://logoeps.com/wp-content/uploads/2022/12/pix-vector-logo.png',
          text: 'PIX com data de vencimento',
          expiration_date: pixVencimentoDias
        })
      }
    }

    // ========== BOLETO COM PIX ==========
    if (appData.enable_boleto !== false) {
      const boletoDias = appData.boleto_expire_days || 7
      
      response.payment_gateways.push({
        intermediator,
        type: 'payment',
        payment_method: {
          code: 'banking_billet',
          name: 'Boleto Bancário'
        },
        label: 'Boleto com PIX',
        icon: 'https://static.bancointer.com.br/images/boleto-icon.svg',
        text: 'Boleto bancário com opção de pagamento via PIX',
        expiration_date: boletoDias,
        discount: appData.boleto_discount ? {
          type: 'percentage',
          value: appData.boleto_discount,
          min_amount: appData.boleto_discount_min_amount || 0
        } : undefined
      })
    }

    // ========== PIX AUTOMÁTICO (RECORRENTE) ==========
    if (appData.enable_pix_auto === true) {
      // Só oferece PIX automático para pedidos recorrentes/assinaturas
      const amount = params.amount
      const isRecurring = params.subscription_params || 
                         (amount && amount.recurring)

      if (isRecurring) {
        response.payment_gateways.push({
          intermediator,
          type: 'payment',
          payment_method: {
            code: 'account_deposit',
            name: 'PIX Automático'
          },
          label: 'PIX Automático - Pagamento Recorrente',
          icon: 'https://logoeps.com/wp-content/uploads/2022/12/pix-vector-logo.png',
          text: 'Débito automático via PIX para pagamentos recorrentes',
          recurring: true
        })
      }
    }

    // ========== CONFIGURAÇÕES ADICIONAIS ==========
    
    // Verificar valor mínimo
    const minAmount = appData.min_amount || 2.5
    if (params.amount && params.amount.total < minAmount) {
      console.log(`Valor do pedido (${params.amount.total}) menor que o mínimo (${minAmount})`)
      response.payment_gateways = []
    }

    // Verificar valor máximo
    const maxAmount = appData.max_amount || 99999999.99
    if (params.amount && params.amount.total > maxAmount) {
      console.log(`Valor do pedido (${params.amount.total}) maior que o máximo (${maxAmount})`)
      response.payment_gateways = []
    }

    // Verificar se tem métodos disponíveis
    if (response.payment_gateways.length === 0) {
      console.log('Nenhum método de pagamento disponível para os parâmetros fornecidos')
    }

  } catch (error) {
    console.error('Erro ao listar métodos de pagamento Banco Inter:', error)
    // Em caso de erro, não oferece métodos de pagamento
    response.payment_gateways = []
  }

  res.send(response)
}
