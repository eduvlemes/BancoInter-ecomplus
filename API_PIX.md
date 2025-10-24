API Pix
A API Pix padroniza serviços oferecidos pelo PSP recebedor no contexto do arranjo Pix, como criação de cobrança, verificação de Pix recebidos, devolução e consultas. Os serviços expostos pelo PSP recebedor permitem ao usuário recebedor estabelecer integração de sua automação com os serviços Pix do PSP.

Evolução da API Pix
Alterações sem quebra de contrato e esclarecimentos às especificações podem ocorrer a qualquer momento. Clientes devem estar preparados para lidar com essas mudanças sem quebrar. As seguintes mudanças são esperadas e consideradas retrocompatíveis:

Adição de novos recursos na API Pix.
Adição de novos parâmetros opcionais a cobranças.
Adição de novos campos em respostas da API Pix.
Alteração da ordem de campos.
Adição de novos elementos em enumerações
Tratamento de erros
A API Pix retorna códigos de status HTTP para indicar sucesso ou falhas das requisições.

Códigos 2xx indicam sucesso. Códigos 4xx indicam falhas causadas pelas informações enviadas pelo cliente ou pelo estado atual das entidades. Códigos 5xx indicam problemas no serviço no lado da API Pix.

As respostas de erro incluem no corpo detalhes do erro seguindo o schema da RFC 7807.

O campo type identifica o tipo de erro e na API Pix segue o padrão:

https://pix.bcb.gov.br/api/v2/error/<TipoErro>

O padrão acima listado, referente ao campo type, não consiste, necessariamente, em uma URL que apresentará uma página web válida, ou um endpoint válido, embora possa, futuramente, ser exatamente o caso. O objetivo primário é apenas e tão somente identificar o tipo de erro.

Abaixo estão listados os tipos de erro e possíveis violações da API Pix.

Gerais
Esta seção reúne erros que poderiam ser retornados por quaisquer endpoints listados na API Pix.

RequisicaoInvalida
Significado: Requisição inválida.
HTTP Status Code: 400 Bad Request.
AcessoNegado
Significado: Requisição de participante autenticado que viola alguma regra de autorização.
HTTP Status Code: 403 Forbidden.
NaoEncontrado
Significado: Entidade não encontrada.
HTTP Status Code: 404 Not Found.
ErroInternoDoServidor
Significado: Condição inesperada ao processar requisição.
HTTP Status Code: 500 Internal Server Error.
ServicoIndisponivel
Significado: Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.
HTTP Status Code: 503 Service Unavailable.
Tag CobPayload
Esta seção reúne erros retornados pelos endpoints organizados sob a tag CobPayload. Estes erros indicam problemas na tentativa de recuperação, via location, do Payload JSON que representa a cobrança.

CobPayloadNaoEncontrado
Significado: a cobrança em questão não foi encontrada para a location requisitada.
HTTP Status Code: 404 ou 410.
endpoints: GET /{pixUrlAccessToken}, GET /cobv/{pixUrlAccessToken}.
Se a presente location exibia uma cobrança, mas não a exibirá mais de maneira permanentemente, pode-se aplicar o HTTP status code 410. Se a presente location não está exibindo nenhuma cobrança, pode-se utilizar o HTTP status code 404.

Uma cobrança pode estar "expirada" (calendario.expiracao), "vencida", "Concluida", entre outros estados em que não poderia ser efetivamente paga. Nesses casos, é uma liberalidade do PSP recebedor retornar o presente código de erro ou optar por servir o payload de qualquer maneira, objetivando fornecer uma informação adicional ao usuário pagador final a respeito da cobrança.

CobPayloadOperacaoInvalida
Significado: a cobrança existe, mas a requisição é inválida.
HTTP Status Code: 400.
endpoints: GET /cobv/{pixUrlAccessToken}.
Violações:

codMun não respeita o schema.
codMun não é um código válido segundo a tabela de municípios do IBGE.
DPP não respeita o schema.
DPP anterior ao momento presente.
DPP superior à validade da cobrança em função dos parâmetros calendario.dataDeVencimento e calendario.validadeAposVencimento. Exemplo: dataDeVencimento => 2020-12-25, validadeAposVencimento => 10, DPP => 2021-01-05. Neste exemplo, o parâmetro DPP é inválido considerando o contexto apresentado porque é uma data em que a cobrança não poderá ser paga. A cobrança, neste exemplo, não será considerada válida a partir da data 2021-01-05.
Tag Cob
Esta seção reúne erros retornados pelos endpoints organizados sob a tag Cob. Esses erros indicam problemas no gerenciamento de uma cobrança para pagamento imediato.

CobNaoEncontrado
Significado: Cobrança não encontrada para o txid informado.
HTTP Status Code: 404.
endpoints: [GET|PATCH] /cob/{txid}.
CobOperacaoInvalida
Significado: a requisição que busca alterar ou criar uma cobrança para pagamento imediato não respeita o schema ou está semanticamente errada.
HTTP Status Code: 400.
endpoints: [POST|PUT|PATCH] /cob/{txid}.
Violações para os endpoints PUT|PATCH /cob/{txid}:

O campo cob.calendario.expiracao é igual ou menor que zero.
O campo cob.valor.original não respeita o schema.
O campo cob.valor.original é zero.
O objeto cob.devedor não respeita o schema.
O campo cob.chave não respeita o schema.
O campo cob.chave corresponde a uma conta que não pertence a este usuário recebedor.
O campo solicitacaoPagador não respeita o schema.
O objeto infoAdicionais não respeita o schema.
O location referenciado por loc.id inexiste.
O location referenciado por loc.id já está sendo utilizado por outra cobrança.
O location referenciado por cob.loc.id apresenta tipo "cobv" (deveria ser "cob").
Violações específicas para o endpoint PUT /cob/{txid}:

A cobrança já existe, não está no status ATIVA, e a presente requisição busca alterá-la.
Violações específicas para o endpoint PATCH /cob/{txid}:

A cobrança não está ATIVA, e a presente requisição busca alterá-la.
A cobrança está ATIVA, e a presente requisição propõe alterar seu status para REMOVIDA_PELO_USUARIO_RECEBEDOR juntamente com outras alterações (não faz sentido remover uma cobrança ao mesmo tempo em que se realizam alterações que não serão aproveitadas).
o campo cob.status não respeita o schema.
CobConsultaInvalida
Significado: os parâmetros de consulta à lista de cobranças para pagamento imediato não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: GET /cob e GET /cob/{txid}.
Violações específicas para o endpoint GET /cob:

algum dos parâmetros informados para a consulta não respeita o schema.
o timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
ambos os parâmetros cpf e cnpj estão preenchidos.
o parâmetro paginacao.paginaAtual é negativo.
o parâmetro paginacao.itensPorPagina é negativo.
Violações específicas para o endpoint GET /cob/{txid}:

o parâmetro revisao corresponde a uma revisão inexistente para a cobrança apontada pelo parâmetro txid.
Tag CobV
Esta seção reúne erros retornados pelos endpoints organizados sob a tag CobV. Esses erros indicam problemas no gerenciamento de uma cobrança com vencimento.

CobVNaoEncontrada
Significado: Cobrança com vencimento não encontrada para o txid informado.
HTTP Status Code: 404.
endpoints: [GET|PATCH] /cobv/{txid}.
CobVOperacaoInvalida
Significado: a requisição que busca alterar ou criar uma cobrança com vencimento não respeita o schema ou está semanticamente errada.
HTTP Status Code: 400.
endpoints: [PUT|PATCH] /cobv/{txid}.
Violações para os endpoints PUT|PATCH /cobv/{txid}:

