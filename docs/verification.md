# Registro de auditoria e validação

Auditoria inicial em 21/10/2026, com atualização em 22/10/2026 para entrega via API. Este registro separa verificações estáticas, publicação de código e validação técnica. **Testes e build não foram executados.**

## Estrutura e escopo revisados

Foram identificados aplicação Next.js/React, TypeScript estrito, Tailwind, componentes próprios no padrão shadcn/ui, PostgreSQL/Prisma, Zod, ExcelJS, testes Vitest e cenários Playwright. O acesso implementado é somente um demo local; Better Auth e integrações externas não estão instalados/ativos.

A versão declarada continua `0.1.0`. Não houve reconstrução do aplicativo, mudança de dependências, refatoração de domínio/interface ou adição de licença. A única alteração executável de preparação foi alinhar `scripts/configure-demo.mjs` ao `.env.example` sem senha fixa: o configurador agora gera também a senha do PostgreSQL. Foram adicionados testes dessa fronteira, ainda não executados.

A documentação foi convertida para pt-BR, preservando decisões, limites e planejamento existentes. `.gitignore` foi ampliado; o workflow não validado foi movido para `docs/ci/quality.yml.example`, sem ativação automática. Foram acrescentadas orientações de contribuição e publicação.

## Verificações executadas

| Verificação | Resultado e limite |
| --- | --- |
| Estrutura, scripts e configurações | Inspeção dos arquivos existentes; comandos do README correspondem aos scripts de `package.json`. |
| JSON | Parse de `package.json`, `tsconfig.json`, `components.json` e `.prettierrc.json` sem erro. |
| Versões declaradas | Next/ESLint Next, React/React DOM, Prisma/Client/adaptador e Tailwind/PostCSS alinhados; `.nvmrc` corresponde ao Node 24 de `engines`. Não verifica resolução npm. |
| Links locais da documentação | Destinos relativos existentes. |
| Imports locais | Referências `@/` resolvem para arquivos existentes; Prisma gerado excluído dessa checagem até instalação. Não substitui TypeScript. |
| Compose | `docker compose --env-file .env.example config --quiet` aprovado; apenas configuração, sem iniciar contêineres. |
| Regras de ignore | `git check-ignore --no-index --stdin` em fixture isolada em `/tmp`: 32 exemplos de artefatos/credenciais ignorados e 12 exemplos de código/configuração preservados, incluindo `.env.example`, lockfile e migration. Não inicializa o Git do projeto. |
| Whitespace | `git diff --no-index --check /dev/null <arquivo>` nos arquivos textuais candidatos sem diagnósticos; fixture com whitespace inválido confirmou detecção. Não substitui a revisão do índice real. |
| Segredos e dados locais | Nenhum padrão de chave privada/token GitHub/Slack/Stripe/AWS encontrado nos arquivos candidatos. Não havia `.env` real, dumps, planilhas exportadas, logs ou artefatos gerados. |
| GitHub conectado | O conector confirmou o login `Talao-crypto`. Isso não configura a autenticação do CLI local. |
| Consulta ao destino | Na auditoria inicial retornou 404. Em 22/10/2026, a API confirmou o repositório público, branch padrão `Testando` e commit inicial `67d9fecbfe964a9dcd4e2dd259bd77c3deb38178`, com somente um README de apresentação. |

A análise de segredos incluiu revisão dos locais que contêm valores de teste: `src/lib/security.test.ts`, `playwright.config.ts` e o modelo inativo de CI. São fixtures explícitas, sem credenciais reais; não devem ser reutilizadas em produção. `.env.example` contém placeholders, e o configurador gera segredos aleatórios em tempo de execução sem imprimi-los. A varredura por padrões não é uma garantia de ausência de todo tipo de dado sensível.

Os 96 arquivos candidatos revisados incluem três ícones PNG próprios. Metadados locais `.git`, `.aws`, `.codex` e `.agents` não fazem parte desses candidatos e são protegidos/ignorados conforme aplicável. Não houve staging. A entrega por API usa comparação das árvores e hashes do snapshot, sem índice Git local.

## Bloqueios observados no ambiente local

