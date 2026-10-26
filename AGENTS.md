# Orientações para agentes e contribuidores

O CampusHub é um MVP de planejamento acadêmico para desenvolvimento local, sem vínculo institucional. Antes de alterar arquitetura ou acesso, leia `docs/architecture.md`, `docs/security.md` e `docs/verification.md`.

- Trabalhe sequencialmente. Não delegue a outros agentes sem solicitação explícita do usuário.
- Preserve o monólito modular. O domínio não pode importar Next.js, Prisma, adaptadores de banco ou implementações de provedores externos. Zod e utilitários numéricos puros são permitidos. Componentes de cliente não acessam o Prisma.
- Mantenha interface, mensagens ao usuário e documentação em pt-BR. Identificadores, comentários de código e mensagens de commit seguem em inglês. A convenção de commits é Conventional Commits.
- Valide entradas não confiáveis. Obtenha o dono pela sessão no servidor e restrinja toda leitura, alteração, exclusão e exportação privada a esse usuário. Preserve as chaves estrangeiras compostas; não aceite um dono enviado por formulário.
- Preserve o bloqueio do demo em produção e o servidor em loopback. Não introduza login público alternativo, credenciais demo de produção, coleta de senhas universitárias, scraping ou integração sem autorização.
- Frequência usa centésimos; notas usam décimos de milésimo; pesos percentuais usam pontos-base. A aprovação usa a média sem arredondamento. Altere motor, fórmulas XLSX, resultados iniciais, testes e documentação em conjunto.
- Use transações serializáveis com repetição limitada para alterações dependentes de agregados. Vínculos entre donos diferentes devem falhar na aplicação e no banco.
- Adicione apenas tabelas necessárias a funcionalidades reais. Comunidades, mapas, campi, cursos e integrações futuras permanecem documentados até sua implementação.
- Mantenha paginação ou limites explícitos de dados. Não adicione superfícies de chat/upload nem dependências desnecessárias.
- Execute os checks aplicáveis quando houver ferramentas. Registre impedimentos exatos sem declarar aprovação de testes não executados. E2E deve criar e remover somente suas fixtures.
- Nunca versione `.env`, credenciais, Prisma Client gerado, artefatos, dados locais ou relatórios de testes. Gere e revise um lockfile real; depois use `npm ci`.
- Só ative CI após validar seus comandos. O modelo atual fica em `docs/ci/quality.yml.example` e não deve ser tratado como workflow aprovado.
- Preserve commits, branches e remotos existentes. Não use force push, reset destrutivo ou reescrita de histórico. Confirme a identidade Git; não a invente.
- O usuário autorizou entregar os arquivos preparados em `Talao-crypto/CampusHub` pela API conectada, sem Git local ou gh, em branch de funcionalidade com PR para `Testando`. Nesta entrega, testes e build não executados devem ser declarados explicitamente. Preserve o histórico e não altere visibilidade ou branch padrão. Publicar o código para revisão não equivale a validar o MVP, fazer merge ou deploy.
- Não faça deploy da aplicação, contrate serviços, envie mensagens externas ou crie outros recursos sem autorização explícita. Nenhuma licença foi escolhida.
