# CampusHub

Planejamento acadêmico pessoal para organizar disciplinas, frequência, notas e tarefas em um só lugar.

O CampusHub é um projeto independente voltado a estudantes universitários, com contexto inicial na PUC-Campinas. **Não possui vínculo, afiliação ou endosso da instituição.** Os dados são inseridos pelo usuário e os indicadores são estimativas pessoais; não substituem registros oficiais.

## Visão geral

Acompanhar trabalhos, limites de faltas e diferentes regras de avaliação costuma exigir informações espalhadas entre anotações, planilhas e sistemas acadêmicos. O CampusHub reúne esse planejamento sem tentar substituir os serviços da universidade nem solicitar suas credenciais.

Os objetivos são dar clareza sobre o semestre, facilitar simulações de desempenho e manter uma base modular, com persistência e limites de acesso, preparada para evoluir gradualmente.

**Estado atual:** MVP `0.1.0` para desenvolvimento local. Os módulos abaixo estão implementados no código, mas instalação, testes e build ainda precisam ser executados em um ambiente com as ferramentas necessárias. Esta entrega propõe o código-fonte em uma branch de funcionalidade e PR para `Testando`, pela API conectada; isso não significa aprovação técnica ou deploy. Consulte o [registro de validação](docs/verification.md).

## Funcionalidades implementadas

| Módulo | Recursos presentes no código |
| --- | --- |
| Disciplinas | Cadastro, edição e exclusão de ofertas vinculadas ao usuário e a um período letivo; definições de disciplinas reutilizáveis entre períodos. |
| Frequência | Políticas configuráveis, carga prevista, registro e edição de faltas, margem restante, percentual estimado e indicadores de atenção; contagem por aulas inteiras ou horas fracionadas. |
| Notas | Avaliações com pesos e notas opcionais, média ponderada, meta de aprovação, validação dos pesos e simulação temporária de cenários. |
| Planejamento de notas | Cálculo da nota comum necessária nas avaliações restantes, quando aplicável; identificação de meta já garantida ou impossível no cenário. |
| Exportação XLSX | Planilha com fórmulas, células de notas editáveis destacadas e resultados iniciais calculados pelo motor de domínio. |
| Tarefas | Cadastro, edição, exclusão, prazo por dia, vínculo opcional com disciplina e status pendente/concluído. |
| Dashboard | Visão dos dados persistidos, tarefas em aberto, margens de frequência e desempenho registrado. |
| Configurações | Exportação dos dados acadêmicos em JSON, exclusão desses dados e apresentação dos limites do ambiente demo. |
| Interface | Navegação lateral, menu móvel, estados de carregamento/erro/vazio e textos em português brasileiro. |
| Base PWA | Manifesto e ícones próprios; instalação depende dos critérios do navegador. Não há cache offline ou sincronização. |

### Limites do MVP

- O acesso usa uma identidade fictícia compartilhada no computador, exclusivamente em desenvolvimento local. Não há cadastro público, autenticação de produção ou envio de e-mail. Better Auth é uma integração futura, não uma dependência instalada.
- A frequência considera a carga **total prevista para o período**, não apenas as aulas já ministradas. As metas são configuráveis e não representam uma política oficial da PUC-Campinas.
- A regra de notas v1 usa escala de zero até um máximo configurável de 100, pesos positivos que somam 100%, notas com até quatro casas decimais e arredondamento/truncamento apenas na apresentação. A aprovação compara a média **sem arredondamento**. Recuperação e exame não são calculados.
- Notas ausentes não são tratadas como zero. Quando várias avaliações estão pendentes, a simulação calcula uma nota comum para todas elas. Os cenários temporários não alteram as notas salvas.
- A planilha é projetada para recalcular ao ser aberta em um aplicativo compatível. A recalculação no Excel/LibreOffice ainda exige verificação manual. A proteção de células evita edições acidentais, sem funcionar como controle de segurança.
- Há limites de 100 ofertas por usuário, 250 registros de falta e 50 avaliações por oferta e 1.000 tarefas por usuário. Listas de ofertas/frequência e de tarefas possuem paginação.
- Nenhuma integração externa, senha universitária, scraping, upload de arquivos, chat, mapa ou notificação está implementada.

## Tecnologias identificadas

As versões abaixo foram conferidas nos arquivos do projeto. A resolução das dependências e sua compatibilidade em execução **ainda não foram verificadas**; não existe `package-lock.json` neste estado do repositório.

