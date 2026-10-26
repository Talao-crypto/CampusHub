# Integrações externas

A fase 1 **não faz solicitações** aos sistemas da universidade. Os endereços abaixo indicam alvos futuros, sem conceder autorização de acesso. As integrações permanecem desativadas nas configurações; não há botões fictícios de conexão, tokens ou jobs de scraping.

## Contratos e limites

`src/modules/integrations/providers.ts` define apenas tipos e interfaces para tarefas Canvas, eventos Microsoft Graph e um possível resumo acadêmico do Portal. Recebem referência de conexão vinculada ao dono/instituição e escopos consentidos. Esses contratos não demonstram disponibilidade de API nem implementam autorização; a aplicação futura deverá verificar a conexão no servidor.

Adaptadores resolverão credenciais criptografadas exclusivamente no servidor, validarão payloads e os converterão para DTOs internos. Regras de frequência/notas permanecerão independentes do transporte. A infraestrutura deverá tratar consentimento, escopos, timeout, repetição limitada, paginação, cursores, estado, renovação/revogação de tokens, duplicação e exclusão.

## Canvas LMS

Alvo: [Canvas da PUC-Campinas](https://puc-campinas.instructure.com/).

Confirmar autorização institucional, chave OAuth aprovada, URIs de retorno, endpoints e escopos mínimos. Não presumir que estudantes possam criar chaves de desenvolvedor ou usar tokens pessoais permanentes. Sincronização dependerá de consentimento explícito, atribuição de fonte, datas/fusos e paginação. Não automatizar login nem copiar cookies.

## Microsoft Graph / Outlook

Alvo: [Outlook](https://outlook.office.com/mail/).

Registrar aplicação autorizada, confirmar regras do tenant, selecionar escopos delegados mínimos para calendário e usar fluxo OAuth suportado com state/PKCE e retorno validado. Pode haver necessidade de consentimento administrativo. Leitura da caixa de e-mail não faz parte desse planejamento de calendário. Registrar consentimento/escopos e tratar revogação antes de programar sincronização.

## Portal do Aluno

Alvo: [Portal do Aluno](https://portal-aluno.puc-campinas.edu.br/aluno/).

A disponibilidade de API pública não foi confirmada. Obter autorização e documentação oficial antes de projetar um adaptador; o contrato mínimo atual pode mudar após essa verificação. Sem API autorizada, manter entrada manual e avaliar importações iniciadas pelo usuário com procedência separada. Não fazer scraping, automação de navegador, bypass de autenticação ou coleta de senhas universitárias.

## Pré-requisitos de dados e operação

- Separar estimativas manuais de registros oficiais por procedência, identificadores externos e datas; exigir revisão antes de alterar dados pessoais.
- Verificar dono, instituição e vínculo em criação de conexão, renovação, sincronização, exportação e exclusão.
- Criptografar tokens em repouso com rotação de chaves; nunca gravá-los em armazenamento do navegador, URLs, logs ou arquivos de exportação.
- Oferecer adesão explícita, finalidade/escopos, desconexão, retenção e exclusão; verificar bases legais, LGPD e termos institucionais.
- Validar assinaturas, janelas de repetição e idempotência de webhooks. Introduzir filas somente se a carga real justificar.
- Usar fixtures sem dados pessoais reais nos testes de contrato/autorização. Testes de produção dependem de contas e ambientes autorizados.