Este txid está associado a um lote e no referido lote, o status desta cobrança está atribuído como "EM_PROCESSAMENTO" ou "NEGADA".
O campo cobv.calendario.dataDeVencimento é anterior à data de criação da cobrança.
O campo cobv.calendario.validadeAposVencimento é menor do que zero.
O objeto cobv.devedor não respeita o schema.
O objeto cobv.devedor não respeita o schema.
O campo cobv.chave não respeita o schema.
O campo cobv.chave corresponde a uma conta que não pertence a este usuário recebedor.
O campo solicitacaoPagador não respeita o schema.
O objeto infoAdicionais não respeita o schema.
O location referenciado por cobv.loc.id inexiste.
O location referenciado por cobv.loc.id já está sendo utilizado por outra cobrança.
O location referenciado por cobv.loc.id apresenta tipo "cob" (deveria ser "cobv").
O campo cobv.valor.original não respeita o schema.
O campo cobv.valor.original apresenta o valor zero.
O objeto cobv.valor.multa não respeita o schema.
O objeto cobv.valor.juros não respeita o schema.
O objeto cobv.valor.abatimento não respeita o schema.
O objeto cobv.valor.desconto não respeita o schema.
O objeto cobv.valor.abatimento representa um valor maior ou igual ao valor da cobrança original ou maior ou igual a 100%.
O objeto cobv.valor.desconto apresenta algum elemento de desconto que representa um valor maior ou igual ao valor da cobrança original ou maior ou igual a 100%.
O objeto cobv.valor.desconto apresenta algum elemento cuja data seja posterior à data de vencimento representada por calendario.dataDeVencimento.
O objeto cobv.valor.desconto apresenta modalidade no valor 1 ou 2, porém cobv.valor.desconto.valorPerc encontra-se preenchido
O objeto cobv.valor.desconto apresenta modalidade no valor 1 ou 2, porém o array cobv.valor.desconto.descontoDataFixa está vazio ou nulo.
O objeto cobv.valor.desconto apresenta modalidade nos valores de 3 a 6, porém o elemento cobv.valor.desconto.valorPerc não está preenchido.
O objeto cobv.valor.desconto apresenta modalidade nos valores de 3 a 6, porém o elemento cobv.valor.desconto.descontoDataFixa está preenchido ou não nulo.
Violações específicas para o endpoint PUT /cobv/{txid}:

A cobrança já existe, não está ATIVA, e a presente requisição busca alterá-la
Violações específicas para o endpoint PATCH /cobv/{txid}:

A cobrança não está ATIVA, e a presente requisição busca alterá-la
A cobrança está ATIVA, e a presente requisição propõe alterar seu status para REMOVIDA_PELO_USUARIO_RECEBEDOR juntamente com outras alterações (não faz sentido remover uma cobrança ao mesmo tempo em que se realizam alterações que não serão aproveitadas).
o campo cob.status não respeita o schema.
CobVConsultaInvalida
Significado: os parâmetros de consulta à lista de cobranças com vencimento não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: GET /cobv e GET /cobv/{txid}.
Violações específicas para o endpoint GET /cobv:

algum dos parâmetros informados para a consulta não respeita o schema.
o timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
ambos os parâmetros cpf e cnpj estão preenchidos.
o parâmetro paginacao.paginaAtual é negativo.
o parâmetro paginacao.itensPorPagina é negativo.
Violações específicas para o endpoint GET /cobv/{txid}:

o parâmetro revisao corresponde a uma revisão inexistente para a cobrança apontada pelo parâmetro txid.
Tag LoteCobV
Esta seção reúne erros referentes a endpoints que tratam do gerenciamento de lotes de cobrança.

LoteCobVNaoEncontrado
Significado: Lote não encontrado para o id informado.
HTTP Status Code: 404.
endpoints: [GET|PATCH] /lotecobv/{id}.
LoteCobVOperacaoInvalida
Significado: a requisição que busca alterar ou criar um lote de cobranças com vencimento não respeita o schema ou está semanticamente errada.
HTTP Status Code: 400.
endpoints: [PUT|PATCH] /lotecobv/{id}.
Violações para os endpoints PUT|PATCH /lotecobv/{id}:

O campo loteCobV.descricao não respeita o schema.
O objeto loteCobV.cobsV não respeita o schema.
Violações para o endpoint PUT /lotecobv/{id}:

a presente requisição tenta criar um conjunto de cobranças dentre as quais pelo menos uma cobrança já encontra-se criada.
a presente requisição busca alterar um lote já existente, entretanto contém um array de solicitações de alteração de cobranças que não referencia exatamente as mesmas cobranças referenciadas pela requisição original que criou o lote. Uma vez criado um lote, não se pode remover ou adicionar solicitações de criação ou alteração de cobranças a este lote.
Violações para o endpoint PATCH /lotecobv/{id}:

a presente requisição busca alterar um lote já existente e contém, no array de cobranças representado por cobsv, uma cobrança não existente no array de cobranças atribuído pela requisição original que criou o lote. Uma vez criado um lote, não se pode remover ou adicionar cobranças a este lote.
Violações para os endpoints GET /lotecobv/{id}:

observação: para cada elemento do array cobsv, retornado por este endpoint, caso a requisição de criação de cobrança esteja em status "NEGADA", o atributo problema deste elemento deve ser preenchido respeitando o schema referenciado pela API Pix.
o preenchimento do atributo problema, conforme descrito acima, segue o mesmo regramento dos erros especificados para os endpoints [PUT/PATCH /cobv/{txid}], de maneira a possibilitar, ao usuário recebedor, entender qual foi a violação cometida ao se tentar criar a cobrança referenciada por este elemento do array cobsv.
LoteCobVConsultaInvalida
Significado: os parâmetros de consulta à lista de lotes de cobrança com vencimento não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: GET /lotecobv e GET /lotecobv/{id}.
Violações específicas para o endpoint GET /lotecobv:

algum dos parâmetros informados para a consulta não respeitam o schema.
o timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
o parâmetro paginacao.paginaAtual é negativo.
o parâmetro paginacao.itensPorPagina é negativo.
Tag PayloadLocation
Esta seção reúne erros referentes a endpoints que tratam do gerenciamento de locations.

PayloadLocationNaoEncontrado
Significado: Location não encontrada para o id informado.
HTTP Status Code: 404.
endpoints: [GET|PATCH] /loc/{id}, DELETE /loc/{id}/txid.
PayloadLocationOperacaoInvalida
Significado: a presente requisição busca criar uma location sem respeitar o schema estabelecido.
HTTP Status Code: 400.
endpoints: POST /loc.
Violações para o endpoint POST /loc:

o campo tipoCob não respeita o schema.
PayloadLocationConsultaInvalida
Significado: os parâmetros de consulta à lista de locations não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: GET /loc e GET /loc/{id}.
Violações específicas para o endpoint GET /loc:

algum dos parâmetros informados para a consulta não respeitam o schema.
o timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
o parâmetro paginacao.paginaAtual é negativo.
o parâmetro paginacao.itensPorPagina é negativo.
Tag Pix
Reúne erros em endpoints de gestão de Pix recebidos e solicitação de devoluções.

PixNaoEncontrado
Significado: pix não encontrada para o e2eid informado.
HTTP Status Code: 404.
endpoints: GET /pix/{e2eid}
PixDevolucaoNaoEncontrada
Significado: devolução representada por {id} não encontrada para o e2eid informado.
HTTP Status Code: 404.
endpoints: GET /pix/{e2eid}/devolucao/{id}
PixConsultaInvalida
Significado: os parâmetros de consulta à lista de pix recebidos não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: GET /pix.
Violações específicas para o endpoint GET /pix:

algum dos parâmetros informados para a consulta não respeita o schema.
o timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
ambos os parâmetros cpf e cnpj estão preenchidos.
o parâmetro paginacao.paginaAtual é negativo.
o parâmetro paginacao.itensPorPagina é negativo.
PixDevolucaoInvalida
Significado: a presente requisição de devolução não respeita o schema ou não faz sentido semanticamente.
HTTP Status Code: 400.
endpoints: PUT /pix/{e2eid}/devolucao/{id}.
Violações específicas para o endpoint PUT /pix/{e2eid}/devolucao/{id}:

O campo devolucao.valor não respeita o schema.
A presente requisição de devolução, em conjunto com as demais prévias devoluções, se aplicável, excederia o valor do pix originário.
A presente requisição de devolução apresenta um {id} já utilizado por outra requisição de devolução para o {e2eid} em questão.
A presente requisição de devolução viola a janela de tempo permitida para solicitações de devoluções de um pix (hoje estabelecida como 90 dias desde a data de liquidação original do pix).
Tag Webhook
Reúne erros dos endpoints que tratam do gerenciamento dos Webhooks da API Pix.