| Operação | Impedimento observado |
| --- | --- |
| `node --version` | `/bin/bash: node: command not found` |
| `npm --version` | `/bin/bash: npm: command not found` |
| `gh --version` | `/bin/bash: gh: command not found` |
| Instalação pela rede do terminal | `curl: (6) Could not resolve host: registry.npmjs.org` |
| Acesso ao Docker | `permission denied while trying to connect to the docker API at unix:///var/run/docker.sock` |
| `git init -b main` | `.git/info/: Read-only file system` |
| Status/histórico/remotos | `fatal: not a git repository (or any of the parent directories): .git` |
| Autoria Git | Há e-mail configurado, mas `git config --get user.name` não retornou nome. Nenhuma identidade foi inventada/configurada. |

Não foi criado um repositório alternativo para contornar a proteção de `.git`. O pequeno repositório temporário usado para testar os padrões de ignore continha somente fixtures descartáveis, sem staging, commit ou publicação do CampusHub.

## Etapas não executadas

Instalação e auditoria de dependências, geração de `package-lock.json`, geração/validação do Prisma Client, aplicação das migrations, seed, formatação Prettier, lint, checagem de tipos, testes Vitest, build Next.js, E2E e inspeção visual em navegador continuam **não executados**. Não foram aprovados nem tiveram falhas mascaradas.

Não foram usados Git local, gh ou configuração de origin para esta entrega. Em 22/10/2026, o usuário autorizou a publicação do snapshot pela API conectada em branch de funcionalidade com PR para `Testando`, apesar da impossibilidade de executar testes/build. Essa autorização substitui a condição anterior que bloqueava qualquer envio por falta de execução dos checks. O PR deve apresentar o código como não validado; não há autorização para alterar visibilidade ou branch padrão, fazer merge ou deploy.

## Cobertura fornecida para executar

- Seis arquivos de testes Vitest: precisão numérica/datas; frequência por aulas/horas, limites e risco; média ponderada, pesos e notas ausentes, metas e arredondamento; XLSX; assinatura/expiração e bloqueio do demo em produção; configuração local de credenciais e preservação de `.env`.
- Cenários Playwright para desktop/mobile: sessão, manifesto, persistência de disciplinas/faltas/notas/tarefas, XLSX, dashboard e rejeição de leitura/exportação/vínculo com oferta de outro dono.
- Os testes XLSX conferem serialização, fórmulas e resultados iniciais; não executam um motor de Excel/LibreOffice. A recalculação após editar células precisa de verificação manual.

## Retomada

Para validar o aplicativo, disponibilizar Node 24/npm, rede e PostgreSQL. Seguir a [instalação](../README.md), gerar/revisar o lockfile e executar `npm run format:check`, `npm run check` e E2E. A entrega de fonte segue o [roteiro por API](release.md), com comparação de arquivos, preservação do histórico e PR separado da validação técnica.

Para aceitação manual, cadastrar outra oferta em um novo período; editar regras; adicionar/editar/remover faltas; validar pesos e notas inválidos; simular sem alterar notas salvas; editar células de um XLSX em aplicativo compatível; concluir/reabrir/editar/excluir tarefa; conferir navegação móvel e foco; exportar e excluir apenas dados fictícios. Confirmar que um build de produção bloqueia o demo mesmo com `DEMO_MODE=true`.


## Resultado da tentativa por API em 22/10/2026

A inspeção remota e a comparação dos 96 arquivos preparados foram concluídas. A base `Testando` contém somente `README.md`; a proposta adicionaria 95 arquivos e substituiria esse README após leitura/revisão. O snapshot exclui ambientes reais e artefatos; `.env.example` contém somente placeholders.

A primeira operação de escrita, `POST /repos/Talao-crypto/CampusHub/git/blobs`, tentou criar o blob de um ícone PNG próprio e retornou HTTP 403, `Resource not accessible by integration` (`FORBIDDEN`). A declaração de permissão de push do usuário nos metadados não equivale às permissões efetivas da integração autenticada. O catálogo confirmou que o plugin GitHub está instalado e habilitado; a ferramenta de permissões do ChatGPT não administra escopos OAuth/permissões da instalação GitHub.

Nenhum blob foi criado com sucesso, e nenhuma árvore, commit, branch ou PR foi criado. A visibilidade pública e a branch padrão `Testando` foram preservadas. Para retomar, é necessário corrigir o acesso de escrita ao conteúdo do repositório na instalação/autorização GitHub da conexão; a criação do PR também precisa de escrita em pull requests. Depois, repetir a leitura da base e comparação antes de publicar. **Testes, lint, checagem de tipos, migrations e build continuam não executados.**
