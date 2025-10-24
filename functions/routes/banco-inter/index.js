/**
 * Rotas para integração com Banco Inter
 * Gerencia todos os endpoints relacionados ao Banco Inter
 */

const router = require('express').Router()

// Middleware para logging
router.use((req, res, next) => {
  console.log(`Banco Inter Route: ${req.method} ${req.path}`)
  next()
})

// Rota principal para webhook unificado
router.use('/webhook', require('./webhook'))

// Rota para webhook específico do PIX
router.use('/webhook-pix', require('./webhook-pix'))

// Rota para webhook específico de cobrança
router.use('/webhook-cobranca', require('./webhook-cobranca'))

// Rota para testes de webhook
router.use('/test-webhook', require('./test-webhook'))

// Rota para teste de conexão PIX
router.use('/test-pix', require('./test-pix'))

// Rota para teste de cobrança
router.use('/test-cobranca', require('./test-cobranca'))

// Rota para servir PDFs de boleto
router.use('/pdf', require('./pdf'))

// Rota de status/health check
router.get('/status', (req, res) => {
  res.json({
    service: 'Banco Inter Integration',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /webhook - Webhook unificado',
      'POST /webhook-pix - Webhook PIX específico', 
      'POST /webhook-cobranca - Webhook cobrança específico',
      'POST /test-webhook - Teste de webhooks',
      'GET /test-webhook - Logs de webhooks',
      'GET /test-pix - Teste conexão PIX',
      'GET /test-cobranca - Teste conexão cobrança',
      'GET /pdf/:codigoSolicitacao - PDF do boleto',
      'GET /status - Status do serviço'
    ]
  })
})

module.exports = router