WebhookOperacaoInvalida
Significado: a presente requisição busca criar um webhook sem respeitar o schema ou, ainda, apresenta semântica inválida.
HTTP Status Code: 400.
endpoints: PUT /webhook/{chave}.
Violações para o endpoint PUT /webhook/{chave}:

o parâmetro {chave} não corresponde a uma chave DICT válida.
o parâmetro {chave} não corresponde a uma chave DICT pertencente a este usuário recebedor.
Campo webhook.webhookUrl não respeita o schema.
WebhookNaoEncontrado
Significado: o webhook denotado por {chave} não encontra-se estabelecido.
HTTP Status Code: 404.
endpoints: GET /webhook/{chave}, DELETE /webhook/{chave}
WebhookConsultaInvalida
Significado: os parâmetros de consulta à lista de webhooks ativados não respeitam o schema ou não fazem sentido semanticamente.
HTTP Status Code: 400.
endpoints: GET /webhook.
Violações específicas para o endpoint GET /webhook:

algum dos parâmetros informados para a consulta não respeita o schema.
o timestamp representado pelo parâmetro fim é anterior ao timestamp representado pelo parâmetro inicio.
o parâmetro paginacao.paginaAtual é negativo.
o parâmetro paginacao.itensPorPagina é negativo.
Cobrança Imediata
Criar cobrança imediata com txid
Endpoint para criar uma cobrança imediata.

A Cobrança imediata não tem uma data de vencimento e, conforme o nome sugere, deve ser usada para casos de pagamentos imediatos como compra em loja física ou Pix Saque.

Escopo requerido: cob.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/cob/{txid}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cob/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Dados para geração da cobrança imediata.

calendario
required
object (Expiração)
devedor	
Pessoa Física (object) or Pessoa Jurídica (object) (CobDevedor)
Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.

Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.

loc	
object (Location do Payload)
Identificador da localização do payload.

valor
required
object (Valor da cobrança imediata)
valores monetários referentes à cobrança.

chave
required
string (Chave DICT do recebedor) [ 1 .. 77 ] characters
Formato do campo chave
O campo chave determina a chave Pix registrada no DICT que será utilizada para a cobrança. Essa chave será lida pelo aplicativo do PSP do pagador para consulta ao DICT, que retornará a informação que identificará o recebedor da cobrança.
Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do Manual de Padrões para iniciação do Pix.
solicitacaoPagador	
string (Solicitação ao pagador) [ 1 .. 140 ] characters
O campo solicitacaoPagador, opcional, determina um texto a ser apresentado ao pagador para que ele possa digitar uma informação correlata, em formato livre, a ser enviada ao recebedor. Esse texto será preenchido, na pacs.008, pelo PSP do pagador, no campo RemittanceInformation . O tamanho do campo na pacs.008 está limitado a 140 caracteres.

infoAdicionais	
Array of objects (Informações adicionais) <= 50
Cada respectiva informação adicional contida na lista (nome e valor) deve ser apresentada ao pagador.

Responses
201 Cobrança imediata criada
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

put
/cob/{txid}


Request samples
Payload
Content type
application/json
Example

Exemplo de criação de cobrança imediata 1
Exemplo de criação de cobrança imediata 1

Copy
Expand allCollapse all
{
"calendario": {
"expiracao": 3600
},
"devedor": {
"cnpj": "12345678000195",
"nome": "Empresa de Serviços SA"
},
"valor": {
"original": "37.00",
"modalidadeAlteracao": 1
},
"chave": "7d9f0335-8dcc-4054-9bf9-0dbd61d36906",
"solicitacaoPagador": "Serviço realizado.",
"infoAdicionais": [
{},
{}
]
}
Response samples
201400403404503
Content type
application/json
Example

Exemplo de cobrança imediata 1
Exemplo de cobrança imediata 1

Copy
Expand allCollapse all
{
"calendario": {
"criacao": "2020-09-09T20:15:00.358Z",
"expiracao": 3600
},
"txid": "7978c0c97ea847e78e8849634473c1f1",
"revisao": 0,
"loc": {
"id": 789,
"location": "pix.example.com/qr/9d36b84fc70b478fb95c12729b90ca25",
"tipoCob": "cob"
},
"location": "pix.example.com/qr/9d36b84fc70b478fb95c12729b90ca25",
"status": "ATIVA",
"devedor": {
"cnpj": "12345678000195",
"nome": "Empresa de Serviços SA"
},
"valor": {
"original": "567.89",
"modalidadeAlteracao": 1
},
"chave": "a1f4102e-a446-4a57-bcce-6fa48899c1d1",
"solicitacaoPagador": "Informar cartão fidelidade"
}
Revisar cobrança imediata
Endpoint para revisar cobrança imediata.

Escopo requerido: cob.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/cob/{txid}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cob/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Dados para geração da cobrança.

calendario	
object (Expiração)
devedor	
Pessoa Física (object) or Pessoa Jurídica (object) (CobDevedor)
Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.

Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.

loc	
object (Location do Payload)
Identificador da localização do payload.

status	
string (Status da Cobrança)
Value: "REMOVIDA_PELO_USUARIO_RECEBEDOR"
valor	
object (Valor da cobrança imediata)
valores monetários referentes à cobrança.

chave	
string (Chave DICT do recebedor) [ 1 .. 77 ] characters
Formato do campo chave
O campo chave determina a chave Pix registrada no DICT que será utilizada para a cobrança. Essa chave será lida pelo aplicativo do PSP do pagador para consulta ao DICT, que retornará a informação que identificará o recebedor da cobrança.
Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do Manual de Padrões para iniciação do Pix.
solicitacaoPagador	
string (Solicitação ao pagador) [ 1 .. 140 ] characters
O campo solicitacaoPagador, opcional, determina um texto a ser apresentado ao pagador para que ele possa digitar uma informação correlata, em formato livre, a ser enviada ao recebedor. Esse texto será preenchido, na pacs.008, pelo PSP do pagador, no campo RemittanceInformation . O tamanho do campo na pacs.008 está limitado a 140 caracteres.

infoAdicionais	
Array of objects (Informações adicionais) <= 50
Cada respectiva informação adicional contida na lista (nome e valor) deve ser apresentada ao pagador.

Responses
200 Cobrança imediata revisada. A revisão deve ser incrementada em 1.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

patch
/cob/{txid}


Request samples
Payload
Content type
application/json
Example

Exemplo de revisão de cobrança 1
Exemplo de revisão de cobrança 1

Copy
Expand allCollapse all
{
"loc": {
"id": 7768
},
"devedor": {
"cpf": "12345678909",
"nome": "Francisco da Silva"
},
"valor": {
"original": "123.45"
},
"solicitacaoPagador": "Cobrança dos serviços prestados."
}
Response samples
200400403404503
Content type
application/json

Copy
Expand allCollapse all
{
"calendario": {
"criacao": "2020-09-09T20:15:00.358Z",
"expiracao": 3600
},
"txid": "7978c0c97ea847e78e8849634473c1f1",
"revisao": 1,
"loc": {
"id": 789,
"location": "pix.example.com/qr/b1/9d36b84fc70b478fb95c12729b90ca25",
"tipoCob": "cob"
},
"location": "pix.example.com/qr/v1/9d36b84fc70b478fb95c12729b90ca25",
"status": "ATIVA",
"devedor": {
"cnpj": "12345678000195",
"nome": "Empresa de Serviços SA"
},
"valor": {
"original": "567.89",
"modalidadeAlteracao": 0
},
"chave": "a1f4102e-a446-4a57-bcce-6fa48899c1d1",
"solicitacaoPagador": "Informar cartão fidelidade"
}
Consultar cobrança imediata
Endpoint para consultar uma cobrança através de um determinado txid.

Escopo requerido: cob.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/cob/{txid}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cob/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Dados da cobrança imediata.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cob/{txid}


Response samples
200403404503
Content type
application/json
Example

Exemplo de cobrança imediata 1
Exemplo de cobrança imediata 1

