API Cobrança (Boleto com Pix)
Cobrança
Recuperar coleção de cobranças
Recuperar coleção de cobranças

Escopo requerido: boleto-cobranca.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas
Ícone
query Parameters
dataInicial
required
string <date>
Data de vencimento do título

Formato aceito: YYYY-MM-DD

dataFinal
required
string <date>
Data de fim do filtro

Formato aceito: YYYY-MM-DD

filtrarDataPor	
string (FiltrarDataPorEnum)
Default: "VENCIMENTO"
Enum: "VENCIMENTO" "EMISSAO" "PAGAMENTO"
situacao	
string (SituacaoCobrancaEnum)
Enum: "RECEBIDO" "A_RECEBER" "MARCADO_RECEBIDO" "ATRASADO" "CANCELADO" "EXPIRADO" "FALHA_EMISSAO" "EM_PROCESSAMENTO" "PROTESTO"
Possíveis situações de uma cobranca.

pessoaPagadora	
string (Nome da pessoa pagadora)
Filtro pelo nome do pagador

cpfCnpjPessoaPagadora	
string (cpfCnpj da pessoa pagadora) [ 1 .. 18 ] characters
Filtro pelo cpf/cnpj do pagador

seuNumero	
string (Seu código da cobrança) <= 15 characters
Filtro pelo código "seu número"

tipoCobranca	
string (TipoCobrancaEnum)
Enum: "SIMPLES" "PARCELADO" "RECORRENTE"
Tipos de cobranças existentes.

paginacao.itensPorPagina	
integer <int32> (Itens por Página) <= 1000
Default: 100
Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.

paginacao.paginaAtual	
integer <int32> (Página atual)
Default: 0
Página a ser retornada pela consulta. Se não for informada, assumirá que será 0.

ordenarPor	
string (OrdenarCobrancasPorEnum)
Default: "PESSOA_PAGADORA"
Enum: "PESSOA_PAGADORA" "TIPO_COBRANCA" "CODIGO_COBRANCA" "IDENTIFICADOR" "DATA_EMISSAO" "DATA_VENCIMENTO" "VALOR" "STATUS"
tipoOrdenacao	
string (TipoOrdenacaoCobrancasEnum)
Default: "ASC"
Enum: "ASC" "DESC"
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Solicitação realizada com sucesso.
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobrancas


Response samples
200400403404500
Content type
application/json

Copy
Expand allCollapse all
{
"totalPaginas": 1,
"totalElementos": 0,
"tamanhoPagina": 20,
"primeiraPagina": true,
"ultimaPagina": true,
"numeroDeElementos": 1,
"cobrancas": [
{}
]
}
Emitir cobrança
Método utilizado para emitir uma cobrança com código de barras e QRCode de forma assíncrona.

Após a emissão, será disparado um callback com os dados da cobrança gerada para seu webhook cadastrado. Você também poderá buscar atualizações da cobrança de forma ativa utilizando o Código identificador(codigoSolicitacao) único retornado na chamada de inclusão.

Sua chave Pix será automaticamente selecionada para emissão do QR Code no boleto de cobrança. Caso nenhuma chave seja encontrada, o boleto será emitido sem o QR Code. Cadastre uma chave Pix via aplicativo ou Internet Banking para aproveitar todos os benefícios do produto.

Atenção:
Para evitar emissão de cobranças em duplicidade, utilizamos os campos seuNumero, valorNominal, dataVencimento e cpfCnpj do pagador para montar uma chave de idempotência, com duração de 30min. Portanto, não será possível emitir mais de uma cobrança com todos estes campos idênticos em um intervalo de 30 minutos entre as chamadas.

Escopo requerido: boleto-cobranca.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Corpo da Cobrança

seuNumero
required
string <= 15 characters
Campo Seu Número do título

valorNominal
required
number [ 2.5 .. 99999999.99 ]
Valor Nominal do título

dataVencimento
required
string <date>
Data de vencimento do título

Formato aceito: YYYY-MM-DD

numDiasAgenda
required
integer <int32> [ 0 .. 60 ]
Default: 0
Número de dias corridos após o vencimento para o cancelamento efetivo automático da cobrança. (de 0 até 60)

