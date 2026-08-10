# Módulo: Acompanhamento de Condicionantes de Licenças

Nova página dedicada dentro do módulo de Licenças Ambientais, com condicionantes sempre vinculadas a uma licença, controle de prazos, evidências e um dashboard no topo.

## Navegação

- `/licencas` ganha abas: **Licenças** | **Condicionantes**
- Rota `/licencas/condicionantes` (mesmo `ModuleGuard` de `environmental_licenses`)
- No detalhe de cada licença, uma aba "Condicionantes" lista apenas as daquela licença, com atalho para criar

## Dashboard superior (KPIs clicáveis, padrão `Kpi`/`KpiGrid`)

Total | Em dia | Vencendo (≤ alerta) | Atrasadas | Cumpridas | Contínuas
Cada card filtra a tabela, como nos outros módulos. Abaixo, barra de conformidade (% cumpridas no prazo).

## Cadastro de condicionante

- Licença vinculada (obrigatória), nº/item da condicionante, descrição
- Responsável interno (usuário da empresa) + status: pendente, em andamento, cumprida, atrasada (atrasada é calculada), não aplicável
- Criticidade: baixa, média, alta
- Tipo de prazo:
  - **Data única** — uma data de vencimento
  - **Recorrente** — mensal, bimestral, trimestral, semestral, anual; gera o próximo vencimento ao registrar cumprimento
  - **Contínua** — obrigação permanente sem data, com revisão periódica opcional
  - **Vinculada à licença** — X dias antes do vencimento da licença (recalcula quando a licença é renovada)
- Dias de alerta antes do vencimento (padrão 30)

## Evidências de cumprimento (todas as formas)

Cada registro de cumprimento cria um item no histórico com data de cumprimento, responsável e observações, mais:
- **Upload de arquivos** (PDF/imagem, até 20MB, bucket privado com URL assinada de 1h)
- **Vínculo a documentos** já existentes na Biblioteca de Documentos
- **Protocolo no órgão**: número do protocolo/ofício, data de envio, órgão e canal

Histórico completo por condicionante, com linha do tempo e download das evidências. Nada é sobrescrito: cada cumprimento é um novo registro (essencial em auditoria).

## Tabela de condicionantes

Colunas: licença, item, descrição, tipo de prazo, próximo vencimento, dias restantes (colorido), responsável, criticidade, status, evidências (contador), ações.
Filtros: busca, licença, status, criticidade, responsável, tipo de prazo. Paginação client-side (20/pág).
Exportação XLSX da visão filtrada.

## Integrações

- **Calendário**: vencimentos de condicionantes aparecem na agenda, junto aos demais prazos
- **Dashboard principal**: condicionantes atrasadas/vencendo em 7 dias entram nos alertas
- **Busca global**: condicionantes pesquisáveis
- **Licença**: excluir licença remove suas condicionantes em cascata; renovar licença recalcula prazos vinculados

## Detalhes técnicos

Banco (migração):
- `license_conditionants` — company_id, license_id, item_code, description, responsible_id (profiles), criticality, deadline_type, due_date, recurrence, days_before_license_expiry, alert_days_before, status, notes, timestamps + trigger `updated_at`
- `conditionant_compliances` — conditionant_id, company_id, fulfilled_at, notes, protocol_number, protocol_date, protocol_body, protocol_channel, registered_by, created_at
- `conditionant_evidence_files` — compliance_id, company_id, file_url, file_name, file_type
- `conditionant_document_links` — compliance_id, document_id (biblioteca), company_id
- GRANTs para `authenticated`/`service_role`, RLS por `get_user_company_id()`, escrita exigindo `has_module_editor_permission('environmental_licenses')`
- View `calendar_due_items` estendida para incluir condicionantes

Storage: novo bucket privado `license-conditionants`, caminho `[company_id]/[conditionant_id]/...`, políticas de escrita exigindo permissão de Editor no módulo.

Frontend:
- `src/pages/LicencasCondicionantes.tsx`, `src/hooks/useConditionants.ts`, `src/lib/conditionants.ts` (status/prazos/recorrência)
- `src/components/licencas/condicionantes/`: `ConditionantKpiCards`, `ConditionantFilters`, `ConditionantDrawer`, `ConditionantDetailDrawer`, `RegisterComplianceModal`, `DeleteConditionantDialog`
- Reuso de `usePermission`, `PermissionButton`, `ViewerBadge`, `DataTablePagination`, `xlsx-utils`

Planos: incluído em trial, professional e enterprise (starter fica de fora, conforme regra do projeto).
