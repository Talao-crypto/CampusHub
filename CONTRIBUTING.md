# Desenvolvimento e contribuição

Antes de alterar o projeto, consulte o [README](README.md), a [arquitetura](docs/architecture.md), a [segurança](docs/security.md) e o [AGENTS.md](AGENTS.md). O licenciamento ainda não foi definido.

## Preparação e escopo

Siga a instalação local do README com Node 24, npm e PostgreSQL. Use apenas dados fictícios no demo. Não adicione credenciais universitárias, dados pessoais, saídas geradas ou dependências sem necessidade. Mantenha regras de domínio independentes de Next.js/Prisma e toda autorização no servidor.

Documentação e interface usam pt-BR; identificadores e comentários de código usam inglês. Preserve os limites de precisão/unidade e a correspondência entre motor de notas e XLSX. Alterações de schema devem incluir migration revisada, sem remover as restrições de integridade existentes.

## Validação antes do commit

```bash
npm run format:check
npm run check
npm run test:e2e
git diff --check
```

E2E exige banco migrado/com seed e Chromium do Playwright instalado (`npx playwright install --with-deps chromium`), com a porta 3000 livre. Se houver divergências de formatação, aplique `npm run format` e revise as alterações. Nunca mascare falhas ou declare checks não executados como aprovados.

Depois de gerar e revisar `package-lock.json`, versione-o e use `npm ci` para instalações reproduzíveis. Só ative o modelo em `docs/ci/quality.yml.example` após validar os comandos e substituir o install por `npm ci`. Não há workflow ativo aprovado neste estado.

A entrega inicial por API foi autorizada como proposta de código em branch separada, com PR para `Testando` e testes/build explicitamente pendentes. Essa exceção não dispensa a validação antes de considerar o MVP pronto para uso.

## Commits e revisão

Use Conventional Commits em inglês, por exemplo `fix: validate attendance quantities` ou `docs: clarify local setup`. Para um repositório realmente novo, o commit inicial previsto é `feat: initialize CampusHub MVP`.

Confira a identidade Git existente e use somente nome/e-mail reais confirmados. Preserve histórico, branches e remotos; não faça force push nem reescreva commits. Antes de commitar, revise `git status --short`, `git diff --cached --stat`, `git diff --cached --check` e o diff completo do índice. Nunca use o fato de um arquivo estar ignorado como garantia de que não houve vazamento no histórico.

Descreva a mudança pelo problema resolvido, comportamento resultante, validações realizadas e limitações. Não inclua segredos, dumps, relatórios de navegação ou registros acadêmicos reais em commits ou revisões. O procedimento para a primeira publicação está em [docs/release.md](docs/release.md).