| Camada | Tecnologia/configuração declarada |
| --- | --- |
| Ambiente | Node.js 24 (`.nvmrc` e `engines`), npm |
| Aplicação | Next.js 16.4.2 com App Router; React/React DOM 19.3.1 |
| Linguagem | TypeScript `~5.9.3`, modo estrito e `noUncheckedIndexedAccess` |
| Interface | Tailwind CSS 4.3.3, componentes próprios no padrão shadcn/ui e Lucide |
| Validação | Zod `^4.6.0`, mensagens em pt-BR |
| Persistência | PostgreSQL 17 no Compose; Prisma/Prisma Client/adaptador PostgreSQL 7.10.0 |
| Planilhas | ExcelJS 4.4.0 |
| Qualidade | ESLint 9, Prettier 3, Vitest 4 e Playwright |

## Arquitetura e organização

A aplicação é um **monólito modular**: o próprio Next.js entrega a interface, as ações de servidor e as rotas de exportação. Um único PostgreSQL mantém os dados. As regras de frequência e notas são funções de domínio separadas de interface e persistência; não há um serviço de backend separado.

```text
src/
  app/                 Páginas, layouts, ações locais e rotas de exportação
  components/          Componentes de interface e formulários
  lib/                 Validação, formatação e infraestrutura de servidor
  modules/
    academic/          Disciplinas, períodos e ofertas
    attendance/        Regras e operações de frequência
    grades/            Cálculo, simulação e geração de XLSX
    tasks/             Operações e consultas de tarefas
    integrations/      Contratos de tipos, sem provedores ativos
prisma/                Schema, migration inicial e seed fictício
public/icons/          Ícones próprios e recursos do manifesto
scripts/               Configuração local da demonstração
tests/e2e/             Cenários Playwright
docs/                  Decisões, segurança, roadmap e validação
```

Uma definição de disciplina é distinta de sua oferta em um período. Consultas e alterações privadas usam o usuário da sessão no servidor; chaves estrangeiras compostas também restringem vínculos entre donos diferentes. Veja as [decisões de arquitetura](docs/architecture.md) e os [limites de segurança](docs/security.md).

## Pré-requisitos

- Linux Mint ou outro ambiente Linux compatível.
- Node.js **24** e npm disponíveis no terminal. Se o `nvm` já estiver instalado, use `nvm install` e `nvm use` na raiz do projeto.
- Docker Engine com Compose e permissão de acesso ao daemon, ou uma instância local de PostgreSQL 17.
- Acesso de rede aos registros npm e aos endpoints de distribuição do Prisma durante a instalação inicial.
- Porta 3000 disponível para a aplicação e porta 5432 para o PostgreSQL do Compose.

## Instalação e execução local

Com o código disponível no computador, execute na raiz do projeto:

```bash
node scripts/configure-demo.mjs
docker compose up -d --wait
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Abra **http://127.0.0.1:3000/entrar** e selecione **Entrar na demonstração**. `http://localhost:3000` também é aceito, com cookies separados para cada host. O servidor usa somente loopback; outra porta não é aceita pela proteção do demo.

O configurador cria `.env` com permissão `0600`, usuário/banco locais, senha aleatória do PostgreSQL e segredo aleatório de sessão. Os segredos não são impressos. O script habilita explicitamente o demo, recusa sobrescrever `.env` existente e não deve ser usado em produção.

Depois da primeira instalação bem-sucedida, revise e versione o `package-lock.json` gerado. Nas instalações seguintes com o lockfile versionado, use `npm ci`. O `postinstall` gera o Prisma Client; seu resultado não deve ser commitado.

### Configuração manual

Como alternativa ao configurador, copie `.env.example` para `.env` e substitua **todos** os placeholders. Mantenha os dados de conexão coerentes entre `DATABASE_URL` e as variáveis do PostgreSQL. Na URL, codifique caracteres especiais da senha quando necessário.

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL usada pelo Prisma e pela aplicação. |
| `POSTGRES_USER` | Usuário criado pelo contêiner na primeira inicialização. |
| `POSTGRES_PASSWORD` | Senha local desse usuário; nunca publicar uma senha real. |
| `POSTGRES_DB` | Banco criado na primeira inicialização do contêiner. |
| `DEMO_MODE` | Deve ser `true` para o demo local; o modelo mantém `false`. |
| `DEMO_SESSION_SECRET` | Segredo aleatório com pelo menos 32 caracteres. |

Para gerar um segredo manualmente, use `openssl rand -hex 32` e guarde o resultado somente no `.env`. Nunca use senhas universitárias.

### Banco de dados

`npm run db:migrate` aplica as migrations existentes. `npm run db:seed` insere a identidade e os registros fictícios; exige demo habilitado, segredo configurado, ambiente fora de produção e URL PostgreSQL em `localhost` ou `127.0.0.1`.

O seed preserva registros de exemplo existentes ao ser executado novamente. Exemplos removidos podem ser recriados. Os prazos de exemplo são relativos à primeira execução; o período letivo é identificado como fictício.

Se já houver um PostgreSQL local, crie banco/usuário próprios, ajuste `DATABASE_URL` e omita o comando do Docker. Para novas alterações de schema:

```bash
npm run db:dev -- --name nome_da_alteracao
```

Revise o SQL gerado e preserve as restrições `CHECK` da migration inicial. `docker compose stop` interrompe o banco; `docker compose down` preserva o volume nomeado. Remover o volume destrói os dados locais.

## Comandos disponíveis

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia o Next.js de desenvolvimento em `127.0.0.1:3000`. |
| `npm run build` | Gera o Prisma Client e executa o build de produção. |
| `npm start` | Serve um build existente em loopback; o acesso acadêmico permanece bloqueado em produção. |
| `npm run lint` | Executa o ESLint. |
| `npm run typecheck` | Gera o Prisma Client e verifica os tipos sem emitir arquivos. |
| `npm run format` | Aplica a formatação do Prettier. |
| `npm run format:check` | Confere a formatação sem alterar arquivos. |
| `npm test` | Executa os testes unitários e de contrato do XLSX. |
| `npm run test:watch` | Executa o Vitest em modo de acompanhamento. |
| `npm run test:e2e` | Executa os cenários Playwright para desktop e mobile. |
| `npm run db:generate` | Gera o Prisma Client. |
| `npm run db:migrate` | Aplica as migrations existentes. |
| `npm run db:dev` | Cria/aplica migrations de desenvolvimento. |
| `npm run db:seed` | Insere exemplos fictícios, com as proteções do demo. |
| `npm run check` | Executa lint, tipos, testes unitários e build, nessa ordem. |

### Testes e validação

```bash
npm run check
npx playwright install --with-deps chromium
npm run test:e2e
```

O Playwright exige banco local migrado e com seed, inicia seu próprio servidor na porta 3000 e não reutiliza outro servidor. Pare o `npm run dev` antes de iniciar E2E. Os cenários incluem persistência, XLSX e rejeição de acesso a registros de outro dono; suas fixtures são fictícias.

**Nenhum desses testes ou o build foi executado neste ambiente**, por ausência de Node/npm e acesso ao banco. A configuração do Compose e verificações estáticas foram conferidas. O workflow anterior foi preservado como [modelo inativo de CI](docs/ci/quality.yml.example); sua ativação depende de lockfile e execução bem-sucedida dos comandos. Consulte o [registro completo](docs/verification.md).

## Solução de problemas

| Sintoma | Verificação recomendada |
| --- | --- |
| `node` ou `npm` não encontrado | Instale/ative o Node 24 e abra um terminal com seu binário no `PATH`. |
| Erro de DNS ou download | Confira conectividade e resolução de nomes para npm e Prisma. |
| Permissão negada no socket do Docker | Use um acesso local autorizado ao Docker ou um PostgreSQL já disponível; o projeto não altera permissões do sistema. |
| Porta ocupada | Libere 3000/5432 ou ajuste o banco; o demo da aplicação requer a porta 3000. |
| Falha na conexão PostgreSQL | Confira `docker compose ps`, credenciais e `DATABASE_URL`. |
| Senha do banco não corresponde ao `.env` | O volume mantém a senha da primeira inicialização; alterar `.env` não altera o usuário existente. |
| Demo desativado | Confira segredo, `DEMO_MODE=true`, host/porta e `npm run dev`. `npm start` não habilita o demo. |
| Identidade de exemplo ausente | Execute migrations e seed com a configuração local habilitada. |
| `.env` já existe | O configurador não sobrescreve arquivos; revise os valores manualmente. |

## Evolução planejada

Os itens abaixo **não estão implementados**:

- Templates de regras de notas, recuperação/exame e interpretação assistida de texto/imagens com revisão humana.
- Integrações autorizadas com Canvas e Microsoft Graph; eventual Portal do Aluno somente se API e autorização forem confirmadas.
- Perfis e vínculos verificados, comunidades, chat, moderação e interação com egressos.
- Biblioteca colaborativa com armazenamento seguro, busca e processo de direitos autorais.
- Navegação por campi, prédios, andares e salas a partir de dados verificados.
- Notificações, sincronização offline, observabilidade e operação de produção.
- Autenticação de produção com Better Auth e ciclo completo de contas, antes de qualquer acesso público.

Detalhamento no [roadmap](docs/roadmap.md) e nos [requisitos de integração](docs/integrations.md).

## Desenvolvimento e autoria

As orientações para alterações estão em [CONTRIBUTING.md](CONTRIBUTING.md) e [AGENTS.md](AGENTS.md). O [roteiro de publicação](docs/release.md) descreve a entrega por API e PR, preservando o histórico, a visibilidade e a branch padrão existentes.

**Autor:** Tales Martins de Moraes

**GitHub:** [Talao-crypto](https://github.com/Talao-crypto)

O licenciamento ainda não foi definido; nenhuma licença foi adicionada.
