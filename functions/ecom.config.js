/* eslint-disable comma-dangle, no-multi-spaces, key-spacing, quotes, quote-props */

/**
 * Edit base E-Com Plus Application object here.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/applications/
 */

const app = {
  app_id: 9000,
  title: 'Banco Inter (Boleto e Pix)',
  slug: 'banco-inter-boleto-pix',
  type: 'external',
  state: 'active',
  authentication: true,

  /**
   * Uncomment modules above to work with E-Com Plus Mods API on Storefront.
   * Ref.: https://developers.e-com.plus/modules-api/
   */
  modules: {
    /**
     * Triggered to calculate shipping options, must return values and deadlines.
     * Start editing `routes/ecom/modules/calculate-shipping.js`
     */
    // calculate_shipping:   { enabled: true },

    /**
     * Triggered to validate and apply discount value, must return discount and conditions.
     * Start editing `routes/ecom/modules/apply-discount.js`
     */
    // apply_discount:       { enabled: true },

    /**
     * Triggered when listing payments, must return available payment methods.
     * Start editing `routes/ecom/modules/list-payments.js`
     */
    list_payments:        { enabled: true },

    /**
     * Triggered when order is being closed, must create payment transaction and return info.
     * Start editing `routes/ecom/modules/create-transaction.js`
     */
    create_transaction:   { enabled: true },
  },

  /**
   * Uncomment only the resources/methods your app may need to consume through Store API.
   */
  auth_scope: {
    'stores/me': [
      'GET'            // Read store info
    ],
    procedures: [
      'POST'           // Create procedures to receive webhooks
    ],
    products: [
      // 'GET',           // Read products with public and private fields
      // 'POST',          // Create products
      // 'PATCH',         // Edit products
      // 'PUT',           // Overwrite products
      // 'DELETE',        // Delete products
    ],
    brands: [
      // 'GET',           // List/read brands with public and private fields
      // 'POST',          // Create brands
      // 'PATCH',         // Edit brands
      // 'PUT',           // Overwrite brands
      // 'DELETE',        // Delete brands
    ],
    categories: [
      // 'GET',           // List/read categories with public and private fields
      // 'POST',          // Create categories
      // 'PATCH',         // Edit categories
      // 'PUT',           // Overwrite categories
      // 'DELETE',        // Delete categories
    ],
    customers: [
      // 'GET',           // List/read customers
      // 'POST',          // Create customers
      // 'PATCH',         // Edit customers
      // 'PUT',           // Overwrite customers
      // 'DELETE',        // Delete customers
    ],
    orders: [
      'GET',           // List/read orders with public and private fields
      'PATCH',         // Edit orders
      // 'POST',          // Create orders
      // 'PUT',           // Overwrite orders
      // 'DELETE',        // Delete orders
    ],
    carts: [
      // 'GET',           // List all carts (no auth needed to read specific cart only)
      // 'POST',          // Create carts
      // 'PATCH',         // Edit carts
      // 'PUT',           // Overwrite carts
      // 'DELETE',        // Delete carts
    ],

    /**
     * Prefer using 'fulfillments' and 'payment_history' subresources to manipulate update order status.
     */
    'orders/fulfillments': [
      // 'GET',           // List/read order fulfillment and tracking events
      // 'POST',          // Create fulfillment event with new status
      // 'DELETE',        // Delete fulfillment event
    ],
    'orders/payments_history': [
      'GET',           // List/read order payments history events
      'POST',          // Create payments history entry with new status
      // 'DELETE',        // Delete payments history entry
    ],

    /**
     * Set above 'quantity' and 'price' subresources if you don't need access for full product document.
     * Stock and price management only.
     */
    'products/quantity': [
      // 'GET',           // Read product available quantity
      // 'PUT',           // Set product stock quantity
    ],
    'products/variations/quantity': [
      // 'GET',           // Read variaton available quantity
      // 'PUT',           // Set variation stock quantity
    ],
    'products/price': [
      // 'GET',           // Read product current sale price
      // 'PUT',           // Set product sale price
    ],
    'products/variations/price': [
      // 'GET',           // Read variation current sale price
      // 'PUT',           // Set variation sale price
    ],

    /**
     * You can also set any other valid resource/subresource combination.
     * Ref.: https://developers.e-com.plus/docs/api/#/store/
     */
  },

  admin_settings: {
    /**
     * Configurações do Banco Inter
     */
    
    sandbox: {
      schema: {
        type: 'boolean',
        default: true,
        title: 'Modo Sandbox',
        description: 'Ativar ambiente de testes (sandbox) do Banco Inter'
      },
      hide: false
    },

    conta_corrente: {
      schema: {
        type: 'string',
        maxLength: 20,
        title: 'Conta Corrente',
        description: 'Número da conta corrente no Banco Inter (apenas números)'
      },
      hide: false
    },

    certificado: {
      schema: {
        type: 'string',
        maxLength: 10000,
        title: 'Certificado (.crt)',
        description: 'Conteúdo do arquivo de certificado (.crt) fornecido pelo Banco Inter'
      },
      hide: true
    },

    chave_privada: {
      schema: {
        type: 'string',
        maxLength: 10000,
        title: 'Chave Privada (.key)', 
        description: 'Conteúdo do arquivo de chave privada (.key) fornecido pelo Banco Inter'
      },
      hide: true
    },

    client_id: {
      schema: {
        type: 'string',
        maxLength: 100,
        title: 'Client ID',
        description: 'Client ID para autenticação OAuth2 no Banco Inter'
      },
      hide: true
    },

    client_secret: {
      schema: {
        type: 'string',
        maxLength: 100,
        title: 'Client Secret',
        description: 'Client Secret para autenticação OAuth2 no Banco Inter'
      },
      hide: true
    },

    webhook_uri: {
      schema: {
        type: 'string',
        maxLength: 255,
        format: 'uri',
        title: 'Webhook URI',
        description: 'URI para receber notificações do Banco Inter'
      },
      hide: true
    },

    // Configurações de PIX
    enable_pix: {
      schema: {
        type: 'boolean',
        default: true,
        title: 'Habilitar PIX',
        description: 'Permitir pagamentos via PIX'
      },
      hide: false
    },

    enable_pix_auto: {
      schema: {
        type: 'boolean',
        default: false,
        title: 'Habilitar PIX Automático',
        description: 'Permitir pagamentos recorrentes via PIX Automático'
      },
      hide: false
    },

    // Configurações de Boleto
    enable_boleto: {
      schema: {
        type: 'boolean',
        default: true,
        title: 'Habilitar Boleto',
        description: 'Permitir pagamentos via Boleto bancário'
      },
      hide: false
    },

    boleto_expire_days: {
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 60,
        default: 7,
        title: 'Dias para Vencimento',
        description: 'Número de dias para vencimento do boleto (1 a 60 dias)'
      },
      hide: false
    }
  }
}

/**
 * List of Procedures to be created on each store after app installation.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/procedures/
 */

const procedures = []

/**
 * Uncomment and edit code above to configure `triggers` and receive respective `webhooks`:
 */

const { baseUri } = require('./__env')

procedures.push({
  title: app.title,

  triggers: [
    // Receive notifications when new order is created:
    {
      resource: 'orders',
      action: 'create',
    },

    // Receive notifications when order financial/fulfillment status are set or changed:
    {
      resource: 'orders',
      field: 'financial_status',
    }
  ],

  webhooks: [
    {
      api: {
        external_api: {
          uri: `${baseUri}/ecom/webhook`
        }
      },
      method: 'POST'
    }
  ]
})

/**
 * You may also edit `routes/ecom/webhook.js` to treat notifications properly.
 */

exports.app = app

exports.procedures = procedures
