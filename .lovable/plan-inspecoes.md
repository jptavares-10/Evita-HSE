
# Plano de Implementação — Módulo Inspeções de Segurança / CIPA

## Resumo
Módulo para gestão de inspeções periódicas de segurança (NRs diversas), com ciclo semelhante a Serviços Periódicos: frequência configurável (diária a anual), histórico de execuções com anexos, vinculação de documentos da Biblioteca (checklists/formulários), ações corretivas com evidências, e visualização filtrada por semana/período.

---

## 1. Migration SQL

### Tabela `inspections` — Cadastro de inspeções
| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid PK | gen_random_uuid() | |
| company_id | uuid FK companies | — | Multi-tenancy |
| name | text NOT NULL | — | Nome da inspeção (ex: "Inspeção diária de extintores") |
| description | text | NULL | Descrição / escopo |
| location | text | NULL | Local / área |
| frequency_type | text | 'fixed' | 'fixed' ou 'custom' |
| frequency_preset | text | NULL | daily/weekly/biweekly/monthly/quarterly/semiannual/annual |
| frequency_days | int | NULL | Dias customizados |
| alert_days_before | int | 1 | Antecedência do alerta |
| is_periodic | boolean | true | Se false = inspeção avulsa (sem recorrência) |
| responsible | text | NULL | Responsável pela inspeção |
| last_done_at | date | NULL | Última execução |
| next_due_at | date | NULL | Próximo vencimento (NULL se avulsa concluída) |
| status | text | 'active' | active / inactive |
| notes | text | NULL | Observações gerais |
| created_by | uuid FK profiles | NULL | |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

### Tabela `inspection_executions` — Histórico de execuções
| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid PK | gen_random_uuid() | |
| company_id | uuid FK companies | — | |
| inspection_id | uuid FK inspections | — | |
| executed_at | date NOT NULL | — | Data da execução |
| result | text | 'conforme' | conforme / nao_conforme / parcial |
| observations | text | NULL | Notas da execução |
| executed_by | uuid FK profiles | NULL | Quem executou |
| created_at | timestamptz | now() | |

### Tabela `inspection_attachments` — Anexos por execução
| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid PK | gen_random_uuid() | |
| company_id | uuid FK companies | — | |
| inspection_id | uuid FK inspections | — | |
| execution_id | uuid FK inspection_executions | NULL | Se NULL = anexo geral |
| file_url | text NOT NULL | — | |
| file_name | text NOT NULL | — | |
| file_type | text | 'other' | evidence / checklist / photo / other |
| uploaded_by | uuid FK profiles | NULL | |
| uploaded_at | timestamptz | now() | |

### Tabela `inspection_actions` — Ações corretivas de inspeções
| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid PK | gen_random_uuid() | |
| company_id | uuid FK companies | — | |
| inspection_id | uuid FK inspections | — | |
| execution_id | uuid FK inspection_executions | NULL | Vinculada a execução específica |
| description | text NOT NULL | — | O que precisa ser corrigido |
| responsible | text | NULL | Responsável pela ação |
| due_date | date | NULL | Prazo |
| status | text | 'pending' | pending / in_progress / done |
| completed_at | timestamptz | NULL | |
| completed_by | uuid FK profiles | NULL | |
| completion_notes | text | NULL | Notas de conclusão |
| evidence_url | text | NULL | Arquivo de evidência |
| evidence_name | text | NULL | Nome do arquivo |
| created_by | uuid FK profiles | NULL | |
| created_at | timestamptz | now() | |

### Tabela `inspection_document_links` — Vínculo com Biblioteca de Documentos
| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid PK | gen_random_uuid() | |
| company_id | uuid FK companies | — | |
| inspection_id | uuid FK inspections | — | |
| document_id | uuid FK documents | — | |
| linked_by | uuid FK profiles | NULL | |
| linked_at | timestamptz | now() | |

### RLS
Padrão `company_id = get_user_company_id()` para SELECT/INSERT/UPDATE/DELETE em todas as 5 tabelas.

### Storage
Bucket privado: `inspection-files` (para anexos de execuções e evidências de ações corretivas).

