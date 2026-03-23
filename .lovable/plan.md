

# Módulo de Serviços Periódicos — Plano de Implementação

## Resumo

Construir o módulo completo de Serviços Periódicos com 4 novas tabelas, storage bucket, 7+ componentes de UI, e integração com sidebar/dashboard existentes.

---

## 1. Banco de Dados (1 migration)

Criar migration com:

- **service_categories** — com RLS por company_id (SELECT, INSERT, UPDATE, DELETE)
- **periodic_services** — com RLS por company_id, FK para categories e profiles
- **service_attachments** — com RLS por company_id, FK para services e profiles
- **service_history** — com RLS por company_id, FK para services e profiles
- **Storage bucket** `service-attachments` (public) com RLS policies para acesso por company_id
- **Função** `seed_default_categories(p_company_id uuid)` — insere as 4 categorias padrão (Segurança, Predial, Ambiental, Equipamentos) se a empresa não tiver categorias ainda
- **Trigger** `on_company_created` na tabela companies para chamar seed automático (AFTER INSERT)

RLS em todas as tabelas segue o padrão existente usando `get_user_company_id()`.

---

## 2. Estrutura de Arquivos

```text
src/pages/Servicos.tsx              — Página principal com KPIs + tabela
src/components/servicos/
  ServiceDrawer.tsx                 — Drawer criar/editar serviço
  ServiceDetailDrawer.tsx           — Drawer detalhes + histórico (2 abas)
  RegisterCompletionModal.tsx       — Modal registrar realização
  DeleteServiceDialog.tsx           — Dialog confirmação exclusão
  ManageCategoriesModal.tsx         — Modal gerenciar categorias
  ServiceFilters.tsx                — Barra de filtros
  KpiCards.tsx                      — 4 cards de status
  ServiceEmptyState.tsx             — Estado vazio
  FileUploadArea.tsx                — Componente upload com drag-and-drop
```

---

## 3. Alterações em Arquivos Existentes

- **App.tsx** — Adicionar rota `/servicos` protegida
- **AppSidebar.tsx** — Ativar "Serviços Periódicos" (remover disabled, adicionar link `/servicos`, badge de alertas)
- **Dashboard.tsx** — Adicionar seção "Atenção necessária" com até 5 serviços urgentes

---

## 4. Funcionalidades Principais

### Página /servicos
- 4 KPI cards clicáveis (total, em dia, vencendo, vencidos)
- Tabela com colunas: nome, categoria (badge colorido), frequência, última realização, próxima data, fornecedor, status, ações
- Filtros: busca por nome, categoria, status, ordenação
- Status calculado dinamicamente no frontend comparando `next_due_at` com hoje e `alert_days_before`

### Drawer Criar/Editar
- Seções: Identificação, Frequência (toggle fixo/custom), Última realização (com preview da próxima data), Info adicional, Anexos (drag-and-drop com tipo de arquivo)
- Cálculo automático de `next_due_at` ao salvar
- Botão inline "+ Nova categoria" dentro do select

### Modal Registrar Realização
- Atualiza `last_done_at`, `next_due_at` e `supplier` no serviço
- Insere registro em `service_history`
- Upload opcional de comprovante

### Drawer Detalhes + Histórico
- Aba "Detalhes": info do serviço read-only + anexos + botão editar
- Aba "Histórico": timeline cronológica dos registros

### Modal Gerenciar Categorias
- CRUD de categorias com cor (8 cores predefinidas + custom)
- Bloqueia exclusão se houver serviços vinculados

### Exclusão de Serviço
- Deleta history, attachments (+ arquivos do Storage), e o serviço

### Restrição de Plano
- Botões de ação desabilitados com tooltip quando `plan === 'expired'`

---

## 5. Detalhes Técnicos

- Datas formatadas DD/MM/AAAA com `date-fns` + locale `ptBR`
- Frequências mapeadas: weekly=7, monthly=30, quarterly=90, semiannual=180, annual=365
- Upload para Storage path: `{company_id}/{service_id}/{filename}`
- Drawer usa componente `vaul` (já instalado via shadcn drawer)
- Calendar com `pointer-events-auto` para funcionar dentro de popover
- Seed de categorias padrão via trigger no banco (para novas empresas) + verificação no frontend para empresas existentes que ainda não têm categorias

