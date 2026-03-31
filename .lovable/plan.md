

# Plano de Implementacao — Modulo EPI

## Resumo
Criar o modulo completo de EPI seguindo o padrao de Treinamentos (layout com tabs + Outlet), com catalogo de EPIs, controle de estoque, entregas a colaboradores e controle de CA.

---

## 1. Migration SQL

Criar 3 tabelas + bucket de storage + RLS:

**`epi_types`** — Catalogo de EPIs
- id, company_id, name, description, ca_number, ca_expires_at, ca_alert_days_before (default 60), ca_file_url, ca_file_name, unit (default 'un'), minimum_stock (default 0), created_at

**`epi_stock_movements`** — Movimentacoes de estoque
- id, company_id, epi_type_id (FK epi_types), movement_type (entry/exit), quantity, notes, moved_at (date), registered_by, delivery_id (FK epi_deliveries, nullable), created_at

**`epi_deliveries`** — Entregas a colaboradores
- id, company_id, epi_type_id (FK epi_types), employee_id (FK employees), delivered_at, quantity (default 1), reason, returned_at, notes, registered_by, created_at

RLS: padrao `company_id = get_user_company_id()` para SELECT/INSERT/UPDATE/DELETE em todas as 3 tabelas.

Storage bucket: `epi-certificates` (privado) para docs de CA.

---

## 2. Arquivos a criar

### Backend/Hooks
- **`src/hooks/useEpi.ts`** — hooks: useEpiTypes, useSaveEpiType, useDeleteEpiType, useEpiStockMovements, useSaveStockMovement, useEpiDeliveries, useSaveDelivery, useEpiStock (calculo saldo)
- **`src/lib/epi.ts`** — funcoes utilitarias: computeCaStatus, computeStockStatus, formatDateBR

### Paginas (layout tabs como Treinamentos)
- **`src/pages/Epi.tsx`** — Layout com tabs (Visao Geral, Catalogo, Estoque, Entregas) + Outlet
- **`src/pages/EpiVisaoGeral.tsx`** — KPIs + alertas (CAs vencendo, estoque baixo)
- **`src/pages/EpiCatalogo.tsx`** — CRUD de EPIs com drawer, tabela com CA status e estoque atual
- **`src/pages/EpiEstoque.tsx`** — Historico de movimentacoes + registrar entrada/saida
- **`src/pages/EpiEntregas.tsx`** — Registrar entregas a colaboradores (select de employees via useEmployees) + historico

### Componentes
- **`src/components/epi/EpiKpiCards.tsx`** — Cards: EPIs cadastrados, Estoque baixo, CAs vencendo, Entregas no mes
- **`src/components/epi/EpiDrawer.tsx`** — Criar/editar EPI com upload de doc CA
- **`src/components/epi/StockMovementDrawer.tsx`** — Registrar entrada/saida manual
- **`src/components/epi/DeliveryDrawer.tsx`** — Registrar entrega (select colaborador via useEmployees)
- **`src/components/epi/DeleteEpiDialog.tsx`** — Confirmacao de exclusao

---

## 3. Arquivos a editar

- **`src/App.tsx`** — Adicionar rotas: /epi (layout), /epi (index → EpiVisaoGeral), /epi/catalogo, /epi/estoque, /epi/entregas
- **`src/components/AppSidebar.tsx`** — Adicionar item "EPIs" no grupo Seguranca com icone HardHat e badge de CAs vencidos + estoque baixo
- **`src/lib/storage-utils.ts`** — Adicionar "epi-certificates" ao PRIVATE_BUCKETS
- **`src/integrations/supabase/types.ts`** — Sera atualizado automaticamente apos migration

---

## 4. Comportamentos-chave

- **Entrega gera saida automatica**: ao salvar delivery, hook cria um stock_movement com movement_type='exit' e delivery_id vinculado
- **Estoque = SUM(entry) - SUM(exit)**: calculado via query ou no hook, sem coluna de saldo
- **CA status**: ok (> alert_days), warning (<= alert_days), expired (vencido) — mesmo padrao de licencas
- **Colaboradores**: reutiliza useEmployees() de useTrainings.ts — select com nome do colaborador
- **Upload CA**: mesmo padrao de training-certificates, bucket privado, signed URLs

---

## 5. Ordem de implementacao

1. Migration SQL (tabelas + RLS + bucket)
2. src/lib/epi.ts + src/hooks/useEpi.ts
3. Componentes (KPI, Drawers, Delete)
4. Paginas (Epi, EpiVisaoGeral, EpiCatalogo, EpiEstoque, EpiEntregas)
5. Integrar no App.tsx (rotas) e AppSidebar.tsx (menu + badge)
6. Atualizar storage-utils.ts

