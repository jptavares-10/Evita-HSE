

# Módulo de Treinamentos — Plano de Implementação

## Resumo

Construir o módulo completo de Treinamentos com 5 novas tabelas, storage bucket, sidebar expandível com sub-itens, 4 telas principais (Visão Geral, Colaboradores, Catálogo, Matriz), e integração com dashboard.

---

## 1. Banco de Dados (1 migration)

Criar migration com:

- **trainings** (id, company_id, name, description, validity_months, alert_days_before, created_at) + RLS por company_id
- **job_positions** (id, company_id, name, created_at) + RLS por company_id
- **training_matrix** (id, company_id, job_position_id FK, training_id FK, created_at, UNIQUE(company_id, job_position_id, training_id)) + RLS
- **employees** (id, company_id, name, job_position_id FK, sector, status default 'active', created_at) + RLS
- **employee_training_records** (id, company_id, employee_id FK, training_id FK, done_at, expires_at, certificate_url, certificate_name, notes, registered_by FK profiles, created_at) + RLS
- **Storage bucket** `training-certificates` (public)
- Storage RLS policies for the bucket

All RLS policies use `get_user_company_id()` following existing pattern.

---

## 2. Estrutura de Arquivos

```text
src/pages/
  Treinamentos.tsx                    — Layout com sub-rotas (tabs)
  TreinamentosVisaoGeral.tsx          — KPIs + pendências
  TreinamentosColaboradores.tsx       — Lista de colaboradores
  TreinamentosCatalogo.tsx            — Lista de treinamentos
  TreinamentosMatriz.tsx              — Grid interativo

src/components/treinamentos/
  TrainingKpiCards.tsx                 — 5 KPI cards
  EmployeeDrawer.tsx                  — Drawer criar/editar colaborador
  EmployeeDetailDrawer.tsx            — Ficha com abas (Treinamentos + Histórico)
  RegisterCertificateModal.tsx        — Modal registrar certificado
  TrainingDrawer.tsx                  — Drawer criar/editar treinamento
  MatrixGrid.tsx                      — Grid checkbox da matriz
  ImportEmployeesModal.tsx            — Modal importação CSV colaboradores
  ImportMatrixModal.tsx               — Modal importação CSV matriz
  TrainingEmptyStates.tsx             — Estados vazios

src/hooks/useTrainings.ts             — Hooks React Query (CRUD trainings, employees, matrix, records)
src/lib/trainings.ts                  — Helpers de status, formatação, cálculos de conformidade
```

---

## 3. Alterações em Arquivos Existentes

- **App.tsx** — Adicionar rotas: `/treinamentos`, `/treinamentos/colaboradores`, `/treinamentos/catalogo`, `/treinamentos/matriz`
- **AppSidebar.tsx** — Ativar "Treinamentos" com sub-itens expandíveis (Visão Geral, Colaboradores, Treinamentos, Matriz) + badge de alertas (expired + missing count)
- **Dashboard.tsx** — Adicionar card "Conformidade de Treinamentos" com % conformidade, pendências e link para `/treinamentos`

---

## 4. Funcionalidades por Tela

### Visão Geral (/treinamentos)
- 5 KPI cards: total colaboradores ativos, 100% em dia, com pendências, vencendo em breve, % conformidade
- Tabela "Treinamentos com mais pendências" (nome, total missing+expired, breakdown por cargo)
- Tabela "Cargos com mais pendências" (cargo, total, em dia, pendentes, % conformidade)
- Lista "Alertas — Vencendo em breve" (status warning, ordenada por expires_at)
- Filtros: setor, cargo, treinamento

### Colaboradores (/treinamentos/colaboradores)
- Tabela com busca, filtros (cargo, setor, status, conformidade)
- Drawer criar/editar colaborador (nome, cargo, setor, status)
- Importação CSV com auto-criação de cargos
- Ficha do colaborador (drawer com 2 abas):
  - Aba Treinamentos: obrigatórios da matriz + extras, com status individual e botão registrar certificado
  - Aba Histórico: timeline de certificados
- Modal registrar certificado: data realização, data vencimento (auto-calculada, editável), upload, notas

### Catálogo (/treinamentos/catalogo)
- Tabela de treinamentos com busca
- Drawer criar/editar (nome, descrição, validade meses, alerta dias)
- Bloqueio de exclusão se houver registros ou vínculo na matriz

### Matriz (/treinamentos/matriz)
- Grid: linhas = cargos, colunas = treinamentos, checkboxes
- Salvamento em tempo real (INSERT/DELETE em training_matrix)
- Importação CSV com criação automática de cargos
- Estado vazio com instrução

---

## 5. Lógica de Status (src/lib/trainings.ts)

- **ok**: expires_at > hoje + alert_days_before
- **warning**: expires_at <= hoje + alert_days_before AND expires_at >= hoje
- **expired**: expires_at < hoje
- **missing**: treinamento obrigatório pelo cargo (via matriz) sem registro do colaborador

Conformidade = registros ok / total obrigações da matriz (apenas colaboradores ativos).

---

## 6. Detalhes Técnicos

- Datas DD/MM/AAAA com date-fns + locale ptBR
- Upload para Storage path: `{company_id}/{employee_id}/{training_id}/{filename}`
- Colaboradores inativos excluídos de cálculos de conformidade e badges
- Plan expired: botões de ação desabilitados com tooltip
- Importação CSV usa FileReader + parsing manual (sem dependência extra)
- Badge na sidebar: soma de expired + missing de colaboradores ativos
- Sub-itens na sidebar usando estado expandido/colapsado com animação

