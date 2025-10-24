API Pix Automático
A API Pix Automático é a solução que permite o pagamento de uma cobrança recorrente, de forma automática, mediante a concessão de uma permissão pelo usuário pagador ao usuário recebedor e de uma autorização ao PSP pagador, utilizando a infraestrutura do Pix.

Uma vez concedida a permissão pelo usuário pagador, o usuário recebedor enviará periodicamente as informações das cobranças recorrentes ao seu PSP, utilizando-se para isso da API Pix.

O PSP Recebedor então gerará a instrução de pagamento correspondente e a enviará ao PSP Pagador que, por sua vez, realizará o agendamento do débito e, posteriormente, sua liquidação na data prevista, de forma automática, sem a necessidade de qualquer ação do usuário pagador a cada nova transação.

Tratamento de erros
A API Pix Automático retorna códigos de status HTTP para indicar sucesso ou falhas das requisições.

Códigos 2xx indicam sucesso.

Códigos 4xx indicam falhas causadas pelas informações enviadas pelo cliente ou pelo estado atual das entidades.

Códigos 5xx indicam problemas no serviço no lado da API Pix.

As respostas de erro incluem no corpo detalhes do erro seguindo o schema da RFC 7807.

O campo type identifica o tipo de erro e segue o padrão: https://pix.bcb.gov.br/api/v2/error/<TipoErro>

O padrão acima listado, referente ao campo type, não consiste, necessariamente, em uma URL que apresentará uma página web válida, ou um endpoint válido, embora possa, futuramente, ser exatamente o caso.

O objetivo primário é apenas e tão somente identificar o tipo de erro.

Erros Gerais
Esta seção lista os tipos de erro e possíveis violações que podem ser retornados pelos endpoints listados na API Pix Automático.

RequisicaoInvalida
Significado: Requisição não atende aos requisitos esperados pelo servidor, seja por formatação, dados ausentes ou incorretos.
HTTP Status Code: 400 Bad Request.
AcessoNegado
Significado: Requisição de participante autenticado que viola alguma regra de autorização.
HTTP Status Code: 403 Forbidden.
NaoEncontrado
Significado: Entidade não encontrada.
HTTP Status Code: 404 Not Found.
PermanentementeRemovido
Significado: Indica que a entidade existia, mas foi permanentemente removida.
HTTP Status Code: 410 Gone.
ErroInternoDoServidor
Significado: Condição inesperada ao processar requisição.
HTTP Status Code: 500 Internal Server Error.
ServicoIndisponivel
Significado: Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.
HTTP Status Code: 503 Service Unavailable.
IndisponibilidadePorTempoEsgotado
Significado: Indica que o serviço demorou além do esperado para retornar.
HTTP Status Code: 504 Gateway Timeout.
Tag Recorrência
Esta seção reúne erros retornados pelos endpoints organizados sob a tag Recorrência.

Esses erros indicam problemas no gerenciamento de uma recorrência.

RecNaoEncontrada
Significado: Recorrência não encontrada para o idRec informado.
HTTP Status Code: 404.
endpoints: [GET|PATCH] /rec/{idRec}.
RecOperacaoInvalida
Significado: a requisição que busca alterar ou criar uma recorrência não respeita o schema ou está semanticamente errada.
HTTP Status Code: 400.
endpoints: [POST] /rec e [PATCH] /rec/{idRec}.
Violações específicas para o endpoint POST /rec:

O objeto rec.vinculo não respeita o schema.
O campo rec.calendario.dataInicial é anterior à data de criação da recorrência.
O campo rec.calendario.dataFinal é anterior ao campo rec.calendario.dataInicial.
O campo rec.calendario.periodicidade não respeita o schema.
O objeto rec.valor não respeita o schema.
O campo rec.valor.valorRec não respeita o schema.
O campo rec.valor.valorMinimoRecebedor não respeita o schema.
Ambos os campos rec.valor.valorRec e rec.valor.valorMinimoRecebedor estão preenchidos.
O objeto rec.recebedor não respeita o schema.
O campo rec.politicaRetentativa não respeita o schema.
O location referenciado por rec.loc inexiste.
O location referenciado por rec.loc já está sendo utilizado por outra recorrência.
O valor do campo rec.recebedor.convenio não é aceito pelo PSP Recebedor.
Violações específicas para o endpoint PATCH /rec/{idRec}:

O campo rec.calendario.dataInicial é anterior à data de criação da recorrência.
O location referenciado por rec.loc inexiste.
O location referenciado por rec.loc já está sendo utilizado por outra recorrência.
O campo rec.status não respeita o schema.
A recorrência encontra-se encerrada.
O campo rec.loc somente pode ser alterado quando a recorrência apresentar-se com o status CRIADA.
O campo rec.calendario.dataInicial somente pode ser alterado quando a recorrência apresentar-se com o status CRIADA.
O campo rec.dadosJornada.txid não pode ser alterado quando a recorrência apresentar-se com o status REJEITADA ou CANCELADA.
RecConsultaInvalida
Significado: Os parâmetros de consulta à lista de recorrências que não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: [GET] /rec e [GET] /rec/{idRec}.
Violações específicas para o endpoint GET /rec:

Algum dos parâmetros informados para a consulta não respeita o schema.
O timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
Ambos os parâmetros cpf e cnpj estão preenchidos.
O parâmetro paginacao.paginaAtual é negativo.
O parâmetro paginacao.itensPorPagina é negativo.
Violações específicas para o endpoint GET /rec/{idRec}:

O parâmetro txid não corresponde a uma cobrança compatível com o campo ativacao.tipoJornada. (Exemplo: txid correspondente a uma CobV e ativacao.tipoJornada igual a JORNADA_3.)
O parâmetro txid corresponde a uma cobrança imediata diferente da informada no campo ativacao.dadosJornada.txid. Esta violação não ocorre caso o parâmetro txid corresponda a uma cobrança com vencimento.
Tag Solicitar Recorrência
Esta seção reúne erros retornados pelos endpoints organizados sob a tag SolicRec.

Esses erros indicam problemas no gerenciamento de uma solicitação de confirmação de recorrência.

SolicRecNaoEncontrada
Significado: Solicitação de recorrência não encontrada para o idSolicRec informado.
HTTP Status Code: 404.
Endpoints: [GET] /solicrec/{idSolicRec}.
SolicRecOperacaoInvalida
Significado: a requisição que busca criar ou alterar uma solicitação de confirmação de recorrência não respeita o schema ou está semanticamente errada.
HTTP Status Code: 400.
Endpoints: [POST] /solicrec e [PATCH] /solicrec/{idSolicRec}.
Violações específicas para o endpoint POST /solicrec:

O objeto solicrec.calendario não respeita o schema.
O campo solicrec.calendario.dataExpiracaoSolicitacao é anterior à data de criação da solicitação da recorrência.
O objeto solicrec.destinatario não respeita o schema.
Existe uma solicitação ativa referente ao mesmo solicrec.idRec.
Violações específicas para o endpoint PATCH /solicrec/{idSolicRec}:

Não é possível cancelar uma solicitação de recorrência com o status diferente de CRIADA, ENVIADA ou RECEBIDA.
Tag Cobrança Recorrente
Esta seção reúne erros retornados pelos endpoints organizados sob a tag CobR.

Esses erros indicam problemas no gerenciamento de uma cobrança recorrente.

CobRNaoEncontrado
Significado: Cobrança não encontrada para o txid informado.
HTTP Status Code: 404.
Endpoints: [GET|PATCH] /cobr/{txid} e [POST] /cobr/{txid}/retentativa/{data}.
CobROperacaoInvalida
Significado: a requisição que busca alterar ou criar uma cobrança recorrente não respeita o schema ou está semanticamente errada.
HTTP Status Code: 400.
Endpoints: [POST|PUT|PATCH] /cobr/{txid} e [POST] /cobr/{txid}/retentativa/{data}.
Violações específicas para o endpoint PUT /cobr/{txid}:

O campo cobr.infoAdicional não respeita o schema.
O campo cobr.status não respeita o schema.
O objeto cobr.calendario não respeita o schema.
O campo cobr.calendario.dataDeVencimento é anterior à data de criação da cobrança.
O campo cobr.valor não respeita o schema.
O objeto cobr.recebedor não respeita o schema.
Os campos cobr.recebedor.conta e cobr.recebedor.agencia correspondem a uma conta que não pertence a este usuário recebedor.
O objeto cobr.devedor não respeita o schema.
O campo cobr.txid encontra-se em uso.
Existe uma CobR com status diferente de REJEITADA e CANCELADA referente ao mesmo cobr.idRec com calendario.dataDeVencimento no mesmo ciclo.
Violações específicas para o endpoint PATCH /cobr/{txid}:

Não é possível cancelar uma cobrança em uma data igual ou maior que a data prevista da primeira tentativa de liquidação.
Violações específicas para o endpoint POST /cobr/{txid}/retentativa/{data}:

Existe uma tentativa com status SOLICITADA ou AGENDADA.
Existe uma tentativa em andamento.
Existe uma tentativa ativa.
Existe uma tentativa não finalizada.
Existe uma tentativa vigente para a data informada.
O parâmetro data não corresponde a uma data futura.
A política configurada na recorrência não permite retentativa de cobrança.
CobRConsultaInvalida
Significado: os parâmetros de consulta à lista de cobranças que não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: [GET] /cobr e [GET] /cobr/{txid}.
Violações específicas para o endpoint GET /cobr:

Algum dos parâmetros informados para a consulta não respeita o schema.
O timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
ambos os parâmetros cpf e cnpj estão preenchidos.
O parâmetro paginacao.paginaAtual é negativo.
O parâmetro paginacao.itensPorPagina é negativo.
Tag Location da Recorrência
Esta seção reúne erros retornados pelos endpoints organizados sob a tag RecPayload.

Estes erros indicam problemas na tentativa de recuperação, via location, do Payload JSON que representa a recorrência.

RecPayloadNaoEncontrado
Significado: a recorrência em questão não foi encontrada para a location requisitada.
HTTP Status Code: 404 ou 410.
endpoint: GET /rec/{recUrlAccessToken}.
Se a presente location exibia uma recorrência, mas não a exibirá mais de maneira permanentemente, pode-se aplicar o HTTP status code 410. Se a presente location não está exibindo nenhuma recorrência, pode-se utilizar o HTTP status code 404.

Uma recorrência pode estar encerrada, cancelada ou rejeitada, nesses casos, é uma liberalidade do PSP recebedor retornar o presente código de erro ou optar por servir o payload de qualquer maneira, objetivando fornecer uma informação adicional ao usuário pagador final a respeito da recorrência.

RecPayloadOperacaoInvalida
Significado: a recorrência em questão encontra-se em encerrada, rejeitada ou cancelada para a location requisitada.
HTTP Status Code: 400.
endpoint: GET /rec/{recUrlAccessToken}.
Violações específicas para o endpoint GET /rec/{recUrlAccessToken}:

O campo recUrlAccessToken referencia uma recorrência encerrada, rejeitada ou cancelada.
Tag Payload Location da Recorrência
Esta seção reúne erros referentes a endpoints que tratam do gerenciamento de locations de uma recorrência.

PayloadLocationRecNaoEncontrado
Significado: Location não encontrada para o id informado.
HTTP Status Code: 404.
endpoints: [GET] /locrec/{id}, DELETE /locrec/{id}/idRec.
PayloadLocationRecConsultaInvalida
Significado: os parâmetros de consulta à lista de locations não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: GET /locrec e GET /locrec/{id}.
Violações específicas para o endpoint GET /locrec:

algum dos parâmetros informados para a consulta não respeitam o schema.
O timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
O parâmetro paginacao.paginaAtual é negativo.
O parâmetro paginacao.itensPorPagina é negativo.
Tag Webhook de Recorrências
Reúne erros dos endpoints que tratam do gerenciamento dos Webhooks de recorrências da API Pix.

WebhookRecOperacaoInvalida
Significado: a presente requisição busca criar um webhook sem respeitar o schema ou, ainda, apresenta semântica inválida.
HTTP Status Code: 400.
endpoints: PUT /webhookrec.
Violações específicas para o endpoint PUT /webhookrec:

O campo webhookUrl não respeita o schema.
WebhookRecConsultaInvalida
Significado: os parâmetros de consulta à lista de webhooks ativados não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: GET /webhookrec.
Violações específicas para o endpoint GET /webhookrec:

algum dos parâmetros informados para a consulta não respeita o schema.
O timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
O parâmetro paginacao.paginaAtual é negativo.
O parâmetro paginacao.itensPorPagina é negativo.
Tag Webhook de Cobranças Recorrentes
Reúne erros dos endpoints que tratam do gerenciamento dos Webhooks de cobranças recorrentes da API Pix.

WebhookCobROperacaoInvalida
Significado: a presente requisição busca criar um webhook sem respeitar o schema ou, ainda, apresenta semântica inválida.
HTTP Status Code: 400.
endpoints: PUT /webhookcobr.
Violações específicas para o endpoint PUT /webhookcobr:

O campo webhookUrl não respeita o schema.
WebhookCobRConsultaInvalida

Significado: os parâmetros de consulta à lista de webhooks ativados não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: GET /webhookcobr.
Violações específicas para o endpoint GET /webhookcobr:

algum dos parâmetros informados para a consulta não respeita o schema.
O timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
O parâmetro paginacao.paginaAtual é negativo.
O parâmetro paginacao.itensPorPagina é negativo.
Glossário
Usuário pagador:
Pessoa física ou jurídica que realiza o pagamento de uma cobrança.

Usuário recebedor:
Pessoa jurídica que emite as cobranças para o usuário pagador e recebe os pagamentos dessas cobranças.

PSP Pagador:
É o Provedor de Serviços de Pagamento no qual o usuário pagador possui uma conta corrente transacional para realizar pagamentos.

PSP Recebedor:
É o Provedor de Serviços de Pagamento. Sua função é conectar uma empresa, um cliente e uma instituição financeira para validar uma transação no qual o usuário recebedor possui uma conta corrente transacional que será usada para realizar e/ou receber pagamentos do Pix Automático.

Recorrência - Rec:
Conjunto de parâmetros com as informações sobre uma recorrência de cobranças, como periodicidade, data de início das cobranças, identificação do usuário recebedor, valor etc. Essas informações da recorrência serão utilizadas para validar e permitir o pagamento automático, após autorizado pelo usuário pagador.

Cobrança recorrente - Cobr:
Conjunto de cobranças periódicas feitas pelo usuário recebedor a um devedor, que não precisa ser necessariamente o usuário pagador.

Solicitação de confirmação de recorrência - Solicrec:
Solicitação encaminhada ao usuário pagador para que ele confirme se autoriza o seu PSP Pagador a realizar os pagamentos recorrentes via Pix Automático. Usada somente na Jornada 1.

Autorização:
Permissão concedida pelo usuário pagador ao seu PSP Pagador para que este possa efetuar débitos em sua conta para pagar as cobranças recorrentes.

Instruções de pagamento:
São informações enviadas pelo usuário recebedor por meio do seu PSP Recebedor para que o PSP Pagador possa agendar uma transação relativa ao Pix Automático. O envio da instrução de pagamento está condicionado a permissão concedida pelo usuário pagador.

Payload:
Refere-se aos dados enviados no corpo de uma solicitação ou resposta HTTP. Esses dados são a parte central da comunicação, contendo as informações que um cliente envia ao servidor ou que o servidor retorna ao cliente. O payload pode ser enviado em diferentes formatos, como JSON, XML, ou form-data.

Location - Loc:
É a URL que identifica um QR Code dinâmico ou um Pix Copia e Cola. É como se fosse um endereço onde as informações da cobrança são armazenadas e podem ser recuperadas.

Txid:
Cada transação Pix possui um Identificador da Transação, chamado txid, que no contexto de representação de uma cobrança, é único por CPF/CNPJ da pessoa usuária recebedora. Um txid é uma string alfanumérica com comprimentos mínimo de 26 e máximo de 35 caracteres.

Jornadas Pix Automático
Esta seção tem como objetivo auxiliar no entendimento para integração da API Pix Automático.
Para aderir ao Pix Automático, é possível realizar 4 jornadas para contratação. Segue abaixo os detalhes para emissão do Pix Automático em cada jornada:


Jornada 1
Usada normalmente quando o usuário pagador aderir a um contrato de serviço junto a um estabelecimento físico escolhendo o Pix Automático como forma de pagamento.
Via API do Pix Automático, o usuário recebedor cria a recorrência e solicita confirmação da recorrência enviando uma notificação ao aplicativo do pagador.

Exemplos de uso: academias e escolas.

Passos para emitir um Pix Automático pela Jornada 1:

1) Criar a recorrência: POST /rec

2) Criar a solicitação de confirmação da recorrência: POST /solicrec

Após autorizada a recorrência pelo pagador, você poderá criar e gerenciar as cobranças recorrentes associadas a recorrência criada.

3) Criar as cobranças recorrentes: POST/ cobr ou PUT/cobr/{txid}