pagador
required
object (Pagador)
desconto	
object
Informações do desconto a ser aplicado.

multa	
object
Informações da multa a ser cobrada.

mora	
object
Informações da mora a ser cobrada.

mensagem	
object (Mensagem)
beneficiarioFinal	
object (PagadorBase)
formasRecebimento	
Array of strings (FormaRecebimentoEnum) unique
Default: ["BOLETO","PIX"]
Items Enum: "BOLETO" "PIX"
Lista com as formas de recebimento de uma cobrança, separadas por vírgula.

Se não for informado, será criada a cobrança com o boleto e, caso haja uma chave registrada no Inter, o PIX cobrança com vencimento.

Atualmente não é possível informar somente PIX como forma de recebimento. Para uma cobrança de pix com vencimento deverá ser utilizada a API PIX.

Responses
200 Retorno do inserir boleto
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/cobrancas


Request samples
Payload
Content type
application/json

Copy
Expand allCollapse all
{
"seuNumero": "123456",
"valorNominal": 2.5,
"dataVencimento": "2023-10-20",
"numDiasAgenda": 60,
"pagador": {
"email": "nome.sobrenome@x.com.br",
"ddd": "31",
"telefone": "31 99999-999",
"numero": "3456",
"complemento": "apartamento 3 bloco 4",
"cpfCnpj": "01123456789",
"tipoPessoa": "FISICA",
"nome": "Nome do pagador",
"endereco": "Avenida Brasil, 1200",
"bairro": "Centro",
"cidade": "Belo Horizonte",
"uf": "MG",
"cep": "30110000"
},
"desconto": {
"taxa": 3,
"codigo": "PERCENTUALDATAINFORMADA",
"quantidadeDias": 7
},
"multa": {
"taxa": 2,
"codigo": "PERCENTUAL"
},
"mora": {
"taxa": 5,
"codigo": "TAXAMENSAL"
},
"mensagem": {
"linha1": "mensagem 1",
"linha2": "mensagem 2",
"linha3": "mensagem 3",
"linha4": "mensagem 4",
"linha5": "mensagem 5"
},
"beneficiarioFinal": {
"cpfCnpj": "12345678901",
"tipoPessoa": "FISICA",
"nome": "Nome do beneficiário",
"endereco": "Avenida Brasil, 1200",
"bairro": "Centro",
"cidade": "Belo Horizonte",
"uf": "MG",
"cep": "30110000"
}
}
Response samples
200400403500503
Content type
application/json

Copy
{
"codigoSolicitacao": "183e982a-34e5-4bc0-9643-def5432a"
}
Recuperar cobrança
Retorna os dados da cobrança de acordo com codigoSolicitacao informado.

Escopo requerido: boleto-cobranca.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/{codigoSolicitacao}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/{codigoSolicitacao}
Ícone
path Parameters
codigoSolicitacao
required
string <uuid>
Código único da cobrança

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sucesso
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobrancas/{codigoSolicitacao}


Response samples
200400403404500
Content type
application/json

Copy
Expand allCollapse all
{
"cobranca": {
"codigoSolicitacao": "183e982a-34e5-4bc0-9643-def5432a",
"seuNumero": "12345678",
"dataEmissao": "2023-09-24",
"dataVencimento": "2023-10-15",
"valorNominal": 1234.56,
"tipoCobranca": "SIMPLES",
"situacao": "RECEBIDO",
"dataSituacao": "2023-09-26",
"valorTotalRecebido": "1234.56",
"origemRecebimento": "BOLETO",
"arquivada": true,
"descontos": [],
"multa": {},
"mora": {},
"pagador": {}
},
"boleto": {
"nossoNumero": "12345678",
"codigoBarras": "01234567890123456789012345678901234567890123",
"linhaDigitavel": "01234567890123456789012345678901234567890123456"
},
"pix": {
"txid": "012345678901234567890123456789012345",
"pixCopiaECola": "012345678901234567890BR.GOV.BCB.PIX2576spi-qrcode-h.bancointer.com.br..."
}
}
Editar cobrança
Beta