Copy
Expand allCollapse all
{
"calendario": {
"criacao": "2020-09-09T20:15:00.358Z",
"expiracao": 3600
},
"txid": "7978c0c97ea847e78e8849634473c1f1",
"revisao": 0,
"loc": {
"id": 789,
"location": "pix.example.com/qr/9d36b84fc70b478fb95c12729b90ca25",
"tipoCob": "cob"
},
"location": "pix.example.com/qr/9d36b84fc70b478fb95c12729b90ca25",
"status": "ATIVA",
"devedor": {
"cnpj": "12345678000195",
"nome": "Empresa de Serviços SA"
},
"valor": {
"original": "567.89",
"modalidadeAlteracao": 1
},
"chave": "a1f4102e-a446-4a57-bcce-6fa48899c1d1",
"solicitacaoPagador": "Informar cartão fidelidade"
}
Criar cobrança imediata
Endpoint para criar uma cobrança imediata, neste caso, o txid é definido pelo PSP.

Escopo requerido: cob.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/cob
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cob
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Dados para geração da cobrança imediata.

calendario
required
object (Expiração)
devedor	
Pessoa Física (object) or Pessoa Jurídica (object) (CobDevedor)
Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.

Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.

loc	
object (Location do Payload)
Identificador da localização do payload.

valor
required
object (Valor da cobrança imediata)
valores monetários referentes à cobrança.

chave
required
string (Chave DICT do recebedor) [ 1 .. 77 ] characters
Formato do campo chave
O campo chave determina a chave Pix registrada no DICT que será utilizada para a cobrança. Essa chave será lida pelo aplicativo do PSP do pagador para consulta ao DICT, que retornará a informação que identificará o recebedor da cobrança.
Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do Manual de Padrões para iniciação do Pix.
solicitacaoPagador	
string (Solicitação ao pagador) [ 1 .. 140 ] characters
O campo solicitacaoPagador, opcional, determina um texto a ser apresentado ao pagador para que ele possa digitar uma informação correlata, em formato livre, a ser enviada ao recebedor. Esse texto será preenchido, na pacs.008, pelo PSP do pagador, no campo RemittanceInformation . O tamanho do campo na pacs.008 está limitado a 140 caracteres.

infoAdicionais	
Array of objects (Informações adicionais) <= 50
Cada respectiva informação adicional contida na lista (nome e valor) deve ser apresentada ao pagador.

Responses
201 Cobrança imediata criada
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/cob


Request samples
Payload
Content type
application/json
Example

Exemplo de criação de cobrança imediata 1
Exemplo de criação de cobrança imediata 1

Copy
Expand allCollapse all
{
"calendario": {
"expiracao": 3600
},
"devedor": {
"cnpj": "12345678000195",
"nome": "Empresa de Serviços SA"
},
"valor": {
"original": "37.00",
"modalidadeAlteracao": 1
},
"chave": "7d9f0335-8dcc-4054-9bf9-0dbd61d36906",
"solicitacaoPagador": "Serviço realizado.",
"infoAdicionais": [
{},
{}
]
}
Response samples
201400403503
Content type
application/json

Copy
Expand allCollapse all
{
"calendario": {
"criacao": "2020-09-09T20:15:00.358Z",
"expiracao": 3600
},
"txid": "7978c0c97ea847e78e8849634473c1f1",
"revisao": 0,
"loc": {
"id": 789,
"location": "pix.example.com/qr/9d36b84fc70b478fb95c12729b90ca25",
"tipoCob": "cob"
},
"location": "pix.example.com/qr/9d36b84fc70b478fb95c12729b90ca25",
"status": "ATIVA",
"devedor": {
"cnpj": "12345678000195",
"nome": "Empresa de Serviços SA"
},
"valor": {
"original": "567.89",
"modalidadeAlteracao": 1
},
"chave": "a1f4102e-a446-4a57-bcce-6fa48899c1d1",
"solicitacaoPagador": "Informar cartão fidelidade"
}
Consultar lista de cobranças imediatas
Endpoint para consultar cobranças imediatas através de parâmetros como início, fim, cpf, cnpj e status.

Escopo requerido: cob.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/cob
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cob
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
string (Situação da Cobrança)
Enum: "ATIVA" "CONCLUIDA" "REMOVIDA_PELO_USUARIO_RECEBEDOR" "REMOVIDA_PELO_PSP"
Estado do registro da cobrança. Não se confunde com o estado da cobrança em si, ou seja, não guarda relação com o fato de a cobrança encontrar-se vencida ou expirada, por exemplo.

Os status são assim definidos:

ATIVA: indica que o registro se refere a uma cobrança que foi gerada mas ainda não foi paga nem removida;
CONCLUIDA: indica que o registro se refere a uma cobrança que já foi paga e, por conseguinte, não pode acolher outro pagamento;
REMOVIDO_PELO_USUARIO_RECEBEDOR: indica que o usuário recebedor solicitou a remoção do registro da cobrança; e
REMOVIDO_PELO_PSP: indica que o PSP Recebedor solicitou a remoção do registro da cobrança.
paginacao.paginaAtual	
integer <int32> (Página atual)
Default: 0
Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.

paginacao.itensPorPagina	
integer <int32> (Itens por Página) <= 1000
Default: 100
Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Lista de cobranças imediatas.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cob


Response samples
200403503
Content type
application/json
Example

Exemplo de retorno da consulta de cobranças 1
Exemplo de retorno da consulta de cobranças 1

Copy
Expand allCollapse all
{
"parametros": {
"inicio": "2020-04-01T00:00:00Z",
"fim": "2020-04-02T10:00:00Z",
"paginacao": {}
},
"cobs": [
{},
{}
]
}
Pagar Pix de cobrança imediata (Sandbox)
Endpoint para pagar uma cobrança imediata via Pagamento Pix.

(Exclusivo para o ambiente Sandbox)

Escopo requerido: pix.write
rate limit:
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cob/pagar/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

Request Body schema: application/json
Dados para notificação dos Pix.

valor
required
number
Responses
201 Cobrança Pix paga com sucesso
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/cob/pagar/{txid}

Request samples
Payload
Content type
application/json

Copy
{
"valor": 150
}
Response samples
201400403503
Content type
application/json

Copy
{
"e2e": "E00416968202406141552CmNRIqASznP"
}
Pagar cobrança imediata utilizando QRCode (Sandbox)
Endpoint para pagar uma cobrança imediata utilizando QRCode.

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
"cpfCnpj": "09008007006"
}
Response samples
200400404500
Content type
application/json

Copy
{
"endToEnd": "E00416968202406141552CmNRIqASznP"
}
Cobrança com Vencimento
Criar cobrança com vencimento
Endpoint para criar uma cobrança com vencimento.

Na cobrança com vencimento é possível parametrizar uma data de vencimento e com isso o pagamento pode ser realizado em data futura, pode também incluir outras informações como juros, multas, outros acréscimos, descontos e outros abatimentos, semelhante ao boleto.

Escopo requerido: cobv.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/cobv/{txid}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobv/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Dados para geração da cobrança com vencimento.

calendario
required
object (Data de Vencimento)
devedor
required
Pessoa Física (object) or Pessoa Jurídica (object) (CobVDevedor)
Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.

Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.

loc	
object (Location do Payload)
Identificador da localização do payload.

valor
required
object (Valor da cobrança com vencimento)
Valores monetários.

chave
required
string (Chave DICT do recebedor) [ 1 .. 77 ] characters
O campo chave determina a chave Pix do recebedor que será utilizada para a cobrança.
Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do Manual de Padrões para iniciação do Pix.
solicitacaoPagador	
string (Solicitação ao pagador) [ 1 .. 140 ] characters
O campo solicitacaoPagador determina um texto a ser apresentado ao pagador para que ele possa digitar uma informação correlata, em formato livre, a ser enviada ao recebedor. Esse texto está limitado a 140 caracteres.

infoAdicionais	
Array of objects (Informações adicionais) <= 50
Cada respectiva informação adicional contida na lista (nome e valor) deve ser apresentada ao pagador.

Responses
201 Cobrança com vencimento criada
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

put
/cobv/{txid}


Request samples
Payload
Content type
application/json