Jornada 2
Pode ser utilizada por empresas que desejam receber os pagamentos de forma recorrente e periódica a partir do mês seguinte.
Para isso, a empresa gera um QR Code ou código Pix Copia e Cola. O usuário pagador contrata o serviço ao escanear o QR Code, que contém os dados da recorrência, e assim adere ao Pix Automático como método de pagamento.
Exemplos de uso: Modelos de recorrência de assinatura, como streaming.

Passos para emitir um Pix Automático pela Jornada 2:

1) Criar a location “QR Code” da recorrência: POST /locrec

2) Criar a recorrência: POST /rec

Incluindo o parâmetro loc no payload da recorrência, que referencia a location criada anteriormente.

3) Consultar a recorrência para gerar o "QrCode": GET /rec

Consultando pelo idRec da recorrência criada.
Após o pagador autorizar o QR Code, você poderá criar e gerenciar as cobranças recorrentes associadas a recorrência criada.

4) Criar cobrança recorrente: POST/ cobr ou PUT/cobr/{txid}

Jornada 3
Pode ser utilizada para empresas que desejam receber os pagamentos de forma recorrente e periódica a partir do mês seguinte quando o cliente já possui um serviço em andamento e deseja mudar a modalidade dos próximos pagamentos para o Pix Automático.

Exemplos de uso: Contas mensais como conta de água, luz etc.

A empresa gera um QR Code ou código Pix Copia e Cola, o usuário pagador paga a cobrança de forma imediata e também adere ao Pix Automático para as próximas cobranças

Passos para emitir um Pix Automático pela Jornada 3:

1) Criar a location “QR Code” da recorrência: POST /locrec

2) Criar a cobrança imediata: POST /cob ou PUT /cob

3) Criar a recorrência: POST /rec

Incluindo os parâmetros loc e txid no payload da recorrência, referenciando a location e a cobrança criadas anteriormente.

4) Consultar a recorrência para gerar o "QrCode": GET /rec

Consultando pelo idRec + txid da cob, só assim será gerado o QrCode da Jornada 3.
Após o pagador pagar/autorizar o QR Code, você poderá criar e gerenciar as cobranças recorrentes associadas a recorrência criada.

5) Criar cobrança recorrente: POST/ cobr ou PUT/cobr/{txid}

Jornada 4
Pode ser utilizada para empresas que desejam receber os pagamentos de forma recorrente e periódica a partir do mês seguinte.
Para isso, a empresa gera um QR Code ou código Pix Copia e Cola. O usuário pagador recebe o código e paga ou agenda o pagamento da cobrança. Posteriormente o pagador poderá decidir se adere ou não ao Pix Automático.

Exemplo de uso: Ao realizar o pagamento de fatura mensal, o cliente poderá optar pela adesão ao Pix Automático nas próximas cobranças dessa fatura.

Passos para emitir um Pix Automático pela Jornada 4:

1) Criar a location “QR Code” da recorrência: POST /locrec

2) Criar a cobrança com vencimento: PUT /cobv

3) Criar a recorrência: POST /rec

Incluindo o parâmetro loc no payload da recorrência, que referencia a location criada anteriormente.

4) Consultar a recorrência para gerar o "QrCode": GET /rec

Consultando pelo idRec + txid da cobv, só assim será gerado o QrCode da Jornada 4.
Após o pagador pagar/autorizar o QR Code, você poderá criar e gerenciar as cobranças recorrentes associadas a recorrência criada.

5) Criar cobrança recorrente: POST/ cobr ou PUT/cobr/{txid}

Recorrência
Essa seção apresenta os endpoints relacionados ao gerenciamento de recorrências do Pix Automático.

Para que as cobranças sejam geradas automaticamente para os clientes pagadores, devemos criar uma recorrência que o cliente pagador deverá autorizar.

Criar recorrência
description: >- Endpoint utilizado para criar uma recorrência.

Qualquer cobrança gerada pelo fluxo de Pix Automático, precisa estar vinculada a uma recorrência.

Para isso, é preciso gerar a recorrência de acordo com o contrato realizado com o cliente pagador, com relação

a período vigente, periodicidade, valor, se permite retentativa, dentre outros.

Escopo requerido: rec.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/rec
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/rec
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Dados para geração da recorrência.

vinculo
required
object (Descrição do Objeto da Recorrência)
Contendo objeto, devedor e contrato.

calendario
required
object (Informações sobre calendário da recorrência)
Contendo dataInicial, dataFinal e periodicidade da recorrência.

valor	
object
Contendo valorRece ValorMinimoRecebedor

politicaRetentativa
required
string (Política de retentativa pós vencimento da recorrência)
Enum: "NAO_PERMITE" "PERMITE_3R_7D"
NAO_PERMITE: Não permite retentativas.
PERMITE_3R_7D: Permite até 3 retentativas em dias diferentes no intervalo de até 7 dias corridos contados a partir da data de liquidação prevista na instrução de pagamento original.
As retentativas devem ser enviadas pelo recebedor. Consulte a documentação

loc	
integer <int64> (Id da location)
Identificador da location a ser informado na criação de uma recorrência.

ativacao	
object (Confirmação da ativação da recorrência)
Contendo dadosJornada

Responses
201 Recorrência criada
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/rec


Request samples
Payload
Content type
application/json
Example

Exemplo de Recorrência 1
Exemplo de Recorrência 1

Copy
Expand allCollapse all
{
"vinculo": {
"contrato": "63100862",
"devedor": {},
"objeto": "Serviço de Streamming de Música."
},
"calendario": {
"dataFinal": "2025-04-01",
"dataInicial": "2024-04-01",
"periodicidade": "MENSAL"
},
"valor": {
"valorRec": "35.00"
},
"politicaRetentativa": "NAO_PERMITE",
"loc": 108,
"ativacao": {
"dadosJornada": {}
}
}
Response samples
201400403503
Content type
application/json
Example

Exemplo de Recorrência 1
Exemplo de Recorrência 1

Copy
Expand allCollapse all
{
"idRec": "RN1234567820240115abcdefghijk",
"vinculo": {
"contrato": "63100862",
"devedor": {},
"objeto": "Serviço de Streamming de Música."
},
"calendario": {
"dataFinal": "2025-04-01",
"dataInicial": "2024-04-01",
"periodicidade": "MENSAL"
},
"politicaRetentativa": "NAO_PERMITE",
"recebedor": {
"cnpj": 1602606113708,
"nome": "Empresa de Serviços SA"
},
"valor": {
"valorRec": "35.00"
},
"status": "CRIADA",
"loc": {
"criacao": "2023-12-10T07:10:05.115Z",
"id": 108,
"location": "pix.example.com/qr/v2/rec/2353c790eefb11eaadc10242ac120002",
"idRec": "RN1234567820240115abcdefghijk"
},
"ativacao": {
"dadosJornada": {}
},
"atualizacao": [
{}
]
}
Consultar lista de recorrências
Endpoint utilizado para consultar várias recorrências.

Tem por objetivo consultar dados das recorrências como:

status, pagador, periodicidade, política de retentativa, log de atualização, dentre outros.

Pode ser chamado passando outros parâmetros, como: período, CPF, CNPJ, status, dentre outros.

Escopo requerido: rec.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/rec
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/rec
Ícone
query Parameters
inicio
required
string <date-time> (Data de início)
Example: inicio=2023-02-30T12:09:00Z
Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX

fim
required
string <date-time> (Data de fim)
Example: fim=2023-03-30T12:09:00Z
Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX

cpf	
string (CPF)
Filtro pelo CPF do devedor. Não pode ser utilizado ao mesmo tempo que o CNPJ.

cnpj	
string (CNPJ)
Filtro pelo CNPJ do devedor. Não pode ser utilizado ao mesmo tempo que o CPF.

locationPresente	
boolean
status	
string (Status do registro da recorrência)
Enum: "CRIADA" "APROVADA" "REJEITADA" "EXPIRADA" "CANCELADA"
Filtro pelo status da recorrência:

CRIADA: Recorrência criada, aguardando aprovação do pagador
APROVADA: Recorrência aprovada pelo pagador e ativa
REJEITADA: Recorrência rejeitada pelo pagador
EXPIRADA: Recorrência expirou sem aprovação
CANCELADA: Recorrência cancelada pelo recebedor ou pagador
paginacao.paginaAtual	
integer <int32> (Página atual)
Default: 0
Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.

paginacao.itensPorPagina	
integer <int32> (Itens por Página) <= 1000
Default: 100
Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.

convenio	
string (Convênio) <= 60 characters
Filtro pelo convênio associado.

