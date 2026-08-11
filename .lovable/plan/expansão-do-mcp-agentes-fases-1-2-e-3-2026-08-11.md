# Expansão do MCP / Agentes — Fases 1, 2 e 3

Hoje o agente tem 6 ferramentas de leitura (dashboard, serviços, incidentes, licenças, fornecedores, EPI). O plano abaixo completa a cobertura de leitura, adiciona inteligência de indicadores e libera escrita controlada — tudo respeitando RLS por empresa e a trava de plano Enterprise/trial já existente (`planGate`).

## Fase 1 — Leitura completa

Novas ferramentas (uma por arquivo em `src/lib/mcp/tools/`):

- `get_upcoming_deadlines` — todos os vencimentos dos módulos nos próximos N dias (padrão 30), usando a view `calendar_due_items`. Retorna módulo de origem, título, data e status.
- `list_training_compliance` — colaboradores x treinamentos obrigatórios, com status (ok / vencendo / vencido / faltante).
- `list_aso_records` — ASOs por colaborador, tipo de exame, data e validade.
- `list_mtrs` — MTRs com número, destinador, resíduos, status do CDF e prazo.
- `list_conditionants` — condicionantes de licença com prazo e conformidade.
- `list_calendar_events` — eventos/campanhas/auditorias cadastrados no calendário.
- `list_corrective_actions` — ações corretivas (5W2H e de inspeção) com responsável, prazo e status.
- `list_inspections` — execuções de inspeção com modelo, ativo, data e resultado.
- `list_documents` — biblioteca de documentos com tipo, revisão vigente e validade.

## Fase 2 — Inteligência

- `get_hse_indicators` — TF (taxa de frequência) e TG (taxa de gravidade) por período, usando as fórmulas já implementadas no app, mais contagem de incidentes por tipo/severidade e dias de afastamento.
- `search_records` — busca transversal por texto (serviços, incidentes, licenças, documentos, fornecedores, colaboradores), retornando tipo, título e **deep link** para a tela correspondente no app.
- Enriquecer as respostas das listagens com `url` (deep link) para que o assistente possa mandar o usuário direto ao registro.

## Fase 3 — Escrita controlada

Ferramentas de mutação, todas com `readOnlyHint: false`, `needsApproval` e validação de permissão de editor no módulo:

- `create_occurrence` — abre uma NC/incidente (tipo, descrição, data, local, severidade).
- `create_calendar_event` — cria evento/campanha/auditoria no calendário.
- `create_corrective_action` — cria ação 5W2H vinculada a uma ocorrência.
- `register_service_completion` — registra a realização de um serviço periódico e recalcula o próximo vencimento.

Escrita só é permitida se o usuário tiver permissão de editor no módulo (mesma checagem do app); caso contrário a ferramenta retorna erro explicativo, sem gravar.

## Detalhes técnicos

- Todas as tools seguem o padrão atual: `defineTool` + `supabaseForUser(ctx)` + `planGate(ctx)` + `textResult`/`errorResult`, registradas em `src/lib/mcp/index.ts`.
- Schemas de entrada enxutos (limites via `.min/.max` em números apenas, sem enums grandes), com `limit` padrão 50.
- Nenhuma alteração de schema no banco: as tools usam tabelas/views existentes (`calendar_due_items`, `training_matrix`, `employee_training_records`, `aso_records`, `mtrs`, `license_conditionants`, `calendar_events`, `corrective_actions`, `inspection_executions`, `documents`, `suppliers_safe`).
- Para escrita, `company_id` e autoria (`created_by`) derivam sempre do token verificado, nunca da entrada da ferramenta.
- Após as edições: regenerar o manifesto MCP e reimplantar a função `mcp`.

## Verificação

- Manifesto regenerado listando todas as ferramentas sem erro.
- Chamadas de listagem retornam apenas dados da empresa do usuário.
- Conta em plano Starter/Professional recebe a mensagem de bloqueio; Enterprise/trial funciona.
- Ferramentas de escrita recusam usuário Viewer e criam o registro corretamente para editor/admin.
