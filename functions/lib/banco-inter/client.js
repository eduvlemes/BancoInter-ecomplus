const BancoInterAuth = require('./auth')
const CertificateManager = require('./certificates')

/**
 * Cliente base para APIs do Banco Inter
 */
class BancoInterClient {
  constructor(appData, storeId, isSandbox = true) {
    this.appData = appData
    this.storeId = storeId
    this.isSandbox = isSandbox || appData.sandbox !== false
    
    // Inicializa autenticação
    this.auth = new BancoInterAuth(appData, this.isSandbox)
    
    // Inicializa gerenciador de certificados
    this.certManager = new CertificateManager()
    
    // URLs base das APIs
    this.baseUrl = this.isSandbox 
      ? 'https://cdpj-sandbox.partners.uatinter.co'
      : 'https://cdpj.partners.bancointer.com.br'
    
    this.apiUrls = {
      pix: `${this.baseUrl}/pix/v2`,
      pixAuto: `${this.baseUrl}/pix-automatico/v1`, 
      cobranca: `${this.baseUrl}/cobranca/v3`
    }
  }

  /**
   * Valida configuração antes de fazer requisições
   */
  validateConfig() {
    const errors = []
    
    if (!this.appData.client_id) {
      errors.push('Client ID não configurado')
    }
    
    if (!this.appData.client_secret) {
      errors.push('Client Secret não configurado')
    }
    
    if (!this.appData.certificado) {
      errors.push('Certificado não configurado')
    }
    
    if (!this.appData.chave_privada) {
      errors.push('Chave privada não configurada')
    }
    
    if (errors.length > 0) {
      throw new Error(`Configuração inválida: ${errors.join(', ')}`)
    }
  }

  /**
   * Testa conectividade com o Banco Inter
   */
  async testConnection() {
    try {
      this.validateConfig()
      
      // Testa certificados
      await this.certManager.testCertificates(this.appData, this.isSandbox)
      
      // Testa autenticação OAuth2
      const token = await this.auth.getAccessToken()
      
      return {
        success: true,
        message: 'Conexão com Banco Inter estabelecida com sucesso',
        environment: this.isSandbox ? 'sandbox' : 'production',
        tokenObtained: !!token
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro na conexão: ${error.message}`,
        environment: this.isSandbox ? 'sandbox' : 'production'
      }
    }
  }

  /**
   * Faz requisição autenticada para qualquer API
   */
  async makeRequest(endpoint, method = 'GET', data = null, apiType = 'pix') {
    try {
      this.validateConfig()
      
      const url = `${this.apiUrls[apiType]}${endpoint}`
      
      return await this.auth.makeAuthenticatedRequest(url, method, data)
    } catch (error) {
      console.error(`Erro na requisição ${method} ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Métodos utilitários para cada API
   */
  
  // PIX API
  async pixRequest(endpoint, method = 'GET', data = null) {
    return this.makeRequest(endpoint, method, data, 'pix')
  }
  
  // PIX Automático API  
  async pixAutoRequest(endpoint, method = 'GET', data = null) {
    return this.makeRequest(endpoint, method, data, 'pixAuto')
  }
  
  // Cobrança API
  async cobrancaRequest(endpoint, method = 'GET', data = null) {
    return this.makeRequest(endpoint, method, data, 'cobranca')
  }

  /**
   * Configurações do ambiente
   */
  getEnvironmentInfo() {
    return {
      environment: this.isSandbox ? 'sandbox' : 'production',
      baseUrl: this.baseUrl,
      apiUrls: this.apiUrls,
      storeId: this.storeId
    }
  }
}

module.exports = BancoInterClient