Responses
200 Lista das recorrências cadastradas.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/rec


Response samples
200403503
Content type
application/json

Copy
Expand allCollapse all
{
"parametros": {
"inicio": "2024-04-01T00:00:00Z",
"fim": "2024-04-01T23:59:59Z",
"paginacao": {}
},
"recs": [
{}
]
}
Consultar recorrência
Endpoint utilizado para consultar uma recorrência específica. Tem por objetivo buscar os dados da recorrência, como: status, pagador, periodicidade, política de retentativa, log de atualização, dentre outros.

Escopo requerido: rec.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/rec/{idRec}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/rec/{idRec}
Ícone
path Parameters
idRec
required
string (Id Recorrência)
query Parameters
txid	
string (Id da Transação) [a-zA-Z0-9]{26,35}
Identificador da transação
O campo txid determina o identificador da transação. O objetivo desse campo é ser um elemento que possibilite ao PSP do recebedor apresentar ao usuário recebedor a funcionalidade de conciliação de pagamentos.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

Responses
200 Dados da recorrência.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/rec/{idRec}


Response samples
200403404503
Content type
application/json
Example

Exemplo de Recorrência Completa com Dados QR Jornada 2
Exemplo de Recorrência Completa com Dados QR Jornada 2

Copy
Expand allCollapse all
{
"idRec": "RN1234567820240115abcdefghijk",
"status": "APROVADA",
"valor": {
"valorRec": "300.00"
},
"vinculo": {
"contrato": "98625023",
"devedor": {},
"objeto": "Serviços de Gestão de Imóveis"
},
"calendario": {
"dataFinal": "2028-09-01",
"dataInicial": "2024-02-01",
"periodicidade": "MENSAL"
},
"politicaRetentativa": "NAO_PERMITE",
"loc": {
"criacao": "2023-12-19T12:28:05.230Z",
"id": 5100,
"location": "pix.example.com/qr/v2/rec/2353c790eefb11eaadc10242ac120002",
"idRec": "RN1234567820240115abcdefghijk"
},
"pagador": {
"codMun": "2673833",
"cpf": "75633122216",
"ispbParticipante": "81102623"
},
"recebedor": {
"cnpj": "92221288310574",
"nome": "Imobiliária Bom Sucesso"
},
"atualizacao": [
{},
{}
],
"dadosQR": {
"jornada": "JORNADA_2",
"pixCopiaECola": "00020126180014br.gov.bcb.pix5204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***80800014br.gov.bcb.pix2558pix.example.com/qr/v2/rec/2353c790eefb11eaadc10242ac120002630462C9"
}
}
Revisar/Cancelar recorrência
Endpoint utilizado para cancelar uma recorrência já criada.

O cancelamento de uma recorrência pode ser solicitado tanto pelo cliente recebedor que pode ter deixado de utilizar a forma de pagamento de Pix Automático, como o pagador pode solicitar o cancelamento, uma vez que ele não deseja mais realizar seus pagamentos por meio do Pix Automático.

Alguns campos podem ser alterados somente enquanto a recorrência ainda estiver pendente de confirmação pelo pagador, são eles: Data prevista do primeiro pagamento e identificador da transação.

Outros campos podem ser alterados mesmo após a confirmação da recorrência, são eles: Location e nome do devedor.

Escopo requerido: rec.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/rec/{idRec}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/rec/{idRec}
Ícone
path Parameters
idRec
required
string (Id Recorrência)
Request Body schema: application/json
Dados para revisão da recorrência.

status	
string (Status do registro da recorrência)
Value: "CANCELADA"
vinculo	
object (devedor)
Contendo o objeto devedor

loc	
integer <int64> (Id da location)
Identificador da location a ser informado na criação de uma recorrência.

calendario	
object (Informações sobre calendário da recorrência)
Contendo dataInicial

ativacao	
object (Confirmação da ativação da recorrência)
Contendo dadosJornada

Responses
200 Recorrência revisada.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

patch
/rec/{idRec}


Request samples
Payload
Content type
application/json

Copy
Expand allCollapse all
{
"loc": 108,
"vinculo": {
"devedor": {}
},
"calendario": {
"dataInicial": "2024-04-01"
},
"ativacao": {
"dadosJornada": {}
}
}
Response samples
200400403404503
Content type
application/json

Copy
Expand allCollapse all
{
"idRec": "RN1234567820240115abcdefghijk",
"vinculo": {
"contrato": "63100862",
"devedor": {},
"objeto": "Serviço de Streamming de Música."
},
"calendario": {
"dataFinal": "2025-04-01",
"dataInicial": "2024-04-01",
"periodicidade": "MENSAL"
},
"politicaRetentativa": "NAO_PERMITE",
"recebedor": {
"cnpj": 1602606113708,
"nome": "Empresa de Serviços SA"
},
"valor": {
"valorRec": "35.00"
},
"status": "CRIADA",
"loc": {
"criacao": "2023-12-10T07:10:05.115Z",
"id": 108,
"location": "pix.example.com/qr/v2/rec/2353c790eefb11eaadc10242ac120002",
"idRec": "RN1234567820240115abcdefghijk"
},
"ativacao": {
"dadosJornada": {}
},
"atualizacao": [
{}
]
}
Alterar status da recorrência (Sandbox)
Endpoint utilizado para alterar o status de uma recorrência criada em Sandbox.

Permite alterar o status da recorrência para:

APROVADA
CANCELADA
A aprovação da recorrência é necessária para prosseguir com a criação de cobranças recorrentes.

(Exclusivo para o ambiente Sandbox)

Escopo requerido: pix.write
rate limit:
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj-sandbox.partners.uatinter.co/pix/v2/sandbox/rec/{idRec}/status
Ícone
path Parameters
idRec
required
string (Id Recorrência)
Request Body schema: application/json
Dados para alterar a recorrência.

status
required
string
Enum: "APROVADA" "CANCELADA"
razao	
string
Enum: "ACCL" "CPCL" "DCSD" "ERSL" "FRUD" "PCFD" "SLCR" "SLDB" "NRES"
Razão para a mudança de status. Valores possíveis:

ACCL: Cancelamento motivado por encerramento de conta
CPCL: Cancelamento motivado por encerramento de empresa
DCSD: Cancelamento motivado por falecimento
ERSL: Cancelamento solicitado pelo usuário recebedor ou pelo seu participante por erro na solicitação de confirmação
FRUD: Cancelamento motivado por fraude
PCFD: Cancelamento solicitado pelo PSP recebedor por ausência de resposta à pain.009 dentro do prazo regulamentar
SLCR: Cancelamento solicitado pelo participante do usuário recebedor porque a mesma recorrência foi confirmada por meio de outra jornada, por exemplo, via QR Code
SLDB: Cancelamento solicitado pelo usuário recebedor
NRES: Cancelamento solicitado pelo usuário pagador
Responses
200 Status atualizado com sucesso.
400 Requisição com formato inválido.
404 Não encontrado.
500 Acesso não permitido.

patch
/sandbox/rec/{idRec}/status


Request samples
Payload
Content type
application/json

Copy
{
"status": "APROVADA",
"razao": "ACCL"
}
Response samples
400404500
Content type
application/problem+json

Copy
Expand allCollapse all
{
"type": "https://pix.bcb.gov.br/api/v2/error/NaoEncontrado",
"title": "Not found",
"status": 404,
"detail": "string",
"correlationId": "string",
"violacoes": [
{}
]
}
Pagar e autorizar QRCode de recorrência com cobrança vinculada (Sandbox)
Endpoint para pagar e autorizar um QRCode de recorrência com uma cobrança vinculada.

(Exclusivo para o ambiente Sandbox)

Escopo requerido: pix.write
rate limit:
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj-sandbox.partners.uatinter.co/pix/v2/sandbox/cob/pagamento
Ícone
Request Body schema: application/json
Dados para pagamento de cobrança com QRCode.

qrCode
required
string
URL do pixCopiaECola.

valor
required
number
Valor a ser pago.

cpfCnpj
required
string
cpfCnpj do pagador.

Responses
200 pagamento realizado
400 Requisição com formato inválido.
404 Não encontrado.
500 Acesso não permitido.

post
/sandbox/cob/pagamento


Request samples
Payload
Content type
application/json

Copy
{
"qrCode": "000201010200661010014BR.GOV.BCB.PIX2009url-exemplo.qrcode.sandbox.co/pj-s/v2/cob/f5c23856e5694ed48607ab0bd0172496520400005309863540550.005802BR5901*6013BELO HORIZONT61089999999962070503***801000014BR.GOV.BCB.PIX2578cdpj-sandbox.partners.uatinter.co/pj-s/v2/rec/60eb10961d744397903cdc376c3ae8a56300288A",
"valor": 100,
"cpfCnpj": 9008007006
}
Response samples
200400404500
Content type
application/json