Copy
Expand allCollapse all
{
"calendario": {
"dataDeVencimento": "2020-12-31",
"validadeAposVencimento": 30
},
"loc": {
"id": 789
},
"devedor": {
"logradouro": "Alameda Souza, Numero 80, Bairro Braz",
"cidade": "Recife",
"uf": "PE",
"cep": "70011750",
"cpf": "12345678909",
"nome": "Francisco da Silva"
},
"valor": {
"original": "123.45",
"multa": {},
"juros": {},
"desconto": {}
},
"chave": "5f84a4c5-c5cb-4599-9f13-7eb4d419dacc",
"solicitacaoPagador": "Cobrança dos serviços prestados."
}
Response samples
201400403404503
Content type
application/json

Copy
Expand allCollapse all
{
"calendario": {
"criacao": "2020-09-09T20:15:00.358Z",
"dataDeVencimento": "2020-12-31",
"validadeAposVencimento": 30
},
"txid": "7978c0c97ea847e78e8849634473c1f1",
"revisao": 0,
"loc": {
"id": 789,
"location": "pix.example.com/qr/v2/cobv/9d36b84fc70b478fb95c12729b90ca25",
"tipoCob": "cobv"
},
"status": "ATIVA",
"devedor": {
"logradouro": "Rua 15, Numero 1, Bairro Luz",
"cidade": "Belo Horizonte",
"uf": "MG",
"cep": "99000750",
"cnpj": "12345678000195",
"nome": "Empresa de Serviços SA"
},
"recebedor": {
"logradouro": "Rua 15 Numero 1200, Bairro São Luiz",
"cidade": "São Paulo",
"uf": "SP",
"cep": "70800100",
"cnpj": "56989000019533",
"nome": "Empresa de Logística SA"
},
"valor": {
"original": "567.89"
},
"chave": "a1f4102e-a446-4a57-bcce-6fa48899c1d1",
"solicitacaoPagador": "Informar cartão fidelidade"
}
Revisar cobrança com vencimento
Endpoint para revisar uma cobrança com vencimento.

Escopo requerido: cobv.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/cobv/{txid}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobv/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Dados para geração da cobrança.

calendario	
object (Data de Vencimento)
devedor	
Pessoa Física (object) or Pessoa Jurídica (object) (CobVDevedor)
Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.

Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.

loc	
object (Location do Payload)
Identificador da localização do payload.

valor	
object (Valor da cobrança com vencimento)
Valores monetários.

chave	
string (Chave DICT do recebedor) [ 1 .. 77 ] characters
O campo chave determina a chave Pix do recebedor que será utilizada para a cobrança.
Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do Manual de Padrões para iniciação do Pix.
solicitacaoPagador	
string (Solicitação ao pagador) [ 1 .. 140 ] characters
O campo solicitacaoPagador determina um texto a ser apresentado ao pagador para que ele possa digitar uma informação correlata, em formato livre, a ser enviada ao recebedor. Esse texto está limitado a 140 caracteres.

infoAdicionais	
Array of objects (Informações adicionais) <= 50
Cada respectiva informação adicional contida na lista (nome e valor) deve ser apresentada ao pagador.

status	
string (Status do registro da cobrança)
Value: "REMOVIDA_PELO_USUARIO_RECEBEDOR"
Responses
200 Cobrança com vencimento revisada. A revisão deve ser incrementada em 1.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

patch
/cobv/{txid}


Request samples
Payload
Content type
application/json
Example

Exemplo de revisão de cobrança 1
Exemplo de revisão de cobrança 1

Copy
Expand allCollapse all
{
"loc": {
"id": 7768
},
"devedor": {
"cpf": "12345678909",
"nome": "Francisco da Silva"
},
"valor": {
"original": "123.45"
},
"solicitacaoPagador": "Cobrança dos serviços prestados."
}
Response samples
200400403404503
Content type
application/json

Copy
Expand allCollapse all
{
"calendario": {
"criacao": "2020-09-09T20:15:00.358Z",
"dataDeVencimento": "2020-12-31",
"validadeAposVencimento": 30
},
"txid": "7978c0c97ea847e78e8849634473c1f1",
"revisao": 0,
"loc": {
"id": 789,
"location": "pix.example.com/qr/v2/cobv/9d36b84fc70b478fb95c12729b90ca25",
"tipoCob": "cobv"
},
"status": "ATIVA",
"devedor": {
"logradouro": "Rua 15, Numero 1, Bairro Luz",
"cidade": "Belo Horizonte",
"uf": "MG",
"cep": "99000750",
"cnpj": "12345678000195",
"nome": "Empresa de Serviços SA"
},
"recebedor": {
"logradouro": "Rua 15 Numero 1200, Bairro São Luiz",
"cidade": "São Paulo",
"uf": "SP",
"cep": "70800100",
"cnpj": "56989000019533",
"nome": "Empresa de Logística SA"
},
"valor": {
"original": "567.89"
},
"chave": "a1f4102e-a446-4a57-bcce-6fa48899c1d1",
"solicitacaoPagador": "Informar cartão fidelidade"
}
Consultar cobrança com vencimento
Endpoint para consultar uma cobrança com vencimento através de um determinado txid.

Escopo requerido: cobv.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/cobv/{txid}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobv/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Dados da cobrança com vencimento.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobv/{txid}


Response samples
200403404503
Content type
application/json

Copy
Expand allCollapse all
{
"calendario": {
"criacao": "2020-09-09T20:15:00.358Z",
"dataDeVencimento": "2020-12-31",
"validadeAposVencimento": 30
},
"txid": "7978c0c97ea847e78e8849634473c1f1",
"revisao": 0,
"loc": {
"id": 789,
"location": "pix.example.com/qr/v2/cobv/9d36b84fc70b478fb95c12729b90ca25",
"tipoCob": "cobv"
},
"status": "ATIVA",
"devedor": {
"logradouro": "Rua 15, Numero 1, Bairro Luz",
"cidade": "Belo Horizonte",
"uf": "MG",
"cep": "99000750",
"cnpj": "12345678000195",
"nome": "Empresa de Serviços SA"
},
"recebedor": {
"logradouro": "Rua 15 Numero 1200, Bairro São Luiz",
"cidade": "São Paulo",
"uf": "SP",
"cep": "70800100",
"cnpj": "56989000019533",
"nome": "Empresa de Logística SA"
},
"valor": {
"original": "567.89"
},
"chave": "a1f4102e-a446-4a57-bcce-6fa48899c1d1",
"solicitacaoPagador": "Informar cartão fidelidade"
}
Consultar lista de cobranças com vencimento
Endpoint para consultar cobranças com vencimento através de parâmetros como início, fim, cpf, cnpj e status.

Escopo requerido: cobv.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/cobv
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobv
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
string (Situação da Cobrança)
Enum: "ATIVA" "CONCLUIDA" "REMOVIDA_PELO_USUARIO_RECEBEDOR" "REMOVIDA_PELO_PSP"
Estado do registro da cobrança. Não se confunde com o estado da cobrança em si, ou seja, não guarda relação com o fato de a cobrança encontrar-se vencida ou expirada, por exemplo.

Os status são assim definidos:

ATIVA: indica que o registro se refere a uma cobrança que foi gerada mas ainda não foi paga nem removida;
CONCLUIDA: indica que o registro se refere a uma cobrança que já foi paga e, por conseguinte, não pode acolher outro pagamento;
REMOVIDO_PELO_USUARIO_RECEBEDOR: indica que o usuário recebedor solicitou a remoção do registro da cobrança; e
REMOVIDO_PELO_PSP: indica que o PSP Recebedor solicitou a remoção do registro da cobrança.
paginacao.paginaAtual	
integer <int32> (Página atual)
Default: 0
Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.

paginacao.itensPorPagina	
integer <int32> (Itens por Página) <= 1000
Default: 100
Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.

loteCobVId	
integer <int32> (Id do lote de cobrança com vencimento)
Id do lote de cobrança com vencimento.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Lista de cobranças com vencimento.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/cobv


Response samples
200403503
Content type
application/json

Copy
Expand allCollapse all
{
"parametros": {
"inicio": "2020-04-01T00:00:00Z",
"fim": "2020-04-01T23:59:59Z",
"paginacao": {}
},
"cobs": [
{}
]
}
Pagar Pix de cobrança com vencimento (Sandbox)
Endpoint para pagar uma cobrança com vencimento via Pagamento Pix.