Editar os dados da cobrança de acordo com codigoSolicitacao informado.

Escopo requerido: boleto-cobranca.write
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/{codigoSolicitacao}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/{codigoSolicitacao}
Ícone
Observações:
O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.
Após editar uma cobrança, seu valor pode levar até 30 minutos para ser atualizado.
path Parameters
codigoSolicitacao
required
string <uuid>
Código único da cobrança

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Corpo do objeto para atualizar a cobrança

dataVencimento	
string <date>
Data de vencimento

Formato aceito: YYYY-MM-DD

valorNominal	
number [ 2.5 .. 99999999.99 ]
Valor Nominal do título

Responses
200 Sucesso
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

patch
/cobrancas/{codigoSolicitacao}


Request samples
Payload
Content type
application/json

Copy
{
"dataVencimento": "2019-08-24",
"valorNominal": 2.5
}
Response samples
200400403404500
Content type
application/json

Copy
{
"status": "PROCESSANDO",
"mensagem": "string",
"codigoEdicao": "string"
}
Consultar status da edição da cobrança
Beta

Consultar edição da cobrança de acordo com codigoEdicao informado.

Escopo requerido: boleto-cobranca.read
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/edicao/{codigoEdicao}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/edicao/{codigoEdicao}
Ícone
Observações:
O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.
Após editar uma cobrança, seu valor pode levar até 30 minutos para ser atualizado.
path Parameters
codigoEdicao
required
string <uuid>
Identificador para consultar a edição da cobrança (UUID)

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sucesso
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobrancas/edicao/{codigoEdicao}


Response samples
200400403404500
Content type
application/json

Copy
{
"status": "PROCESSANDO"
}
Recuperar cobrança em PDF
Recupera uma cobrança com código de barras e QRCode em PDF.

Escopo requerido: boleto-cobranca.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/{codigoSolicitacao}/pdf
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/{codigoSolicitacao}/pdf
Ícone
path Parameters
codigoSolicitacao
required
string <uuid>
Código único da cobrança

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sucesso
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobrancas/{codigoSolicitacao}/pdf


Response samples
200400403404500
Content type
application/json

Copy
{
"pdf": "JVBERi0xLjUKJeLjz9MKMyAwIG9..."
}
Cancelar cobrança
Cancelar cobrança com o codigoSolicitacao informado.

Escopo requerido: boleto-cobranca.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/{codigoSolicitacao}/cancelar
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/{codigoSolicitacao}/cancelar
Ícone
path Parameters
codigoSolicitacao
required
string <uuid>
Código único da cobrança

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Corpo do objeto para cancelar a cobrança

motivoCancelamento
required
string <= 50 characters
Motivo pelo qual a cobrança está sendo cancelada

Responses
202 Sucesso
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/cobrancas/{codigoSolicitacao}/cancelar


Request samples
Payload
Content type
application/json

Copy
{
"motivoCancelamento": "Devedor pagou por outra forma"
}
Response samples
400403404500
Content type
application/json

Copy
Expand allCollapse all
{
"title": "Dados inválidos.",
"detail": "Verifique se os dados informados estão de acordo com a documentação disponibilizada e tente novamente.",
"timestamp": "2023-09-26T18:06:11.692931-03:00",
"violacoes": [
{}
]
}
Recuperar sumário de cobranças
Utilizado para recuperar o sumário de uma coleção de Cobranças por um período específico, de acordo com os parâmetros informados.

Escopo requerido: boleto-cobranca.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/sumario
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/sumario
Ícone
query Parameters
dataInicial
required
string <date>
Data de vencimento do título

Formato aceito: YYYY-MM-DD

dataFinal
required
string <date>
Data de fim do filtro

Formato aceito: YYYY-MM-DD

filtrarDataPor	
string (FiltrarDataPorEnum)
Default: "VENCIMENTO"
Enum: "VENCIMENTO" "EMISSAO" "PAGAMENTO"
situacao	
string (SituacaoCobrancaEnum)
Enum: "RECEBIDO" "A_RECEBER" "MARCADO_RECEBIDO" "ATRASADO" "CANCELADO" "EXPIRADO" "FALHA_EMISSAO" "EM_PROCESSAMENTO" "PROTESTO"
Possíveis situações de uma cobranca.

