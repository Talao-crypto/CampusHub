# Entrega do código por API GitHub

## Escopo autorizado em 22/10/2026

- Repositório existente: [Talao-crypto/CampusHub](https://github.com/Talao-crypto/CampusHub).
- Branch de destino do PR e branch padrão observada: `Testando`.
- Branch de proposta: `feat/campushub-mvp-20261022`.
- Visibilidade observada: pública, preservada por instrução do usuário.
- Versão declarada: `0.1.0`; mensagem de commit: `feat: initialize CampusHub MVP`.

A entrega é de código-fonte para revisão. **Testes, checagem de tipos, lint e build não foram executados.** Não há deploy, alteração de visibilidade/branch padrão, merge, tag ou release de produção neste fluxo.

## Inspeção e comparação

A API conectada confirmou a conta `Talao-crypto` e acesso de escrita. A inspeção de `Testando` encontrou o commit inicial `67d9fecbfe964a9dcd4e2dd259bd77c3deb38178`, sem pais, com árvore `c995cb8afd121a53297c0a3cb1fd7118a843a910` contendo somente `README.md`.

O README remoto foi lido no SHA exato: continha o título CampusHub e uma linha de apresentação do repositório. Sua substituição pelo README do MVP foi comparada antes da escrita. Os demais 95 caminhos preparados são novos nessa base. Arquivos remotos ausentes no workspace não devem ser excluídos automaticamente.

## Procedimento sem Git local ou gh

1. Ler a branch e sua árvore completa, rejeitando respostas truncadas; registrar SHA do commit e da árvore.
2. Comparar cada arquivo preparado com os blobs remotos. Ler/revisar qualquer arquivo existente que seria substituído.
3. Selecionar somente código, configuração, documentação, testes e ícones próprios. Excluir ambientes reais, credenciais, dados locais, dependências, caches, logs e builds. `.env.example` é apenas um modelo com placeholders, necessário ao configurador local.
4. Criar blobs binários em base64 e uma árvore incremental sobre a árvore remota inspecionada. Preservar entradas não alteradas e não incluir operações de exclusão sem revisão.
5. Criar um commit com o SHA da base como pai. Criar uma branch de funcionalidade inédita nesse commit, sem escrever em `Testando` ou usar atualização forçada.
6. Conferir a árvore publicada contra o snapshot local, a ancestralidade e a base inalterada. Abrir PR para `Testando`, declarando os checks não executados e os limites do MVP.
7. Confirmar branch/commit do PR e metadados do repositório. Informar o link do PR e hash obtidos da API, sem declarar merge, deploy ou validação técnica.

Falhas de API devem ser reportadas com operação e erro exatos. Não contornar bloqueios usando credenciais externas, Git local ou gh. Um PR não deve ser marcado como tecnicamente aprovado sem executar os checks.

## Validação ainda necessária

Em um ambiente com Node 24/npm, rede e PostgreSQL, seguir o README, gerar/revisar `package-lock.json`, aplicar migrations/seed e executar:

```bash
npm run format:check
npm run check
npx playwright install --with-deps chromium
npm run test:e2e
```

Antes de ativar o modelo de CI em `docs/ci/quality.yml.example`, validar seus comandos e substituir `npm install` por `npm ci` com lockfile revisado. Verificar manualmente a recalculação de XLSX em aplicativo compatível. Não confundir a entrega de fonte com a liberação de autenticação de produção ou o atendimento integral das condições do MVP.
