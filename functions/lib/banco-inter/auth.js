const https = require('https')
const fs = require('fs')

/**
 * Banco Inter OAuth2 Authentication
 */
class BancoInterAuth {
  constructor(appData, isSandbox = true) {
    this.appData = appData
    this.isSandbox = isSandbox
    
    // URLs de acordo com o ambiente
    this.baseUrl = isSandbox 
      ? 'https://cdpj-sandbox.partners.uatinter.co'
      : 'https://cdpj.partners.bancointer.com.br'
    
    this.tokenUrl = `${this.baseUrl}/oauth/v2/token`
    
    // Cache de tokens
    this.accessToken = null
    this.tokenExpiry = null
  }

  /**
   * Cria agente HTTPS com certificados SSL
   */
  createHttpsAgent() {
    if (!this.appData.certificado || !this.appData.chave_privada) {
      throw new Error('Certificado e chave privada são obrigatórios')
    }

    return new https.Agent({
      cert: this.appData.certificado,
      key: this.appData.chave_privada,
      // Para ambiente sandbox, pode precisar desabilitar verificação
      rejectUnauthorized: !this.isSandbox
    })
  }

  /**
   * Verifica se o token ainda é válido
   */
  isTokenValid() {
    return this.accessToken && 
           this.tokenExpiry && 
           Date.now() < this.tokenExpiry
  }

  /**
   * Obter access token OAuth2
   */
  async getAccessToken() {
    // Retorna token em cache se ainda válido
    if (this.isTokenValid()) {
      return this.accessToken
    }

    try {
      const token = await this.requestAccessToken()
      
      // Cache do token com margem de segurança de 5 minutos
      this.accessToken = token.access_token
      this.tokenExpiry = Date.now() + ((token.expires_in - 300) * 1000)
      
      return this.accessToken
    } catch (error) {
      console.error('Erro ao obter access token:', error)
      throw new Error(`Falha na autenticação OAuth2: ${error.message}`)
    }
  }

  /**
   * Requisita novo access token
   */
  async requestAccessToken() {
    if (!this.appData.client_id || !this.appData.client_secret) {
      throw new Error('Client ID e Client Secret são obrigatórios')
    }

    const postData = new URLSearchParams({
      client_id: this.appData.client_id,
      client_secret: this.appData.client_secret,
      grant_type: 'client_credentials',
      scope: 'boleto-cobranca.read boleto-cobranca.write cob.read cob.write cobv.read cobv.write pix.read pix.write'
    }).toString()

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      agent: this.createHttpsAgent()
    }

    return new Promise((resolve, reject) => {
      const req = https.request(this.tokenUrl, options, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data)
            
            if (res.statusCode === 200) {
              resolve(response)
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${response.error_description || response.error || data}`))
            }
          } catch (error) {
            reject(new Error(`Erro ao processar resposta: ${error.message}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.write(postData)
      req.end()
    })
  }

  /**
   * Cria headers para requisições autenticadas
   */
  async createAuthHeaders(contentType = 'application/json') {
    const token = await this.getAccessToken()
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': contentType,
      'Accept': 'application/json'
    }

    // Adiciona conta corrente se configurada
    if (this.appData.conta_corrente) {
      headers['x-conta-corrente'] = this.appData.conta_corrente
    }

    return headers
  }

  /**
   * Método utilitário para fazer requisições autenticadas
   */
  async makeAuthenticatedRequest(url, method = 'GET', data = null, contentType = 'application/json') {
    const headers = await this.createAuthHeaders(contentType)
    
    const options = {
      method,
      headers,
      agent: this.createHttpsAgent()
    }

    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let responseData = ''
        
        res.on('data', (chunk) => {
          responseData += chunk
        })
        
        res.on('end', () => {
          try {
            const response = responseData ? JSON.parse(responseData) : {}
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ data: response, status: res.statusCode, headers: res.headers })
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`))
            }
          } catch (error) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              // Resposta sem JSON (ex: PDF)
              resolve({ data: responseData, status: res.statusCode, headers: res.headers })
            } else {
              reject(new Error(`Erro ao processar resposta: ${error.message}`))
            }
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      if (data && method !== 'GET') {
        const postData = typeof data === 'string' ? data : JSON.stringify(data)
        req.write(postData)
      }

      req.end()
    })
  }
}

module.exports = BancoInterAuth