(Exclusivo para o ambiente Sandbox)

Escopo requerido: pix.write
rate limit:
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

  https://cdpj-sandbox.partners.uatinter.co/pix/v2/cobv/pagar/{txid}
Ícone
path Parameters
txid
required
string[a-zA-Z0-9]{26,35}
O campo txid determina o identificador da transação.

O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade. O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.

Request Body schema: application/json
Dados para notificação dos Pix.

valor
required
number
Responses
201 Cobrança com vencimento Pix paga com sucesso
400 Problemas na requisição.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/cobv/pagar/{txid}

Request samples
Payload
Content type
application/json

Copy
{
"valor": 150
}
Response samples
201400403503
Content type
application/json

Copy
{
"e2e": "E00416968202406141552CmNRIqASznP"
}
Pagar cobrança com vencimento utilizando QRCode (Sandbox)
Endpoint para pagar uma cobrança com vencimento utilizando QRCode.

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
/ sandbox/cob/pagamento


Request samples
Payload
Content type
application/json

Copy
{
"qrCode": "000201010200661010014BR.GOV.BCB.PIX2009url-exemplo.qrcode.sandbox.co/pj-s/v2/cob/f5c23856e5694ed48607ab0bd0172496520400005309863540550.005802BR5901*6013BELO HORIZONT61089999999962070503***801000014BR.GOV.BCB.PIX2578cdpj-sandbox.partners.uatinter.co/pj-s/v2/rec/60eb10961d744397903cdc376c3ae8a56300288A",
"valor": 100,
"cpfCnpj": "09008007006"
}
Response samples
200400404500
Content type
application/json

Copy
{
"endToEnd": "E00416968202406141552CmNRIqASznP"
}
Cobrança com Vencimento em Lote
Criar/Alterar lote de cobranças com vencimento
Endpoint utilizado para criar ou alterar um lote de cobranças com vencimento.

Para o caso de uso de alteração de cobranças, o array a ser atribuído na requisição deve ser composto pelas exatas requisições de criação de cobranças que constaram no array atribuído na requisição originária.

Não se pode utilizar este endpoint para alterar um lote de cobranças com vencimento agregando ou removendo cobranças já existentes dentro do conjunto de cobranças criadas na requisição originária do lote (requisição de criação do lote).

Em outras palavras, se originalmente criou-se um lote, por exemplo, com as cobranças [a, b e c], não se pode alterar esse conjunto de cobranças original que o lote representa para [a, b, c, d], ou para [a, b]. Por outro lado, pode-se alterar, em lote as cobranças [a, b, c], conforme originalmente constam na requisição originária do lote.

Uma solicitação de criação de cobrança com status "EM_PROCESSAMENTO" ou "NEGADA" está associada a uma cobrança que não existe de fato, portanto não será listada em GET /cobv ou GET /cobv/{txid}.

Uma cobrança, uma vez criada via PUT /cobv/{txid}, não pode ser associada a um lote posteriormente.

Uma cobrança, uma vez criada via PUT /lotecobv/{id}, não pode ser associada a um novo lote posteriormente.

Escopo requerido: lotecobv.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/lotecobv/{id}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/lotecobv/{id}
Ícone
path Parameters
id
required
string (Identificador do lote de cobranças com vencimento, em formato de texto.)
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Dados para geração de lote de cobranças com vencimento.

descricao
required
string (Descrição do lote)
cobsv
required
Array of objects (Cobrança com vencimento solicitada)
Responses
202 Lote de cobranças com vencimento solicitado para criação.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

put
/lotecobv/{id}


Request samples
Payload
Content type
application/json

Copy
Expand allCollapse all
{
"descricao": "Cobranças dos alunos do turno vespertino",
"cobsv": [
{},
{}
]
}
Response samples
400403404503
Content type
application/problem+json

Copy
Expand allCollapse all
{
"type": "https://pix.bcb.gov.br/api/v2/error/LoteCobVOperacaoInvalida",
"title": "Lote de cobranças inválido.",
"status": 400,
"detail": "A requisição que busca alterar ou criar um lote de cobranças com vencimento não respeita o schema ou está semanticamente errada.",
"violacoes": [
{},
{}
]
}
Revisar cobranças específicas dentro de um lote
Endpoint para revisar cobranças específicas dentro de um lote de cobranças com vencimento.

A diferença deste endpoint para o endpoint PUT correlato é que este endpoint admite um array cobsv com menos solicitações de alteração de cobranças do que o array atribuído na requisição originária do lote.

Não se pode, entretanto, utilizar esse endpoint para agregar ou remover solicitações de alteração ou criação de cobranças conforme constam na requisição originária do lote.

Escopo requerido: lotecobv.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/lotecobv/{id}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/lotecobv/{id}
Ícone
path Parameters
id
required
string (Identificador do lote de cobranças com vencimento, em formato de texto.)
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Dados para geração de lote de cobranças com vencimento.

descricao	
string (Descrição do lote)
cobsv	
Array of objects (CobVRevisadaItem)
Responses
202 Solicitação de revisão do Lote de cobranças encaminhada para processamento.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

patch
/lotecobv/{id}


Request samples
Payload
Content type
application/json

Copy
Expand allCollapse all
{
"cobsv": [
{},
{}
]
}
Response samples
400403404503
Content type
application/problem+json

Copy
{
"type": "https://pix.bcb.gov.br/api/v2/error/CobVOperacaoInvalida",
"title": "Operação inválida.",
"status": 400,
"detail": "Cobrança não encontra-se mais com o status ATIVA, somente cobranças ativas podem ser revisadas."
}
Consultar um lote de cobranças com vencimento
Endpoint para consultar um lote de cobranças com vencimento.

Escopo requerido: lotecobv.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/lotecobv/{id}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/lotecobv/{id}
Ícone
path Parameters
id
required
string (Identificador do lote de cobranças com vencimento, em formato de texto.)
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Lote de cobranças com vencimento.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/lotecobv/{id}


Response samples
200403404503
Content type
application/json

Copy
Expand allCollapse all
{
"descricao": "Cobranças dos alunos do turno vespertino",
"criacao": "2020-11-01T20:15:00.358Z",
"cobsv": [
{},
{}
]
}
Sumário de um lote de cobranças com vencimento
Endpoint para consultar o sumário de um lote de cobranças com vencimento.

Escopo requerido: lotecobv.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/lotecobv/{id}/sumario
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/lotecobv/{id}/sumario
Ícone
path Parameters
id
required
string (Identificador do lote de cobranças com vencimento, em formato de texto.)
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sumário de um Lote de cobranças com vencimento.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/lotecobv/{id}/sumario


Response samples
200403404503
Content type
application/json

Copy
{
"dataCriacaoProcessamento": "2024-06-01T12:00:00Z",
"statusProcessamento": "FINALIZADO",
"totalCobrancas": 5,
"totalCobrancasNegadas": 1,
"totalCobrancasCriadas": 4
}
Consultar cobranças de um lote por situação
Endpoint para consultar os Pix Cobrança com vencimento de um lote pelo id e situação.

Escopo requerido: lotecobv.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/lotecobv/{id}/situacao/{situacao}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/lotecobv/{id}/situacao/{situacao}
Ícone
path Parameters
id
required
string (Identificador do lote de cobranças com vencimento, em formato de texto.)
situacao
required
string (SituacaoCobranca)
Enum: "EM_PROCESSAMENTO" "CRIADA" "NEGADA"
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sumário de um Lote de cobranças com vencimento.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/lotecobv/{id}/situacao/{situacao}


Response samples
200403404503
Content type
application/json

Copy
Expand allCollapse all
{
"id": 13,
"status": "NEGADA",
"criacao": "2024-06-19T15:12:55.745Z",
"cobsv": [
{}
]
}
Consultar lotes de cobranças com vencimento
Endpoint para consultar lista de lotes de cobranças com vencimento.

Escopo requerido: lotecobv.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/lotecobv
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/lotecobv
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

paginacao.paginaAtual	
integer <int32> (Página atual)
Default: 0
Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.

