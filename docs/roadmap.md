# Roadmap

## Estado do MVP

A versão declarada é `0.1.0`, em desenvolvimento local. O código contém organização de disciplinas, frequência, notas/XLSX, tarefas, dashboard e exportação/exclusão de dados acadêmicos. O primeiro passo é instalar dependências, gerar o lockfile e executar os checks em um ambiente habilitado; a entrega do código por API e PR não implica que essas validações tenham sido concluídas. Consulte [verification.md](verification.md).

Hospedar a aplicação é uma etapa distinta de versionar o código no GitHub. O acesso de produção permanece desativado até existir autenticação e privacidade adequadas. Os itens seguintes são **planejados, não implementados**.

## Fase 2 — planejamento de notas

Templates versionados, regras opcionais de recuperação/exame e planejamento avançado com representação tipada. Interpretação de texto/imagens deverá gerar apenas uma proposta validada, explicar a regra e exigir revisão explícita antes de aplicar. Não executar código ou fórmulas geradas. Definir consentimento, processamento privado e retenção antes de coletar imagens.

## Fase 3 — integrações autorizadas

Canvas OAuth e sincronização de tarefas após obtenção de chaves e autorização institucional. Calendário via Microsoft Graph após verificação de consentimento do tenant. Acrescentar renovação/revogação de tokens, status dos provedores, procedência, idempotência e repetição limitada. Portal do Aluno permanece desativado até confirmação de API autorizada; não coletar senhas ou automatizar o navegador.

## Fase 4 — comunidade

Perfis verificados, vínculos por instituição/curso, salas, conexões com egressos e chat. Implementar moderação, denúncias, bloqueio, prevenção de spam e revogação de vínculo antes de acesso público. Papéis de comunidade devem ser separados da propriedade dos dados acadêmicos. Escolher transporte em tempo real conforme a necessidade, preservando o monólito modular.

## Fase 5 — biblioteca colaborativa

Metadados por curso/disciplina/período, busca e armazenamento seguro. Autorizar upload/download, validar tamanho e conteúdo, verificar assinatura de arquivos, analisar malware, usar quarentena e acesso assinado. Definir declarações do uploader, denúncia/remoção por direitos autorais, moderação e retenção antes de aceitar arquivos. Não expor listagens públicas irrestritas nem renderizar HTML/SVG não confiável inline.

## Fase 6 — navegação no campus

Campi, prédios, andares, salas e pontos de referência com busca e dados verificados. Geometria interna, coordenadas, licenças de plantas e responsabilidade por atualização devem vir de fontes autorizadas; não inventar mapas. Separar adaptadores cartográficos das regras de localização.

## Fase 7 — operação e extensões

Notificações controladas pelo usuário, funcionamento offline seletivo, resolução de conflitos e sincronização após definição de privacidade/propriedade. Medir desempenho e acessibilidade; acrescentar observabilidade, backup/restauração, limites distribuídos, auditoria e automação de deploy. Reavaliar empacotamento/licenciamento dos módulos sem presumir extração para microsserviços.

## Condições antes de acesso público

Integrar Better Auth com verificação de e-mail, sessões seguras, recuperação e ciclo completo de contas. Migrar a identidade demo de forma segura, sem transformá-la em login público. Substituir limites locais, aplicar CSP com nonce, formalizar aviso/bases legais e atendimento ao titular. Verificar dependências, autorização entre donos, CSRF e restauração de backup. Essas condições não são supridas por criar um repositório privado no GitHub.