Copy
{
"endToEnd": "E00416968202406141552CmNRIqASznP"
}
Solicitar Recorrência
Esta seção apresenta os endpoints relacionados ao gerenciamento de solicitações de confirmação de recorrência, que equivalem às autorizações necessárias.

Para que as recorrências tenham validade e possam gerar cobranças automaticamente, o cliente pagador precisa realizar o aceite.

Por meio dessa autorização, o cliente confirma que concorda com a recorrência estabelecida.

Criar solicitação de confirmação de recorrência
Endpoint utilizado para gerar a solicitação de recorrência.

Antes de gerar a solicitação de confirmação, é necessário criar a recorrência.

A autorização sempre estará vinculada a uma recorrência.

Para gerar a solicitação de confirmação, basta enviar o ID da recorrência, a data de expiração da solicitação e os dados do destinatário.

Escopo requerido: solicrec.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/solicrec
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/solicrec
Ícone
Request Body schema: application/json
Dados para geração da solicitação da recorrência.

idRec
required
string (ID Recorrência) = 29 characters [a-zA-Z0-9]{29}
Identificador da Recorrência
Regra de formação:

RAxxxxxxxxyyyyMMddkkkkkkkkkkk (29 caracteres; "case sensitive", isso é, diferencia letras maiúsculas e minúsculas), sendo:
"R": fixo (1 caractere). "R" para a recorrência criada dentro do Pix;
"A": identificação da possibilidade de novas tentativas, sendo possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
"xxxxxxxx": identificação do agente que presta serviço para o usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
"yyyyMMdd": data (8 caracteres) de criação da recorrência;
"kkkkkkkkkkk": sequencial criado pelo agente que gerou o (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:

"RRxxxxxxxxyyyyMMddkkkkkkkkkkk"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
"RNxxxxxxxxyyyyMMddkkkkkkkkkkk"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
calendario
required
object (Informações de calendário da solicitação da recorrência)
Contendo dataExpiracaoSolicitacao da solicitação de recorrência.

destinatario
required
object or object (DadosBancarios)
Contendo conta, ìspbParticipante, agencia e cpf ou cnpj do recebedor.

Responses
201 Solicitação de recorrência criada
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/solicrec


Request samples
Payload
Content type
application/json

Copy
Expand allCollapse all
{
"idRec": "RN123456782024011577825445612",
"calendario": {
"dataExpiracaoSolicitacao": "2023-12-20T12:17:11.926Z"
},
"destinatario": {
"agencia": "2569",
"conta": "550689",
"cpf": "15231470190",
"ispbParticipante": "91193552"
}
}
Response samples
201400403404503
Content type
application/json

Copy
Expand allCollapse all
{
"idSolicRec": "SC876456782024021577825445312",
"idRec": "RN123456782024011577825445612",
"calendario": {
"dataExpiracaoSolicitacao": "2023-12-20T12:17:11.926Z"
},
"status": "CRIADA",
"destinatario": {
"agencia": "2569",
"conta": "550689",
"cpf": "15231470190",
"ispbParticipante": "91193552"
},
"atualizacao": [
{}
],
"recPayload": {
"idRec": "RN123456782024011577825445612",
"vinculo": {},
"calendario": {},
"recebedor": {},
"valor": {},
"atualizacao": []
}
}
Consultar solicitação de recorrência.
Endpoint utilizado para consultar uma solicitação específica de recorrência.

O objetivo é obter os dados da solicitação de confirmação, como: status, informações do beneficiário, histórico de atualizações, política de retentativa, entre outros.

Escopo requerido: solicrec.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/solicrec/{idSolicRec}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/solicrec/{idSolicRec}
Ícone
path Parameters
idSolicRec
required
string (Id da solicitação da recorrência)
Responses
200 Dados da solicitação da recorrência.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/solicrec/{idSolicRec}


Response samples
200403404503
Content type
application/json
Example

Exemplo de solicitação de confirmação de recorrência 1
Exemplo de solicitação de confirmação de recorrência 1

Copy
Expand allCollapse all
{
"idSolicRec": "SC876456782024021577825445312",
"idRec": "RN123456782024011577825445612",
"calendario": {
"dataExpiracaoSolicitacao": "2023-12-20T12:17:11.926Z"
},
"status": "CRIADA",
"destinatario": {
"agencia": "2569",
"conta": "550689",
"cpf": "15231470190",
"ispbParticipante": "91193552"
},
"atualizacao": [
{}
],
"recPayload": {
"idRec": "RN123456782024011577825445612",
"vinculo": {},
"calendario": {},
"recebedor": {},
"valor": {},
"atualizacao": []
}
}
Revisar solicitação de recorrência.
Endpoint utilizado com o objetivo de cancelar uma solicitação de recorrência.

Escopo requerido: solicrec.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/solicrec/{idSolicRec}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/solicrec/{idSolicRec}
Ícone
path Parameters
idSolicRec
required
string (Id da solicitação da recorrência)
Request Body schema: application/json
Dados para revisão da solicitação da recorrência.

status
required
string (Status do registro da solicitação de recorrência)
Value: "CANCELADA"
Responses
201 Solicitação de recorrência atualizada
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

patch
/solicrec/{idSolicRec}


Request samples
Payload
Content type
application/json

Copy
{
"status": "CANCELADA"
}
Response samples
201400403404503
Content type
application/json

Copy
Expand allCollapse all
{
"idSolicRec": "SC876456782024021577825445312",
"idRec": "RN123456782024011577825445612",
"calendario": {
"dataExpiracaoSolicitacao": "2024-06-11T07:17:11.008Z"
},
"status": "CANCELADA",
"destinatario": {
"agencia": "2569",
"conta": "550689",
"cpf": "15231470190",
"ispbParticipante": "91193552"
},
"atualizacao": [
{},
{}
],
"recPayload": {
"idRec": "RN123456782024011577825445612",
"vinculo": {},
"valor": {},
"calendario": {},
"recebedor": {},
"atualizacao": []
}
}
Alterar status da solicitação de recorrência (Sandbox)
Endpoint utilizado para alterar o status de uma recorrência criada no ambiente Sandbox.

Permite modificar os seguintes status da recorrência:

Do Status	para	Status
CRIADA	>>	ENVIADA
ENVIADA	>>	RECEBIDA
RECEBIDA	>>	ACEITA
RECEBIDA	>>	REJEITADA
RECEBIDA	>>	EXPIRADA
A aceitação da solicitação de recorrência é necessária para prosseguir com a criação de cobranças recorrentes.

(Exclusivo para o ambiente Sandbox)

Escopo requerido: solicrec.write
rate limit:
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj-sandbox.partners.uatinter.co/pix/v2/sandbox/solicrec/{idRec}/status
Ícone
path Parameters
idRec
required
string (Id Recorrência)
Request Body schema: application/json
Dados para alterar a solicitação de recorrência.

status
required
string
Enum: "CANCELADA" "ENVIADA" "ACEITA" "REJEITADA" "RECEBIDA"
Responses
200 Status atualizado com sucesso.
400 Requisição com formato inválido.
404 Não encontrado.
500 Acesso não permitido.

patch
/sandbox/solicrec/{idRec}/status


Request samples
Payload
Content type
application/json

Copy
{
"status": "CANCELADA"
}
Response samples
400404500
Content type
application/problem+json

Copy
Expand allCollapse all
{
"type": "https://pix.bcb.gov.br/api/v2/error/NaoEncontrado",
"title": "Not found",
"status": 404,
"detail": "string",
"correlationId": "string",
"violacoes": [
{}
]
}
Cobrança Recorrente
Esta seção apresenta os endpoints relacionados ao gerenciamento de cobranças associadas a uma recorrência.

As cobranças só poderão ser geradas utilizando este endpoint após a recorrência ser autorizada por meio da solicitação de recorrência (autorização).

Criar cobrança recorrente
Endpoint utilizado para gerar uma cobrança recorrente.

Lembre-se de que as cobranças geradas nas jornadas de autorização 3 e 4 não são geradas por este endpoint.

Na jornada 3, será gerada uma cobrança do tipo "cob", enquanto na jornada 4 será uma cobrança do tipo "cobv".

Para a geração da cobrança recorrente, devem ser informados o ID da recorrência, a data de vencimento da cobrança, o valor, se ajusta para dia útil, os dados do devedor, os dados do recebedor, entre outros.

Escopo requerido: cobr.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/cobr
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobr
Ícone
Request Body schema: application/json
Dados para geração da cobrança recorrente.

idRec
required
string (ID Recorrência) = 29 characters [a-zA-Z0-9]{29}
Identificador da Recorrência
Regra de formação:

RAxxxxxxxxyyyyMMddkkkkkkkkkkk (29 caracteres; "case sensitive", isso é, diferencia letras maiúsculas e minúsculas), sendo:
"R": fixo (1 caractere). "R" para a recorrência criada dentro do Pix;
"A": identificação da possibilidade de novas tentativas, sendo possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
"xxxxxxxx": identificação do agente que presta serviço para o usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
"yyyyMMdd": data (8 caracteres) de criação da recorrência;
"kkkkkkkkkkk": sequencial criado pelo agente que gerou o (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:

"RRxxxxxxxxyyyyMMddkkkkkkkkkkk"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
"RNxxxxxxxxyyyyMMddkkkkkkkkkkk"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
infoAdicional	
string (Informações adicionais da fatura.) <= 140 characters
Informações adicionais da fatura.

calendario
required
object (Informações sobre calendário da cobrança)
Contendo dataDeVencimento

valor
required
object (Valor da cobrança recorrente)
Contendo valorOriginal

ajusteDiaUtil
required
boolean (Ajuste data vencimento para próximo dia útil)
Default: true
Campo de ativação do ajuste da data de vencimento para próximo dia útil caso o vencimento corrente seja um dia não útil. O PSP Pagador deverá considerar os feriados locais com base no código município do usuário pagador.

recebedor
required
object (Dados bancários do recebedor)
Contendo nome, cnpj, conta, tipoConta e agencia

devedor	
object (Dados do devedor)
Contendo email, logradouro, cidade, uf e cep

Responses
201 Cobrança recorrente criada.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/cobr


Request samples
Payload
Content type
application/json

Copy
Expand allCollapse all
{
"idRec": "RR1234567820240115abcdefghijk",
"infoAdicional": "Serviços de Streamming de Música e Filmes.",
"calendario": {
"dataDeVencimento": "2024-04-15"
},
"valor": {
"original": "106.07"
},
"ajusteDiaUtil": true,
"devedor": {
"cep": "89256-140",
"cidade": "Uberlândia",
"email": "sebastiao.tavares@mail.com",
"logradouro": "Alameda Franco 1056",
"uf": "MG"
},
"recebedor": {
"agencia": "9708",
"conta": 12682,
"tipoConta": "CORRENTE"
}
}
Response samples
201400403503
Content type
application/json

Copy
Expand allCollapse all
{
"idRec": "RR1234567820240115abcdefghijk",
"txid": "3136957d93134f2184b369e8f1c0729d",
"infoAdicional": "Serviços de Streamming de Música e Filmes.",
"calendario": {
"criacao": "2024-04-01",
"dataDeVencimento": "2024-04-15"
},
"status": "CRIADA",
"valor": {
"original": "106.07"
},
"politicaRetentativa": "PERMITE_3R_7D",
"ajusteDiaUtil": true,
"devedor": {
"cep": "89256-140",
"cidade": "Uberlândia",
"email": "sebastiao.tavares@mail.com",
"logradouro": "Alameda Franco 1056",
"uf": "MG"
},
"recebedor": {
"agencia": "9708",
"conta": 12682,
"tipoConta": "CORRENTE"
},
"atualizacao": [
{}
]
}
Consultar lista de cobranças recorrentes
Endpoint utilizado para consultar uma lista de cobranças recorrentes através de parâmetros como início, fim, idRec, cpf, cnpj e status. Endpoint utilizado para consultar várias cobranças recorrentes.

Tem por objetivo consultar os dados das cobranças recorrentes como: idRec, txId, valor, status, pix, dentre outros.

Pode ser chamado passando parâmetros, como: período, CPF, CNPJ, status.

Escopo requerido: cobr.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/cobr
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobr
Ícone
query Parameters
inicio
required
string <date-time> (Data de início)
Example: inicio=2023-02-30T12:09:00Z
Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX

fim
required
string <date-time> (Data de fim)
Example: fim=2023-03-30T12:09:00Z
Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX

idRec	
string (ID Recorrência) = 29 characters [a-zA-Z0-9]{29}
Filtro pelo Identificador da Recorrência.

cpf	
string (CPF)
Filtro pelo CPF do devedor. Não pode ser utilizado ao mesmo tempo que o CNPJ.

cnpj	
string (CNPJ)
Filtro pelo CNPJ do devedor. Não pode ser utilizado ao mesmo tempo que o CPF.

status	
string (Status do registro da recorrência)
Enum: "CRIADA" "APROVADA" "REJEITADA" "EXPIRADA" "CANCELADA"
Filtro pelo status da recorrência:

CRIADA: Recorrência criada, aguardando aprovação do pagador
APROVADA: Recorrência aprovada pelo pagador e ativa
REJEITADA: Recorrência rejeitada pelo pagador
EXPIRADA: Recorrência expirou sem aprovação
CANCELADA: Recorrência cancelada pelo recebedor ou pagador
paginacao.paginaAtual	
integer <int32> (Página atual)
Default: 0
Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.

paginacao.itensPorPagina	
integer <int32> (Itens por Página) <= 1000
Default: 100
Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.

convenio	
string (Convênio) <= 60 characters
Filtro pelo convênio associado.

Responses
200 Lista de cobranças recorrentes.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobr


Response samples
200403503
Content type
application/json

Copy
Expand allCollapse all
{
"parametros": {
"inicio": "2024-04-01T00:00:00Z",
"fim": "2024-12-01T23:59:59Z",
"paginacao": {}
},
"cobsr": [
{}
]
}
Solicitar retentativa de cobrança.
Endpoint utilizado para solicitar a retentativa de uma cobrança recorrente.

Caso uma cobrança não seja liquidada na data esperada, e a Política de retentativas da recorrência permita, o recebedor poderá solicitar uma nova tentativa de liquidação.

Para isso, ele precisa informar o TXID e a data prevista para liquidação da cobrança em questão.

Escopo requerido: cobr.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/cobr/{txid}/retentativa/{data}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobr/{txid}/retentativa/{data}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

data
required
string <date>
Example: 2023-04-01T00:00:00.000Z
Data prevista para liquidação da ordem de pagamento correspondente. Trata-se de uma data, no formato YYYY-MM-DD, segundo ISO 8601.

Responses
201 Cobrança recorrente.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/cobr/{txid}/retentativa/{data}


Response samples
201400403404503
Content type
application/json

Copy
Expand allCollapse all
{
"idRec": "RR123456782024061999000566354",
"txid": "7f733863543b4a16b516d839bd4bc34e",
"calendario": {
"criacao": "2024-05-20",
"dataDeVencimento": "2024-06-20"
},
"valor": {
"original": "50.33"
},
"status": "ATIVA",
"politicaRetentativa": "PERMITE_3R_7D",
"ajusteDiaUtil": true,
"devedor": {
"cep": "63259-740",
"cidade": "Campinas",
"email": "beltrano.silva@mail.com",
"logradouro": "Rua Gonçalves Dias 605",
"uf": "SP"
},
"recebedor": {
"cnpj": "58966551101210",
"conta": "997182",
"tipoConta": "CORRENTE"
},
"tentativas": [
{},
{}
],
"atualizacao": [
{},
{}
]
}
Consultar cobrança recorrente
Endpoint utilizado para consultar uma cobrança recorrente específica.

O objetivo é obter os dados da cobrança recorrente, como: status, histórico de atualizações, política de retentativa, entre outros.

Escopo requerido: cobr.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/cobr/{txid}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobr/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

Responses
200 Dados da cobrança recorrente.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobr/{txid}


Response samples
200403404503
Content type
application/json
Example

Exemplo de cobrança recorrente 1
Exemplo de cobrança recorrente 1

Copy
Expand allCollapse all
{
"idRec": "RR1234567820240115abcdefghijk",
"txid": "3136957d93134f2184b369e8f1c0729d",
"infoAdicional": "Serviços de Streamming de Música e Filmes.",
"calendario": {
"criacao": "2024-04-01",
"dataDeVencimento": "2024-04-15"
},
"valor": {
"original": "106.07"
},
"status": "CRIADA",
"politicaRetentativa": "PERMITE_3R_7D",
"ajusteDiaUtil": true,
"devedor": {
"cep": "89256-140",
"cidade": "Uberlândia",
"email": "sebastiao.tavares@mail.com",
"logradouro": "Alameda Franco 1056",
"uf": "MG"
},
"recebedor": {
"agencia": "9708",
"conta": 12682,
"tipoConta": "CORRENTE"
},
"atualizacao": [
{}
]
}
Criar cobrança recorrente com TxId
Endpoint utilizado para gerar uma cobrança recorrente usando um txId específico.

Lembre-se de que as cobranças geradas nas jornadas de autorização 3 e 4 não são geradas por este endpoint.

Na jornada 3, será gerada uma cobrança do tipo "cob", enquanto na jornada 4 será uma cobrança do tipo "cobv".

Para a geração da cobrança recorrente, devem ser informados o ID da recorrência, a data de vencimento da cobrança, o valor, se ajusta para dia útil, os dados do devedor, os dados do recebedor, entre outros.

Escopo requerido: cobr.write rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.*

  https://cdpj.partners.bancointer.com.br/pix/v2/cobr/{txid}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobr/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

Request Body schema: application/json
Dados para geração da cobrança recorrente.

idRec
required
string (ID Recorrência) = 29 characters [a-zA-Z0-9]{29}
Identificador da Recorrência
Regra de formação:

RAxxxxxxxxyyyyMMddkkkkkkkkkkk (29 caracteres; "case sensitive", isso é, diferencia letras maiúsculas e minúsculas), sendo:
"R": fixo (1 caractere). "R" para a recorrência criada dentro do Pix;
"A": identificação da possibilidade de novas tentativas, sendo possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
"xxxxxxxx": identificação do agente que presta serviço para o usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
"yyyyMMdd": data (8 caracteres) de criação da recorrência;
"kkkkkkkkkkk": sequencial criado pelo agente que gerou o (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:

"RRxxxxxxxxyyyyMMddkkkkkkkkkkk"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
"RNxxxxxxxxyyyyMMddkkkkkkkkkkk"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
infoAdicional	
string (Informações adicionais da fatura.) <= 140 characters
Informações adicionais da fatura.

calendario
required
object (Informações sobre calendário da cobrança)
Contendo dataDeVencimento

valor
required
object (Valor da cobrança recorrente)
Contendo valorOriginal

ajusteDiaUtil
required
boolean (Ajuste data vencimento para próximo dia útil)
Default: true
Campo de ativação do ajuste da data de vencimento para próximo dia útil caso o vencimento corrente seja um dia não útil. O PSP Pagador deverá considerar os feriados locais com base no código município do usuário pagador.

recebedor
required
object (Dados bancários do recebedor)
Contendo nome, cnpj, conta, tipoConta e agencia

devedor	
object (Dados do devedor)
Contendo email, logradouro, cidade, uf e cep

Responses
201 Cobrança imediata recorrente.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

put
/cobr/{txid}


Request samples
Payload
Content type
application/json

Copy
Expand allCollapse all
{
"idRec": "RR1234567820240115abcdefghijk",
"infoAdicional": "Serviços de Streamming de Música e Filmes.",
"calendario": {
"dataDeVencimento": "2024-04-15"
},
"valor": {
"original": "106.07"
},
"ajusteDiaUtil": true,
"devedor": {
"cep": "89256-140",
"cidade": "Uberlândia",
"email": "sebastiao.tavares@mail.com",
"logradouro": "Alameda Franco 1056",
"uf": "MG"
},
"recebedor": {
"agencia": "9708",
"conta": 12682,
"tipoConta": "CORRENTE"
}
}
Response samples
201400403404503
Content type
application/json

Copy
Expand allCollapse all
{
"idRec": "RR1234567820240115abcdefghijk",
"txid": "3136957d93134f2184b369e8f1c0729d",
"infoAdicional": "Serviços de Streamming de Música e Filmes.",
"calendario": {
"criacao": "2024-04-01",
"dataDeVencimento": "2024-04-15"
},
"valor": {
"original": "106.07"
},
"status": "CRIADA",
"politicaRetentativa": "PERMITE_3R_7D",
"ajusteDiaUtil": true,
"devedor": {
"cep": "89256-140",
"cidade": "Uberlândia",
"email": "sebastiao.tavares@mail.com",
"logradouro": "Alameda Franco 1056",
"uf": "MG"
},
"recebedor": {
"agencia": "9708",
"conta": 12682,
"tipoConta": "CORRENTE"
},
"atualizacao": [
{}
]
}
Cancelar cobrança recorrente
Endpoint utilizado com o objetivo de cancelar uma cobrança recorrente.
A solicitação de cancelamento de uma cobrança recorrente, de acordo com as diretrizes do Bacen, deve ocorrer antes das 22h00 do dia anterior à data da liquidação da cobrança.

Escopo requerido: cobr.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/cobr/{txid}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobr/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

Request Body schema: application/json
Dados para geração da cobrança.

status	
string (Status do registro da cobrança)
Value: "CANCELADA"
Responses
200 Cobrança recorrente revisada.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

patch
/cobr/{txid}


Request samples
Payload
Content type
application/json

Copy
{
"status": "CANCELADA"
}
Response samples
200400403404503
Content type
application/json

Copy
Expand allCollapse all
{
"idRec": "RN985156112024071999000566354",
"txid": "517bd858b59d458a841280b0f0a60bfa",
"calendario": {
"criacao": "2024-05-20",
"dataDeVencimento": "2024-06-20"
},
"valor": {
"original": "210.00"
},
"status": "CANCELADA",
"politicaRetentativa": "NAO_PERMITE",
"ajusteDiaUtil": true,
"devedor": {
"cep": "26901-340",
"cidade": "São Luís",
"email": "fulano.tal@mail.com",
"logradouro": "Alameda Cardoso 1007",
"uf": "MA"
},
"recebedor": {
"cnpj": "31166575201770",
"conta": "107262",
"nome": "Empresa de Telecomunicações SA",
"tipoConta": "POUPANÇA"
},
"tentativas": [
{}
],
"encerramento": {
"cancelamento": {}
},
"atualizacao": [
{},
{},
{}
]
}
Cancelamento de uma cobrança recorrente através de estimulo externo (Sandbox)
Endpoint responsável pela mudança de status de uma cobrança recorrente através de estimulo externo.

(Exclusivo para o ambiente Sandbox)

Escopo requerido: cobr.write
rate limit:
 10 chamadas por minuto
Obs : O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj-sandbox.partners.uatinter.co/pix/v2/sandbox/cobr/{txid}/status
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

Request Body schema: application/json
Dados para alterar a cobrança recorrente.

status
required
string
Value: "CANCELADA"
razao
required
string
Enum: "UNSPECIFIED" "ACCOUNT_CANCELED" "ACCOUNT_BLOCKED" "RECURRENCE_CANCELED" "SETTLEMENT_FAILED" "OTHER" "REQUESTED_BY_PAYER" "REQUESTED_BY_RECEIVER"
Razão para a mudança de status. Valores possíveis:

UNSPECIFIED: Sem motivo específico fornecido.
ACCOUNT_CANCELED: Conta cancelada.
ACCOUNT_BLOCKED: Conta bloqueada.
RECURRENCE_CANCELED: Recorrência cancelada.
SETTLEMENT_FAILED: Liquidação falhou.
OTHER: Outras razões não especificadas.
REQUESTED_BY_PAYER: Cancelamento solicitado pelo pagador.
REQUESTED_BY_RECEIVER: Cancelamento solicitado pelo recebedor.
Responses
200 Recorrência atualizada com sucesso.
400 Requisição com formato inválido.
404 Não encontrado.

patch
/sandbox/cobr/{txId}/status


Request samples
Payload
Content type
application/json

Copy
{
"status": "CANCELADA",
"razao": "UNSPECIFIED"
}
Response samples
400404
Content type
application/problem+json

Copy
Expand allCollapse all
{
"type": "https://pix.bcb.gov.br/api/v2/error/NaoEncontrado",
"title": "Not found",
"status": 404,
"detail": "string",
"correlationId": "string",
"violacoes": [
{}
]
}
Pagar cobrança recorrente (Sandbox)
Endpoint para pagar uma cobrança recorrente.

(Exclusivo para o ambiente Sandbox)

Escopo requerido: cobr.write
rate limit:
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj-sandbox.partners.uatinter.co/pix/v2/sandbox/cobr/pagamento
Ícone
Request Body schema: application/json
Dados para pagamento da cobrança recorrente.

valor
required
number
cpfCnpj
required
string
txId
required
string
chave
required
string
Responses
200 pagamento realizado
400 Requisição com formato inválido.
404 Não encontrado.
500 Acesso não permitido.

post
/sandbox/cobr/pagamento


Request samples
Payload
Content type
application/json

Copy
{
"valor": 100,
"cpfCnpj": 9008007006,
"txId": "33beb661beda44a8928fef47dbeb2dc5",
"chave": "12345678901"
}
Response samples
200400404500
Content type
application/json

Copy
{
"endToEnd": "E00416968202406141552CmNRIqASznP"
}
Location da Recorrência
Esta seção apresenta os endpoints relacionados ao gerenciamento de payloads associadas a uma recorrência.

Criar location do payload.
Endpoint utilizado para criar o payload location da recorrência.

Escopo requerido: payloadlocationrec.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/locrec
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/locrec
Ícone
Responses
201 Dados da location do Payload.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/locrec


Response samples
201403503
Content type
application/json

Copy
{
"id": 12069,
"location": "pix.example.com/qr/v2/rec/2353c790eefb11eaadc10242ac120002",
"criacao": "2023-12-20T12:38:28.774Z"
}
Consultar locations cadastradas.
Endpoint utilizado para consultar as locations de recorrência cadastradas.

Escopo requerido: payloadlocationrec.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/locrec
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/locrec
Ícone
query Parameters
inicio
required
string <date-time> (Data de início)
Filtra os registros cuja data de criação seja maior ou igual que a data de início. Respeita RFC 3339.

fim
required
string <date-time> (Data de fim)
Filtra os registros cuja data de criação seja menor ou igual que a data de fim. Respeita RFC 3339.

idRecPresente	
boolean
convenio	
string (Convênio) <= 60 characters
Filtro pelo convênio associado.

paginacao.paginaAtual	
integer <int32> (Página atual)
Default: 0
Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.

paginacao.itensPorPagina	
integer <int32> (Itens por Página) <= 1000
Default: 100
Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.

Responses
200 lista dos locations cadastrados de acordo com o critério de busca.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/locrec


Response samples
200403503
Content type
application/json

Copy
Expand allCollapse all
{
"parametros": {
"inicio": "2020-01-01T00:00:00Z",
"fim": "2020-12-01T17:00:00Z",
"idRecPresente": true,
"recebedor": {},
"paginacao": {}
},
"loc": [
{}
]
}
Recuperar location do payload.
Endpoint utilizado para recuperar a location do payload

Escopo requerido: payloadlocationrec.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/locrec/{id}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/locrec/{id}
Ícone
path Parameters
id
required
string (Id da location cadastrada para servir um payload)
Responses
200 Dados da location do Payload.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/locrec/{id}


Response samples
200403404503
Content type
application/json

Copy
{
"id": 12069,
"location": "pix.example.com/qr/v2/rec/2353c790eefb11eaadc10242ac120002",
"criacao": "2023-12-20T12:38:28.774Z",
"idRec": "RR123456782024011510056892226"
}
Desvincular uma recorrência de uma location.
Endpoint destinado para desvincular uma recorrência de uma location.

Se executado com sucesso, a entidade loc não apresentará mais uma recorrência, se apresentava anteriormente à chamada.

Adicionalmente, a entidade associada ao recurso desvinculado também passará a não mais apresentar um location.

Esta operação não altera o status do recurso em questão.

Escopo requerido: payloadlocationrec.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/locrec/{id}/idRec
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/locrec/{id}/idRec
Ícone
path Parameters
id
required
string (Id da location cadastrada para servir um payload)
Responses
200 Entidade representada pelo recurso informado desvinculada com sucesso.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

delete
/locrec/{id}/idRec


Response samples
200403404503
Content type
application/json

Copy
{
"id": 12069,
"location": "pix.example.com/qr/v2/rec/2353c790eefb11eaadc10242ac120002",
"criacao": "2023-12-20T12:38:28.774Z"
}
Webhook de Recorrências
Esta seção apresenta os endpoints relacionados ao gerenciamento do serviço de notificações acerca de recorrências.

Criar WebhookRec
Endpoint destinado a criar um webhook para receber notificações (callbacks) relacionados a recorrências.

Somente recorrências associadas a chave e conta serão notificadas.

Caso o servidor de webhook retorne erro de recebimento do callback, serão realizadas até 4 tentativas com intervalos de 20, 30, 60 e 120 minutos.

Escopo requerido: webhookrec.write
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.*

  https://cdpj.partners.bancointer.com.br/pix/v2/webhookrec
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/webhookrec
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
webhookUrl
required
string <uri> (URL Webhook)
Responses
200 Sucesso
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.
Callbacks
post{$request.body#/webhookUrl}/rec

put
/webhookrec


Request samples
Payload
Content type
application/json

Copy
{
"webhookUrl": "https://usuario.recebedor.com/api/webhookrec/"
}
Response samples
400403404503
Content type
application/problem+json

Copy
{
"type": "https://pix.bcb.gov.br/api/v2/error/WebhookOperacaoInvalida",
"title": "Webhook inválido.",
"status": 400,
"detail": "A presente requisição busca criar um webhook sem respeitar o schema ou, ainda, com sentido semanticamente inválido."
}
Callback payload samples
Callback
POST: {$request.body#/webhookUrl}/rec
Content type
application/json

Copy
Expand allCollapse all
{
"recs": [
{}
]
}
Consultar Webhook cadastrado
Endpoint utilizado para recuperar de informações sobre o Webhook cadastrado.

Escopo requerido: webhookrec.read
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/webhookrec
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/webhookrec
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sucesso
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/webhookrec


Response samples
200403404503
Content type
application/json

Copy
{
"webhookUrl": "https://usuario.recebedor.com/api/webhookrec/",
"criacao": "2023-12-20T12:51:16.485Z"
}
Excluir Webhook
Endpoint destinado ao cancelamento de um webhookRec.

Escopo requerido: webhookrec.write
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/locrec/{id}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/locrec/{id}
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
204 Sucesso
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

delete
/webhookrec


Response samples
403404503
Content type
application/problem+json

Copy
{
"type": "https://pix.bcb.gov.br/api/v2/error/AcessoNegado",
"title": "Acesso Negado",
"status": 403,
"detail": "Requisição de participante autenticado que viola alguma regra de autorização."
}
Webhook de Cobranças Recorrentes
Esta seção apresenta os endpoints relacionados ao gerenciamento do serviço de notificações de cobranças recorrentes.

Criar WebhookCobR
Endpoint destinado a criar um webhook para receber notificações (callbacks) relacionados a cobranças recorrentes.

Somente cobranças recorrentes associadas ao usuário recebedor serão notificadas.

Caso o servidor de webhook retorne erro de recebimento do callback, serão realizadas até 4 tentativas com intervalos de 20, 30, 60 e 120 minutos.

Escopo requerido: webhookcobr.write
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.*

  https://cdpj.partners.bancointer.com.br/pix/v2/webhookcobr
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/webhookcobr
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
webhookUrl
required
string <uri> (URL Webhook)
Responses
200 Sucesso
400 Requisição com formato invÃ¡lido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.
Callbacks
post{$request.body#/webhookUrl}/cobr

put
/webhookcobr


Request samples
Payload
Content type
application/json

Copy
{
"webhookUrl": "https://usuario.recebedor.com/api/webhookcobr/"
}
Response samples
400403404503
Content type
application/problem+json

Copy
{
"type": "https://pix.bcb.gov.br/api/v2/error/WebhookOperacaoInvalida",
"title": "Webhook inválido.",
"status": 400,
"detail": "A presente requisição busca criar um webhook sem respeitar o schema ou, ainda, com sentido semanticamente inválido."
}
Callback payload samples
Callback
POST: {$request.body#/webhookUrl}/cobr
Content type
application/json

Copy
Expand allCollapse all
{
"cobsr": [
{}
]
}
Consultar Webhook cadastrado
Endpoint utilizado para recuperar de informações sobre o Webhook cadastrado.

Escopo requerido: webhookcobr.read
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/webhookcobr
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/webhookcobr
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sucesso
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/webhookcobr


Response samples
200403404503
Content type
application/json

Copy
{
"webhookUrl": "https://usuario.recebedor.com/api/webhookcobr/",
"criacao": "2023-12-20T12:51:16.485Z"
}
Excluir Webhook
Endpoint destinado ao cancelamento de um webhookCobR.

Escopo requerido: webhookcobr.write
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj.partners.bancointer.com.br/pix/v2/webhookcobr
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/webhookcobr
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
204 Sucesso
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

delete
/webhookcobr


Response samples
403404503
Content type
application/problem+json

Copy
{
"type": "https://pix.bcb.gov.br/api/v2/error/AcessoNegado",
"title": "Acesso Negado",
"status": 403,
"detail": "Requisição de participante autenticado que viola alguma regra de autorização."
}