paginacao.itensPorPagina	
integer <int32> (Itens por Página) <= 1000
Default: 100
Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Lotes de cobranças com vencimento.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/lotecobv


Response samples
200403503
Content type
application/json

Copy
Expand allCollapse all
{
"parametros": {
"inicio": "2020-01-01T00:00:00Z",
"fim": "2020-12-01T23:59:59Z",
"paginacao": {}
},
"lotes": [
{},
{}
]
}
Location
Criar location do payload
Criar location do payload.

Escopo requerido: payloadlocation.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/loc
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/loc
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Dados para geração da location.

tipoCob	
string (Tipo da cobrança)
Responses
201 Dados da location do Payload.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

post
/loc


Request samples
Payload
Content type
application/json

Copy
{
"tipoCob": "cob"
}
Response samples
201400403503
Content type
application/json
Example

Exemplo de Payload Location 1
Exemplo de Payload Location 1

Copy
{
"id": 7716,
"location": "pix.example.com/qr/v2/2353c790eefb11eaadc10242ac120002",
"tipoCob": "cob",
"criacao": "2020-03-11T21:19:51.013Z"
}
Consultar locations cadastradas
Endpoint para consultar locations cadastradas.

Escopo requerido: payloadlocation.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/loc
Ícone
  https:/cdpj-sandbox.partners.uatinter.co/pix/v2/loc
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

txIdPresente	
boolean
tipoCob	
string
Enum: "cob" "cobv"
paginacao.paginaAtual	
integer <int32> (Página atual)
Default: 0
Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.

paginacao.itensPorPagina	
integer <int32> (Itens por Página) <= 1000
Default: 100
Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 lista dos locations cadastrados de acordo com o critério de busca.
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/loc


Response samples
200400403503
Content type
application/json

Copy
Expand allCollapse all
{
"parametros": {
"inicio": "2020-04-01T00:00:00Z",
"fim": "2020-04-01T23:59:59Z",
"paginacao": {}
},
"loc": [
{},
{},
{}
]
}
Recuperar location do payload
Recupera a location do payload.

Escopo requerido: payloadlocation.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/loc/{id}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/loc/{id}
Ícone
path Parameters
id
required
string (Id da location cadastrada para servir um payload)
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Dados da location do Payload.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/loc/{id}


Response samples
200403404503
Content type
application/json
Example

Exemplo de Payload Location 1
Exemplo de Payload Location 1

Copy
{
"id": 7716,
"txid": "fda9460fe04e4f129b72863ae57ee22f",
"location": "pix.example.com/qr/v2/cobv/2353c790eefb11eaadc10242ac120002",
"tipoCob": "cobv",
"criacao": "2020-03-11T21:19:51.013Z"
}
Desvincular uma cobrança de uma location
Endpoint utilizado para desvincular uma cobrança de uma location.

Se executado com sucesso, a entidade loc não apresentará mais um txid, se apresentava anteriormente à chamada. Adicionalmente, a entidade cob ou cobv associada ao txid desvinculado também passará a não mais apresentar um location. Esta operação não altera o status da cob ou cobv em questão.

Escopo requerido: payloadlocation.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/loc/{id}/txid
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/loc/{id}/txid
Ícone
path Parameters
id
required
string (Id da location cadastrada para servir um payload)
Id da location

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 cobrança representada pelo txid informado desvinculada com sucesso.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

delete
/loc/{id}/txid


Response samples
200403404503
Content type
application/json

Copy
{
"id": 2316,
"location": "pix.example.com/qr/v2/a8534e273ecb47d3ac30613104544466",
"tipoCob": "cob",
"criacao": "2020-05-31T19:39:54.013Z"
}
Pix
Consultar pix
Endpoint para consultar um pix através de um determinado EndToEndId.

As transações de Pix retornadas nas consultas são recebimentos que tiveram origem de um Pix Cobrança(Cob ou CobV) gerado pela API Pix ou IBPJ(Boleto com Pix) pagos via QR Code.

Escopo requerido: pix.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/pix/{e2eId}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/pix/{e2eId}
Ícone
path Parameters
e2eId
required
string (Id fim a fim da transação) [a-zA-Z0-9]{32}
Id único para identificação do Pix Cobrança.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Dados do Pix Efetuado.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/pix/{e2eId}


Response samples
200403404503
Content type
application/json
Example

Exemplo de Pix 1
Exemplo de Pix 1

Copy
Expand allCollapse all
{
"endToEndId": "E12345678202009091221abcdef12345",
"txid": "cd1fe328c875481285a6f233ae41b662",
"valor": "100.00",
"chave": "a82d0acf-6cad-42a1-b5d4-4165416545646845",
"componentesValor": {
"original": {}
},
"horario": "2020-09-10T13:03:33.902Z",
"infoPagador": "Reforma da casa",
"devolucoes": [
{}
]
}
Consultar pix recebidos
Endpoint para consultar um pix por um período específico, de acordo com os parâmetros informados.

As transações de Pix retornadas nas consultas são recebimentos que tiveram origem de um Pix Cobrança (Cob ou CobV) gerado pela API Pix ou IBPJ(Boleto com Pix) pagos via QR Code.

Escopo requerido: pix.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/pix
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/pix
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

txId	
string[a-zA-Z0-9]{26,35}
txIdPresente	
boolean
devolucaoPresente	
boolean
cpf	
string (CPF)
Filtro pelo CPF do devedor. Não pode ser utilizado ao mesmo tempo que o CNPJ.

cnpj	
string (CNPJ)
Filtro pelo CNPJ do devedor. Não pode ser utilizado ao mesmo tempo que o CPF.

paginacao.paginaAtual	
integer <int32> (Página atual)
Default: 0
Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.

paginacao.itensPorPagina	
integer <int32> (Itens por Página) <= 1000
Default: 100
Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 lista dos Pix recebidos de acordo com o critério de busca.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/pix


Response samples
200403503
Content type
application/json
Example

Exemplo de Pix 1
Exemplo de Pix 1

Copy
Expand allCollapse all
{
"endToEndId": "E12345678202009091221abcdef12345",
"txid": "cd1fe328c875481285a6f233ae41b662",
"valor": "100.00",
"chave": "a82d0acf-6cad-42a1-b5d4-4165416545646845",
"componentesValor": {
"original": {}
},
"horario": "2020-09-10T13:03:33.902Z",
"infoPagador": "Reforma da casa",
"devolucoes": [
{}
]
}
Solicitar devolução
Endpoint para solicitar uma devolução através de um E2EID do Pix e do ID da devolução.

Escopo requerido: pix.write
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/pix/{e2eId}/devolucao/{id}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/pix/{e2eId}/devolucao/{id}
Ícone
path Parameters
e2eId
required
string (Id fim a fim da transação) [a-zA-Z0-9]{32}
Id único para identificação do Pix Cobrança.

id
required
string (Id da Devolução) [a-zA-Z0-9]{1,35}
Id gerado pelo cliente para representar unicamente uma devolução.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
Dados para pedido de devolução.

valor
required
string (Valor) \d{1,10}\.\d{2}
Valor solicitado para devolução. A soma dos valores de todas as devolucões não podem ultrapassar o valor total do Pix.

natureza	
string (Natureza da Devolução Solicitada)
Default: "ORIGINAL"
Enum: "ORIGINAL" "RETIRADA"
Indica qual é a natureza da devolução solicitada. Uma solicitação de devolução pelo usuário recebedor pode ser relacionada a um Pix comum (com código: MD06 da pacs.004), ou a um Pix de Saque ou Troco (com códigos possíveis: MD06 e SL02 da pacs.004). Na ausência deste campo a natureza deve ser interpretada como sendo de um Pix comum (ORIGINAL).

As naturezas são assim definidas:

ORIGINAL: quando a devolução é solicitada pelo usuário recebedor e se refere a um Pix comum ou ao valor da compra em um Pix Troco (MD06);
RETIRADA: quando a devolução é solicitada pelo usuário recebedor e se refere a um Pix Saque ou ao valor do troco em um Pix Troco (SL02).
Os valores de devoluções são sempre limitados aos valores máximos a seguir:

