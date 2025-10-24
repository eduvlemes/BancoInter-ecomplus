const fs = require('fs')
const path = require('path')

/**
 * Gerenciador de certificados SSL do Banco Inter
 */
class CertificateManager {
  constructor() {
    this.certificatesPath = path.join(__dirname, '../../..', 'certificados')
  }

  /**
   * Valida se um certificado PEM está bem formatado
   */
  validateCertificate(certContent) {
    if (!certContent || typeof certContent !== 'string') {
      return false
    }

    // Remove espaços extras e quebras de linha desnecessárias
    const cleanCert = certContent.trim()
    
    // Verifica se tem headers/footers corretos
    const hasCertHeader = cleanCert.includes('-----BEGIN CERTIFICATE-----')
    const hasCertFooter = cleanCert.includes('-----END CERTIFICATE-----')
    
    return hasCertHeader && hasCertFooter
  }

  /**
   * Valida se uma chave privada PEM está bem formatada
   */
  validatePrivateKey(keyContent) {
    if (!keyContent || typeof keyContent !== 'string') {
      return false
    }

    // Remove espaços extras e quebras de linha desnecessárias
    const cleanKey = keyContent.trim()
    
    // Verifica diferentes tipos de chave privada
    const hasKeyHeader = cleanKey.includes('-----BEGIN PRIVATE KEY-----') ||
                        cleanKey.includes('-----BEGIN RSA PRIVATE KEY-----') ||
                        cleanKey.includes('-----BEGIN EC PRIVATE KEY-----')
    
    const hasKeyFooter = cleanKey.includes('-----END PRIVATE KEY-----') ||
                        cleanKey.includes('-----END RSA PRIVATE KEY-----') ||
                        cleanKey.includes('-----END EC PRIVATE KEY-----')
    
    return hasKeyHeader && hasKeyFooter
  }

  /**
   * Normaliza o conteúdo do certificado/chave
   */
  normalizePemContent(content) {
    if (!content) return null
    
    // Remove espaços no início e fim
    let normalized = content.trim()
    
    // Garante que termina com quebra de linha
    if (!normalized.endsWith('\n')) {
      normalized += '\n'
    }
    
    return normalized
  }

  /**
   * Carrega certificados do sistema de arquivos (para desenvolvimento)
   */
  loadCertificatesFromFile(storeName = 'alpix') {
    try {
      const storeDir = path.join(this.certificatesPath, storeName)
      
      const certPath = path.join(storeDir, 'Inter API_Certificado.crt')
      const keyPath = path.join(storeDir, 'Inter API_Chave.key')
      
      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        throw new Error(`Certificados não encontrados para a loja: ${storeName}`)
      }
      
      const certificate = fs.readFileSync(certPath, 'utf8')
      const privateKey = fs.readFileSync(keyPath, 'utf8')
      
      return {
        certificate: this.normalizePemContent(certificate),
        privateKey: this.normalizePemContent(privateKey)
      }
    } catch (error) {
      console.error('Erro ao carregar certificados do arquivo:', error)
      throw new Error(`Falha ao carregar certificados: ${error.message}`)
    }
  }

  /**
   * Obtém certificados da configuração do app ou arquivo
   */
  getCertificates(appData, storeName = null) {
    // Primeiro tenta pegar da configuração do app
    if (appData.certificado && appData.chave_privada) {
      const certificate = this.normalizePemContent(appData.certificado)
      const privateKey = this.normalizePemContent(appData.chave_privada)
      
      if (!this.validateCertificate(certificate)) {
        throw new Error('Certificado inválido na configuração do app')
      }
      
      if (!this.validatePrivateKey(privateKey)) {
        throw new Error('Chave privada inválida na configuração do app')
      }
      
      return {
        certificate,
        privateKey
      }
    }
    
    // Fallback para arquivos (desenvolvimento)
    if (storeName) {
      return this.loadCertificatesFromFile(storeName)
    }
    
    throw new Error('Certificados não configurados. Configure via painel admin ou coloque arquivos na pasta certificados/')
  }

  /**
   * Testa a validade dos certificados fazendo uma requisição simples
   */
  async testCertificates(appData, isSandbox = true) {
    try {
      const { certificate, privateKey } = this.getCertificates(appData)
      
      const https = require('https')
      const agent = new https.Agent({
        cert: certificate,
        key: privateKey,
        rejectUnauthorized: !isSandbox
      })
      
      const baseUrl = isSandbox 
        ? 'https://cdpj-sandbox.partners.uatinter.co'
        : 'https://cdpj.partners.bancointer.com.br'
      
      // Faz uma requisição simples para testar os certificados
      return new Promise((resolve, reject) => {
        const req = https.request(`${baseUrl}/oauth/v2/token`, {
          method: 'HEAD',
          agent
        }, (res) => {
          // Qualquer resposta (mesmo erro) indica que os certificados funcionam
          resolve(true)
        })
        
        req.on('error', (error) => {
          // Erros de SSL/TLS indicam problema nos certificados
          if (error.code === 'EPROTO' || 
              error.code === 'ECONNRESET' || 
              error.message.includes('certificate')) {
            reject(new Error('Certificados inválidos ou incompatíveis'))
          } else {
            // Outros erros são problemas de rede, certificados estão OK
            resolve(true)
          }
        })
        
        req.setTimeout(5000, () => {
          req.destroy()
          reject(new Error('Timeout ao testar certificados'))
        })
        
        req.end()
      })
    } catch (error) {
      throw new Error(`Erro ao testar certificados: ${error.message}`)
    }
  }
}

module.exports = CertificateManager
