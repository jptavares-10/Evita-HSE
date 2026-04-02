

## Plano: Implementar Estrutura Completa de Planos no Evita HSE

### Visao Geral

Implementar sistema de planos (Trial, Starter, Professional, Enterprise) com controle de acesso por modulo, banners contextuais, modal de upgrade, sidebar com cadeado, e preparacao para Stripe. O modulo EPI esta incluido a partir do plano Professional.

---

### 1. Migracao de Banco de Dados

Uma unica migracao SQL para:

**Novas colunas em `companies`:**
- `plan_billing` (text, nullable) -- 'monthly' | 'annual'
- `plan_started_at` (timestamptz, nullable)
- `plan_expires_at` (timestamptz, nullable)
- `storage_gb` (integer, default 5)
- `stripe_customer_id` (text, nullable)
- `stripe_subscription_id` (text, nullable)
- `stripe_price_id` (text, nullable)

**Nova tabela `plan_definitions`:**
- `plan_key` (text PK), `name`, `price_monthly`, `price_annual`, `max_users`, `storage_gb`, `modules` (text[])
- Inserir 4 registros (trial, starter, professional, enterprise) com os modulos conforme a tabela do prompt
- EPI incluido em professional e enterprise: `'{periodic_services,trainings,ic_nc,aso,mtr,environmental_licenses,suppliers,document_library,inspections,user_permissions,epi}'`

**Nova tabela `plan_change_history`:**
- `id`, `company_id`, `from_plan`, `to_plan`, `billing_type`, `changed_at`, `changed_by`, `reason`
- RLS: leitura/escrita para mesma empresa

**Nova tabela `payment_intents`:**
- Estrutura vazia para futuro Stripe (id, company_id, stripe_payment_intent_id, amount, currency, status, plan_key, billing_type, created_at)
- RLS: leitura para mesma empresa

**RPC `get_company_access_status()`:**
- SECURITY DEFINER
- Retorna: plan, billing, status ('active'|'trial'|'expired'|'grace'), modules_included (text[]), days_remaining, max_users, storage_gb
- Logica: trial verifica trial_ends_at; planos pagos verificam plan_expires_at com 7 dias de grace period; expired retorna modulos vazios

**Migracao de dados existentes:**
- plan='basic' -> 'starter', max_users=5, storage_gb=5, plan_expires_at=now()+30d
- plan='pro' -> 'professional', max_users=10, storage_gb=20, plan_expires_at=now()+30d
- plan='trial' com trial_ends_at expirado -> plan='expired'

**Atualizar RLS de `companies`:**
- Ajustar WITH CHECK do UPDATE para incluir novos campos (storage_gb, plan_billing, etc.) como imutaveis via cliente direto

---

### 2. Hook `usePlan` (src/hooks/usePlan.ts)

Novo hook que chama a RPC `get_company_access_status()` e expoe:

```typescript
const { plan, status, billing, hasModule, daysRemaining, isExpired, canEdit, modulesIncluded, maxUsers, storageGb, loading } = usePlan()
```

- `hasModule(module)`: verifica se modulo esta em `modulesIncluded`
- `canEdit`: false se status='expired'
- Cache global similar ao usePermission para evitar chamadas duplicadas

---

### 3. Integrar `usePlan` com `usePermission` (src/hooks/usePermission.ts)

Dentro do usePermission, alem de verificar role (admin/editor/viewer), tambem verificar:
- Se `usePlan().hasModule(module)` retorna false -> canEdit = false
- Se `usePlan().isExpired` -> canEdit = false

Isso bloqueia edicao automaticamente em todos os modulos que ja usam usePermission.

---

### 4. Sidebar com Cadeado (src/components/AppSidebar.tsx)

- Importar `usePlan`
- Para cada item de modulo na sidebar, verificar `hasModule(moduleKey)`
- Se modulo nao incluido:
  - Mostrar icone Lock ao lado do label (texto em cinza)
  - Ao clicar: nao navegar, abrir `UpgradeModal` com info do modulo
- Se status='expired': todos os itens com cadeado
- Mapeamento sidebar-item -> moduleKey (ex: "/mtr" -> "mtr", "/epi" -> "epi")

---

### 5. Modal de Upgrade (src/components/UpgradeModal.tsx)

Componente reutilizavel:
- Props: `module` (nome), `open`, `onClose`
- Mostra icone do modulo, nome, descricao curta
- "Disponivel nos planos:" com badges
- Botoes: "Ver todos os planos" (navega /planos) e "Fechar"

---

### 6. Banner Contextual (src/components/TrialBanner.tsx)

Refatorar para usar `usePlan()`:
- **trial**: Banner azul "Voce esta no trial -- X dias restantes"
- **active**: Sem banner
- **grace**: Banner amarelo "Seu plano expirou. Voce tem X dias para renovar..."
- **expired**: Banner vermelho "Seu acesso expirou. Escolha um plano..."

---

### 7. Tela de Planos Atualizada (src/pages/Planos.tsx)

- Toggle Mensal/Anual no topo
- 4 cards: Trial, Starter (R$97/R$970), Professional (R$247/R$2.470), Enterprise (R$497/R$4.970)
- Badge "2 meses gratis" quando anual selecionado
- Card do plano atual: badge "Seu plano atual"
- Planos superiores: botao "Fazer upgrade" desabilitado com tooltip "Em breve"
- Planos inferiores: botao "Fazer downgrade" desabilitado com tooltip
- Lista de features, limites de usuarios e storage por plano
- Highlight no card Professional ("Recomendado")

---

### 8. Bloqueio de URL Direta (src/components/ProtectedRoute.tsx ou componente wrapper)

- Criar componente `ModuleGuard` que verifica `hasModule(module)` antes de renderizar a rota
- Se modulo nao permitido: redireciona para `/planos` com toast "Este modulo nao esta incluido no seu plano"
- Aplicar nos routes de cada modulo em App.tsx

---

### 9. Arquivos Modificados/Criados

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar (tabelas, RPC, dados) |
| `src/hooks/usePlan.ts` | Criar |
| `src/hooks/usePermission.ts` | Editar (integrar usePlan) |
| `src/components/UpgradeModal.tsx` | Criar |
| `src/components/TrialBanner.tsx` | Refatorar |
| `src/components/AppSidebar.tsx` | Editar (cadeado + modal) |
| `src/pages/Planos.tsx` | Reescrever |
| `src/App.tsx` | Editar (ModuleGuard nas rotas) |
| `src/contexts/AuthContext.tsx` | Editar (adicionar storage_gb e novos campos ao tipo Company) |

---

### Detalhes Tecnicos

- A RPC `get_company_access_status` roda com SECURITY DEFINER e busca o company_id do usuario via `auth.uid()`
- O hook `usePlan` usa cache global (mesmo padrao do usePermission) para evitar chamadas duplicadas
- O `ModuleGuard` e um wrapper de rota que recebe a moduleKey como prop
- Nenhuma funcionalidade existente dos modulos e alterada -- apenas a visibilidade/acesso e condicionada
- O modulo `epi` esta mapeado como disponivel em: trial (todos), professional e enterprise
- O modulo `user_permissions` (tela de permissoes granulares) so aparece em professional e enterprise