### Frequências (ampliadas vs Serviços Periódicos)
- **daily**: 1 dia
- **weekly**: 7 dias
- **biweekly**: 14 dias
- **monthly**: 30 dias
- **quarterly**: 90 dias
- **semiannual**: 180 dias
- **annual**: 365 dias
- **custom**: valor personalizado

---

## 2. Arquivos a criar

### Lib/Hooks
- **`src/lib/inspections.ts`** — Frequências (com daily/biweekly), status, helpers de formatação
- **`src/hooks/useInspections.ts`** — useInspections, useSaveInspection, useDeleteInspection, useInspectionExecutions, useSaveExecution, useInspectionActions, useSaveAction, useCompleteAction, useInspectionAttachments, useInspectionDocumentLinks

### Página
- **`src/pages/Inspecoes.tsx`** — Página única com:
  - KPI cards no topo (total, vencidas, não conformes na semana, ações pendentes)
  - Filtros: período (padrão = semana atual), status, resultado
  - Tabela de inspeções com status, próx. vencimento, último resultado
  - Drawer de cadastro/edição
  - Drawer de detalhe com timeline de execuções
  - Modal de registrar execução
  - Modal de ação corretiva

### Componentes
- **`src/components/inspecoes/InspectionKpiCards.tsx`** — KPIs
- **`src/components/inspecoes/InspectionDrawer.tsx`** — Criar/editar inspeção (com link de documentos)
- **`src/components/inspecoes/InspectionDetailDrawer.tsx`** — Detalhe + timeline de execuções + ações
- **`src/components/inspecoes/RegisterExecutionModal.tsx`** — Registrar execução (resultado + obs + anexos)
- **`src/components/inspecoes/InspectionActionDrawer.tsx`** — Criar/concluir ação corretiva (com upload de evidência)
- **`src/components/inspecoes/DeleteInspectionDialog.tsx`** — Confirmação de exclusão
- **`src/components/inspecoes/InspectionFilters.tsx`** — Filtros por período, status, resultado
- **`src/components/inspecoes/InspectionDocumentsSection.tsx`** — Vinculação de documentos da biblioteca (replicando ServiceDocumentsSection)

---

## 3. Arquivos a editar

- **`src/App.tsx`** — Adicionar rota `/inspecoes`
- **`src/components/AppSidebar.tsx`** — Adicionar item "Inspeções" no grupo Segurança com ícone ClipboardCheck e badge de vencidas
- **`src/lib/storage-utils.ts`** — Adicionar "inspection-files" ao PRIVATE_BUCKETS

---

## 4. Comportamentos-chave

### Ciclo periódico (similar a Serviços Periódicos)
- Ao registrar execução: `last_done_at` = data da execução, `next_due_at` recalculado pela frequência
- Status dinâmico: ok / warning / expired baseado em `next_due_at` vs hoje
- Inspeções avulsas (`is_periodic = false`): sem recálculo, `next_due_at` = NULL após execução

### Execuções
- Cada execução registra resultado: **Conforme**, **Não conforme**, **Parcialmente conforme**
- Anexos vinculados à execução (fotos, checklists preenchidos)
- Timeline de execuções no drawer de detalhe (como histórico de serviços)
- Filtro padrão: semana atual; expansível para qualquer período

### Ações corretivas
- Criadas a partir de uma execução não conforme (ou independentemente)
- Campos: descrição, responsável, prazo, status
- Ao concluir: upload obrigatório de evidência + notas
- Status: Pendente → Em andamento → Concluída

### Vinculação de documentos
- Replicar `ServiceDocumentsSection` / `ServiceDocumentsDetail`
- Permite vincular APRs, ITs, checklists da Biblioteca de Documentos
- Exibido no drawer de cadastro e no drawer de detalhe

### Visualização padrão
- Tabela filtra por padrão inspeções da **semana atual** (seg-dom)
- Chips de filtro rápido: Todas, Vencidas, Não conformes
- Busca por nome da inspeção

---

## 5. Ordem de implementação

1. Migration SQL (5 tabelas + RLS + bucket)
2. `src/lib/inspections.ts` + `src/hooks/useInspections.ts`
3. Componentes (KPIs, Drawers, Modais, Filtros, DocumentsSection)
4. Página `Inspecoes.tsx`
5. Integrar no `App.tsx` (rota) e `AppSidebar.tsx` (menu + badge)
6. Atualizar `storage-utils.ts`
