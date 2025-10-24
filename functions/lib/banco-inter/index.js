/**
 * Banco Inter Integration Library
 * 
 * Módulos para integração com as APIs do Banco Inter:
 * - PIX (Cobrança imediata)
 * - PIX Automático (Recorrência)  
 * - Cobrança (Boleto com PIX)
 */

const BancoInterClient = require('./client')
const BancoInterAuth = require('./auth')
const CertificateManager = require('./certificates')
const PixClient = require('./pix-client')
const PixHelpers = require('./pix-helpers')
const CobrancaClient = require('./cobranca-client')
const CobrancaHelpers = require('./cobranca-helpers')

// Exporta classe principal e utilitários
module.exports = {
  BancoInterClient,
  BancoInterAuth,
  CertificateManager,
  PixClient,
  PixHelpers,
  CobrancaClient,
  CobrancaHelpers,
  
  /**
   * Factory para criar cliente de cobrança configurado
   */
  createCobrancaClient(appData, storeId, isSandbox = true) {
    return new CobrancaClient(appData, storeId, isSandbox)
  },
  
  /**
   * Factory para criar cliente PIX configurado
   */
  createPixClient(appData, storeId, isSandbox = true) {
    return new PixClient(appData, storeId, isSandbox)
  },
  
  /**
   * Utilitário para validar configuração mínima
   */
  validateMinimalConfig(appData) {
    const required = [
      'client_id',
      'client_secret', 
      'certificado',
      'chave_privada'
    ]
    
    const missing = required.filter(field => !appData[field])
    
    if (missing.length > 0) {
      throw new Error(`Configuração incompleta. Campos obrigatórios: ${missing.join(', ')}`)
    }
    
    return true
  }
}