tipoCobranca	
string (TipoCobrancaEnum)
Enum: "SIMPLES" "PARCELADO" "RECORRENTE"
Tipos de cobranças existentes.

seuNumero	
string (Seu código da cobrança) <= 15 characters
Filtro pelo código "seu número"

pessoaPagadora	
string (Nome da pessoa pagadora)
Filtro pelo nome do pagador

cpfCnpjPessoaPagadora	
string (cpfCnpj da pessoa pagadora) [ 1 .. 18 ] characters
Filtro pelo cpf/cnpj do pagador

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sucesso
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobrancas/sumario


Response samples
200400403404500
Content type
application/json

Copy
Expand allCollapse all
[
{
"situacao": "A_RECEBER",
"valor": 1000,
"quantidade": 30
},
{
"situacao": "RECEBIDO",
"valor": 4000,
"quantidade": 65
},
{
"situacao": "ATRASADO",
"valor": 500,
"quantidade": 3
},
{
"situacao": "CANCELADO",
"valor": 0,
"quantidade": 0
},
{
"situacao": "EXPIRADO",
"valor": 0,
"quantidade": 0
},
{
"situacao": "MARCADO_RECEBIDO",
"valor": 0,
"quantidade": 0
},
{
"situacao": "FALHA_EMISSAO",
"valor": 0,
"quantidade": 0
},
{
"situacao": "EM_PROCESSAMENTO",
"valor": 0,
"quantidade": 0
},
{
"situacao": "PROTESTO",
"valor": 0,
"quantidade": 0
}
]
Pagar cobrança (Sandbox)
Pagamento de uma cobrança com código de barras ou QRCode(Exclusivo para o ambiente Sandbox).

Após o pagamento, será disparado um callback com os dados da cobrança atualizados para seu webhook cadastrado.

Escopo requerido: boleto-cobranca.write
rate limit:
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/{codigoSolicitacao}/pagar
Ícone
path Parameters
codigoSolicitacao
required
string <uuid>
Código único da cobrança

Request Body schema: application/json
Pagar Cobrança

pagarCom
required
string
Enum: "BOLETO" "PIX"
Responses
204 Sucesso no Pagamento
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/cobrancas/{codigoSolicitacao}/pagar

Request samples
Payload
Content type
application/json
Example

Exemplo de Pagamento de cobrança via Pix
Exemplo de Pagamento de cobrança via Pix

Copy
{
"pagarCom": "PIX"
}
Response samples
400403500503
Content type
application/json

Copy
Expand allCollapse all
{
"title": "Dados inválidos.",
"detail": "Verifique se os dados informados estão de acordo com a documentação disponibilizada e tente novamente.",
"timestamp": "2023-09-26T18:06:11.692931-03:00",
"violacoes": [
{}
]
}
Webhook
Criar ou editar um webhook
Método destinado a criar um webhook para receber notificações (callbacks) de cobranças pagas, canceladas e expiradas.

Caso o servidor de webhook retorne erro de recebimento do callback, serão realizadas até 4 tentativas com intervalos de 20, 30, 60 e 120 minutos.

Escopo requerido: boleto-cobranca.write
rate limit:
 5 chamadas por minuto
 5 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
ÍconeValidar webhook
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/webhook
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/webhook
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
webhookUrl
required
string <uri> ^https://[^\s]*$
URL de configuração do webhook. Deve iniciar obrigatoriamente com https://

