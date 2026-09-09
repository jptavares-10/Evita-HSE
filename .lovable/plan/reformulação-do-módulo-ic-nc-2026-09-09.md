# Reformulação do módulo IC & NC

O módulo hoje tem bom conteúdo (investigação, 5W2H, lições), mas tudo vive dentro de um painel lateral estreito com 5 abas, a ação corretiva nasce só com uma frase e o responsável é um colaborador de campo — ninguém é realmente cobrado. A reformulação organiza o módulo em torno de duas ideias: **cada ocorrência tem uma página própria com etapas guiadas** e **cada ação tem dono, prazo e evidência, visíveis em um painel de ações**.

## 1. Nova estrutura do módulo

Três abas no topo de IC & NC:

- **Ocorrências** — lista atual, com coluna de progresso da etapa em vez de só "ações concluídas".
- **Ações** — novo painel com "Minhas ações" (padrão) e "Todas as ações".
- **Lições aprendidas** — como já é hoje.

## 2. Página da ocorrência com etapas guiadas

Registrar continua num formulário rápido. Depois de salvo, a ocorrência abre em **página própria** (`/incidentes/:id`), não mais no painel lateral. No topo: identificação, gravidade, status, alerta de CAT e uma **barra de 5 etapas**:

```text
1 Registro  >  2 Investigação  >  3 Plano de ação  >  4 Verificação  >  5 Encerramento
```

Cada etapa mostra o que falta em linguagem direta ("faltam 2 ações sem responsável", "1 ação sem verificação de eficácia"). Regras do fluxo:

- Investigação só é exigida para incidente, quase-acidente e não conformidade; observação de segurança pode ir direto ao plano.
- Não é possível encerrar a ocorrência com ação em aberto ou sem verificação de eficácia — o botão explica o motivo em vez de ficar apagado sem razão.
- Encerramento pede uma conclusão escrita e sugere publicar a lição aprendida.

O painel lateral de visualização rápida continua existindo para uma olhada rápida, com botão "Abrir ocorrência" que leva à página.

## 3. Ações corretivas: dono, prazo e evidência

- **Responsável passa a ser um usuário do sistema** (quem tem login). Ações antigas apontadas a colaboradores continuam visíveis, mas novas exigem usuário.
- **Criar a ação já pede o essencial numa única tela**: o que será feito, responsável, prazo, causa vinculada e hierarquia de controle. Hoje cria só a descrição e obriga a editar depois — isso acaba.
- Campos complementares (onde, como, custo) ficam num bloco "detalhes" opcional na mesma tela.
- **Evidência de conclusão**: passa a aceitar vários arquivos (foto, PDF) com observação obrigatória ao concluir.
- **Verificação de eficácia** ganha campo de comentário e, quando marcada "não efetiva", oferece criar uma nova ação já vinculada à mesma causa.
- Estados claros: pendente, em andamento, atrasada, concluída, verificada.

## 4. Painel de ações

Nova aba com cartões de resumo (minhas ações, atrasadas, vencendo em 7 dias, aguardando verificação) e tabela com filtros por responsável, status, prazo, gravidade e tipo da ocorrência. Cada linha leva à ocorrência de origem. O responsável consegue iniciar e concluir a própria ação mesmo sem permissão de edição no módulo — quem é cobrado precisa poder responder.

## 5. Prazos no calendário e avisos internos

- Prazos de ação corretiva passam a aparecer no Calendário junto dos outros vencimentos.
- Aviso interno: contador de ações atrasadas/vencendo na aba Ações e destaque na lista de ocorrências. Sem e-mail nesta etapa.

## 6. Detalhes técnicos

- Banco: usar `corrective_actions.responsible_profile_id` (já existe) como campo principal; adicionar `effectiveness_notes`, `verified_by`, `started_at` e `priority`. Nova tabela `corrective_action_attachments` (company_id, action_id, file_url, file_name, file_type) com GRANTs e RLS por `company_id` + permissão de editor, seguindo o padrão dos outros anexos.
- RLS: política adicional em `corrective_actions` permitindo `UPDATE` de status/conclusão quando `responsible_profile_id = auth.uid()`.
- Rota nova `/incidentes/:id` (`src/pages/IncidenteDetalhe.tsx`), reaproveitando `InvestigationPanel`, `ActionPlan5W2H`, `LessonPublisher` e `OccurrenceLegalPanel` dentro do novo passo a passo.
- Novos arquivos: `src/pages/IncidentesAcoes.tsx`, `src/components/incidentes/OccurrenceStepper.tsx`, `src/components/incidentes/acoes/ActionFormDialog.tsx`, `src/components/incidentes/acoes/ActionsTable.tsx`; helpers de etapa e estado em `src/lib/occurrences.ts` / `src/lib/investigation.ts`.
- Hooks: estender `useOccurrences.ts` (ações com responsável em `profiles`, anexos, verificação) e usar `useCompanyMembers` para o seletor de responsável.
- Uploads via `storageUpload` (cota do plano) no bucket `occurrence-files`, com URLs assinadas.
- Calendário: incluir prazos de ações corretivas na view `calendar_due_items`.
- MCP: `create_corrective_action` e `list_corrective_actions` passam a usar responsável por usuário.
- Gates de plano de investigação (5 Porquês / Ishikawa / Bow-Tie) permanecem iguais.