Pix comum: o valor da devolução é limitado ao valor do próprio Pix (a natureza nesse caso deve ser: ORIGINAL);
Pix Saque: o valor da devolução é limitado ao valor da retirada (a natureza nesse caso deve ser: RETIRADA); e
Pix Troco: o valor da devolução é limitado ao valor relativo à compra ou ao troco:
Quando a devolução for referente à compra, o valor limita-se ao valor da compra (a natureza nesse caso deve ser ORIGINAL); e
Quando a devolução for referente ao troco, o valor limita-se ao valor do troco (a natureza nesse caso deve ser RETIRADA).
descricao	
string (Mensagem ao pagador relativa à devolução.) <= 140 characters
O campo descricao, opcional, determina um texto a ser apresentado ao pagador contendo informações sobre a devolução. Esse texto será preenchido, na pacs.004, pelo PSP do recebedor, no campo RemittanceInformation. O tamanho do campo na pacs.004 está limitado a 140 caracteres.

Responses
201 Dados da devolução.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

put
/pix/{e2eId}/devolucao/{id}


Request samples
Payload
Content type
application/json

Copy
{
"valor": "7.89"
}
Response samples
201403404503
Content type
application/json
Example

Exemplo de devolução 1
Exemplo de devolução 1

Copy
Expand allCollapse all
{
"id": "123456",
"rtrId": "D12345678202009091000abcde123456",
"valor": "7.89",
"horario": {
"solicitacao": "2020-09-11T15:25:59.411Z"
},
"status": "EM_PROCESSAMENTO"
}
Consultar devolução
Endpoint para consultar uma devolução através de um E2EID do Pix e do ID da devolução.

As transações de Pix retornadas nas consultas são recebimentos que tiveram origem de um Pix Cobrança(Cob ou CobV) gerado pela API Pix ou IBPJ(Boleto com Pix) pagos via QR Code.

Escopo requerido: pix.read
rate limit:
 120 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/pix/{e2eId}/devolucao/{id}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/pix/{e2eId}/devolucao/{id}
Ícone
path Parameters
e2eId
required
string (Id fim a fim da transação) [a-zA-Z0-9]{32}
Id único para identificação do Pix Cobrança.

id
required
string (Id da Devolução) [a-zA-Z0-9]{1,35}
Id gerado pelo cliente para representar unicamente uma devolução.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Dados da devolução.
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/pix/{e2eId}/devolucao/{id}


Response samples
200403404503
Content type
application/json
Example

Exemplo de devolução 1
Exemplo de devolução 1

Copy
Expand allCollapse all
{
"id": "123456",
"rtrId": "D12345678202009091000abcde123456",
"valor": "7.89",
"horario": {
"solicitacao": "2020-09-11T15:25:59.411Z"
},
"status": "EM_PROCESSAMENTO"
}
Webhook de Pix Cobrança
Criar webhook
Método destinado a criar um webhook para receber notificações (callbacks) relacionados a Pix Cobrança, cob e cobv (recebimento do valor cobrado).

Caso o servidor de webhook retorne erro de recebimento do callback, serão realizadas até 4 tentativas com intervalos de 20, 30, 60 e 120 minutos.

Escopo requerido: webhook.write
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
ÍconeValidar webhook
  https://cdpj.partners.bancointer.com.br/pix/v2/webhook/{chave}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/webhook/{chave}
Ícone
path Parameters
chave
required
string (Chave pix para cadastro do webhook)
O campo chave determina a chave Pix do recebedor que foi utilizada para as cobranças.
Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
Em caso de chave telefone, não informar o caractere "+" no cadastro. Ex: 5511999999999
O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do Manual de Padrões para iniciação do Pix.
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
webhookUrl
required
string <uri> ^https://[^\s]*$
URL de configuração do webhook. Deve iniciar obrigatoriamente com https://

Responses
204 Sucesso
403 Requisição de participante autenticado que viola alguma regra de autorização.
404 Recurso solicitado não foi encontrado.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.
Callbacks
post{$request.body#/webhookUrl/pix}

put
/webhook/{chave}


Request samples
Payload
Content type
application/json

Copy
{
"webhookUrl": "https://pix.example.com/api/webhook/"
}
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
Callback payload samples
Callback
POST: {$request.body#/webhookUrl/pix}
Content type
application/json
Example

Exemplo de Webhook Pix Cobrança Sem Devolução.
Exemplo de Webhook Pix Cobrança Sem Devolução.

Copy
Expand allCollapse all
[
{
"endToEndId": "E87654321202009091221dfghi123456",
"chave": "a82d0acf-6cad-42a1-b5d4-4165416545646845",
"componentesValor": {},
"txid": "971122d8f37211eaadc10242ac120002",
"valor": "110.00",
"horario": "2020-09-09T20:15:00.358Z",
"infoPagador": "0123456789"
}
]
Obter webhook cadastrado
Obtém o webhook cadastrado, caso exista.

Escopo requerido: webhook.read
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/webhook/{chave}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/webhook/{chave}
Ícone
path Parameters
chave
required
string (chave pix para cadastro do webhook)
O campo chave determina a chave Pix do recebedor que foi utilizada para as cobranças.
Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
Em caso de chave telefone, não informar o caractere "+" na consulta. Ex: 5511999999999
O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do Manual de Padrões para iniciação do Pix.
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
/webhook/{chave}


Response samples
200403404503
Content type
application/json

Copy
{
"webhookUrl": "https://pix.example.com/api/webhook/",
"chave": "string",
"criacao": "2019-08-24T14:15:22Z"
}
Excluir webhook
Exclui o webhook.

Escopo requerido: webhook.write
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/webhook/{chave}
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/webhook/{chave}
Ícone
path Parameters
chave
required
string (chave pix para cadastro do webhook)
O campo chave determina a chave Pix do recebedor que foi utilizada para as cobranças.
Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
Em caso de chave telefone, não informar o caractere "+" na deleção. Ex: 5511999999999
O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do Manual de Padrões para iniciação do Pix.
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
/webhook/{chave}


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
Consultar callbacks
Retorna as requisições de callbacks ordenadas pela data de disparo (decrescente). Permite consultar erros no envio de callbacks.

Escopo requerido: webhook.read
rate limit:
 10 chamadas por minuto
 10 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/webhook/callbacks
Ícone
  https://cdpj-sandbox.partners.uatinter.co/pix/v2/webhook/callbacks
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

txid	
string
txId do callback, caso queira filtrar as notificações de algum pagamento específico.

header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Responses
200 Sucesso
400 Requisição com formato inválido.
403 Requisição de participante autenticado que viola alguma regra de autorização.
503 Serviço não está disponível no momento. Serviço solicitado pode estar em manutenção ou fora da janela de funcionamento.

get
/webhook/callbacks


Response samples
200400403503
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
{}
]
}
Reenviar callbacks
Beta

Método utilizado para reenviar uma mensagem de callback através de seu código identificador(txid) e sua chave pix.

A funcionalidade permite o envio de até 50 codigos identificadores, para o reenvio de seus respectivos callbacks.

Escopo requerido: webhook.write
rate limit:
 5 chamadas por minuto
Obs: O token tem validade de 60 minutos e deverá ser reutilizado nas requisições.

ÍconeExemplos de código
  https://cdpj.partners.bancointer.com.br/pix/v2/webhook/callbacks/retry
Ícone
header Parameters
x-conta-corrente	
string[1-9][0-9]*
Conta corrente que será utilizada na operação. Necessário somente quando a aplicação estiver associada a mais de uma conta corrente. Enviar apenas números (incluindo o dígito), e não enviar zeros a esquerda.

Request Body schema: application/json
txId
required
Array of strings <string> [ 1 .. 50 ] items
Lista de TXID's das transações que deseja reenviar o callback

chavePix
required
string
Chave Pix usada nas transações que deseja reenviar os callbacks. A chave pix deve ser a mesma para todos os TXID's

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
"txId": [
"7978c0c97ea847e78e8849634473c1f1"
],
"chavePix": "a82d0acf-6cad-42a1-b5d4-4165416545646845"
}
Response samples
200400403404500
Content type
aplication/json

Copy
Expand allCollapse all
{
"foundIds": [
"7978c0c97ea847e78e8849634473c1f1"
]
}
