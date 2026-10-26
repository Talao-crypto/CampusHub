# Segurança e privacidade

## Fronteira atual

O MVP tem uma única identidade fictícia, compartilhada no computador, em um demo explicitamente habilitado. O código exige `NODE_ENV=development`, `DEMO_MODE=true`, segredo de pelo menos 32 caracteres e host `127.0.0.1:3000` ou `localhost:3000`. O servidor de desenvolvimento usa `127.0.0.1`. Em produção, essa identidade é rejeitada. O demo não deve ser exposto por túnel, proxy reverso ou bind em rede.

Cookies de sessão têm assinatura HMAC-SHA256, comparação em tempo constante, `HttpOnly`, `SameSite=Strict`, escopo de caminho e validade de oito horas. Em HTTP local não usam `Secure`; o provedor de produção deverá usar HTTPS e cookies seguros. Não há senhas de usuário nesta fase, nem coleta de senhas universitárias. Escolher uma instituição não comprova vínculo acadêmico.

Ações verificam a origem exata da solicitação, além das proteções do Next.js. Leituras e alterações derivam o dono de `requireUser()`, nunca de campos do cliente. Chaves estrangeiras compostas reforçam o isolamento de vínculos no banco. Os dados privados não são pré-renderizados estaticamente ou colocados intencionalmente em cache offline. Não há analytics de terceiros.

Entradas têm validação de tipos, tamanho, precisão, datas e limites. Não há interpolação de SQL, injeção de HTML ou execução de fórmula arbitrária. Rótulos do usuário são gravados como texto na planilha, não como objetos de fórmula. Erros inesperados de operações retornam mensagens genéricas em pt-BR; o log tratado registra códigos sem payloads ou segredos.

Transações serializáveis protegem invariantes dependentes de somas e contagens. O limitador de solicitações é local ao processo; serve ao demo, não à proteção distribuída de um serviço público. Cabeçalhos restringem conteúdo, frames, permissões e referência. A CSP de desenvolvimento é permissiva para o runtime do Next.js; CSP com nonce e política HTTPS são requisitos antes de hospedagem pública.

## Credenciais e arquivos

`.env.example` contém apenas placeholders e mantém o demo desativado. `scripts/configure-demo.mjs` cria `.env` privado com senha aleatória para o banco local e segredo aleatório de sessão, sem imprimir valores nem sobrescrever arquivo existente. Um volume já inicializado mantém suas credenciais anteriores; não regenere o `.env` esperando alterar a senha desse banco.

`.gitignore` exclui ambientes locais, credenciais, chaves privadas, dados/backups de banco, dependências, artefatos e relatórios. Essa regra não substitui revisão do índice nem remove segredos de um histórico já existente. Fixtures de sessão em testes e no modelo inativo de CI são valores fictícios, identificados como tal, sem credenciais reais. Não devem ser reutilizadas fora dos testes.

## Autenticação de produção planejada

Integrar Better Auth aos adaptadores suportados de Next.js/Prisma, criando apenas as tabelas exigidas pelo fluxo efetivamente implementado. Hash de senha e rotação de sessão devem ficar sob responsabilidade do provedor. Exigir entrega de e-mail verificada ou OAuth institucional autorizado; definir origens confiáveis, cookies seguros, prevenção de enumeração, expiração de tokens e limites de login/cadastro/recuperação.

Antes de liberar acesso público, testar expiração, logout/revogação, exclusão de conta, CSRF e IDs de outro dono. A identidade demo não pode virar conta compartilhada de produção. Sem credenciais de produção e envio de e-mail, o comportamento suportado é manter o acesso desativado. Banco de produção exige privilégios mínimos, conexão criptografada e separação de papel de migration/runtime quando disponível.

## Planejamento de ciclo de dados e LGPD

Estas são bases técnicas, sem declaração de conformidade jurídica concluída. Antes de coletar dados reais, definir controlador/operador, bases legais, finalidades, aviso de privacidade em pt-BR, consentimento quando aplicável, retenção e canal de atendimento ao titular. Documentar operadores externos, transferências, resposta a incidentes e eventual tratamento de dados de menores. Coletar somente dados necessários; notas e frequência não devem virar campos públicos de perfil por padrão.

Configurações oferece exportação JSON restrita ao dono e exclusão transacional dos dados acadêmicos. A exportação não inclui cookies ou segredos. A exclusão remove tarefas, avaliações, faltas, ofertas, definições e períodos; preserva a identidade fictícia. **Não é uma implementação de exclusão completa de conta de produção.** Esse processo futuro deverá apagar registros de autenticação, revogar integrações, remover objetos enviados e limpar caches/índices, respeitando retenções justificadas e expiração de backups.

Backups exigem acesso restrito, criptografia e restauração testada. Registre consentimentos e versões de política quando houver funcionalidade que os exija; selecionar uma instituição não equivale a consentir uma integração. O código atual não executa sincronização externa.

## Requisitos antes de conteúdo público

Comunidades e chat exigem vínculo verificado, papéis e moderadores, denúncia, bloqueio, limites de mensagens, prevenção de spam, revogação de acesso e processo de revisão/recurso. Uploads exigem autorização de armazenamento/download, limites, validação por conteúdo/extensão/assinatura, análise e quarentena de malware, cotas, cabeçalhos seguros e processo de direitos autorais/moderação. Nenhuma dessas superfícies está implementada no MVP.