Responses
204 Sucesso
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.
Callbacks
post{$request.body#/webhookUrl}

put
/cobrancas/webhook


Request samples
Payload
Content type
application/json

Copy
{
"webhookUrl": "https://cobranca.example.com/api/webhook"
}
Response samples
500
Content type
application/problem+json

Copy
{
"title": "Serviço Indisponível",
"status": 503,
"detail": "Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento."
}
Callback payload samples
Callback
POST: {$request.body#/webhookUrl}
Content type
application/json

Copy
Expand allCollapse all
[
{
"codigoSolicitacao": "string",
"seuNumero": "string",
"situacao": "RECEBIDO",
"dataHoraSituacao": "2019-08-24T14:15:22Z",
"valorTotalRecebido": "string",
"origemRecebimento": "BOLETO",
"nossoNumero": "string",
"codigoBarras": "stringstringstringstringstringstringstringst",
"linhaDigitavel": "stringstringstringstringstringstringstringstrin",
"txid": "string",
"pixCopiaECola": "string"
}
]
Obter webhook cadastrado
Obtém o webhook cadastrado, caso exista.

Escopo requerido: boleto-cobranca.read
rate limit:
 5 chamadas por minuto
 5 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/webhook
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/webhook
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sucesso
404 Recurso solicitado não foi encontrado.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobrancas/webhook


Response samples
200404500
Content type
application/json

Copy
{
"webhookUrl": "https://boleto.example.com/api/webhook/",
"criacao": "2019-08-24T14:15:22Z",
"atualizacao": "2019-08-24T14:15:22Z"
}
Excluir webhook
Exclui o webhook.

Escopo requerido: boleto-cobranca.write
rate limit:
 5 chamadas por minuto
 5 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/webhook
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/webhook
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Responses
204 Sucesso
404 Recurso solicitado não foi encontrado.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

delete
/cobrancas/webhook


Response samples
404500
Content type
application/problem+json

Copy
{
"title": "Não Encontrado",
"status": 404,
"detail": "Entidade não encontrada."
}
Consulta de callbacks enviados
Retorna as requisições de callbacks ordenado pela data de disparo (decrescente)

Escopo requerido: boleto-cobranca.read
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/webhook/callbacks
Ícone
  https://cdpj-sandbox.partners.uatinter.co/cobranca/v3/cobrancas/webhook/callbacks
Ícone
query Parameters
dataHoraInicio
required
string <date-time>
Example: dataHoraInicio=2023-06-01T00:00Z ou 2023-06-01T00:00:00.000Z
Formato aceito: yyyy-MM-dd'T'HH:mm[:ss][.SSS]XXX

dataHoraFim
required
string <date-time>
Example: dataHoraFim=2023-06-01T00:00Z ou 2023-06-01T00:00:00.000Z
Formato aceito: yyyy-MM-dd'T'HH:mm[:ss][.SSS]XXX

pagina	
integer
Default: 0
Posição da página na lista de dados

tamanhoPagina	
integer [ 10 .. 50 ]
Default: 20
Tamanho da página

codigoSolicitacao	
string <uuid>
Codigo único da cobrança

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sucesso
400 Problemas na requisição.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobrancas/webhook/callbacks


Response samples
200400500
Content type
application/json

Copy
Expand allCollapse all
{
"totalElementos": 0,
"totalPaginas": 0,
"primeiraPagina": true,
"ultimaPagina": true,
"data": [
{},
{}
]
}
Reenviar callbacks
Beta

Método utilizado para reenviar uma mensagem de callback de uma cobrança através de seu código identificador(codigoSolicitacao).

A funcionalidade permite o envio de até 50 codigos identificadores, para o reenvio de seus respectivos callbacks.

Escopo requerido: boleto-cobranca.write
rate limit:
 5 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/cobranca/v3/cobrancas/webhook/callbacks/retry
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação, caso faça parte da lista de contas correntes da aplicação. Enviar apenas números(incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
codigoSolicitacao
required
Array of strings <uuid> [ 1 .. 50 ] items
Lista de códigos identificadores das cobranças. Poderá ser enviado até 50 códigos para efetuar o reenvio.

Responses
200 Sucesso
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
500 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/webhook/callbacks/retry

Request samples
Payload
Content type
application/json

Copy
Expand allCollapse all
{
"codigoSolicitacao": [
"497f6eca-6276-4993-bfeb-53cbbbba6f08"
]
}
Response samples
200400403404500
Content type
aplication/json

Copy
Expand allCollapse all
{
"foundIds": [
"497f6eca-6276-4993-bfeb-53cbbbba6f08"
]
}
