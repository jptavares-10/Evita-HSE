

## Plano: Cancelamento de Assinatura + Downgrade Funcional

### Contexto

Atualmente o botao "Fazer downgrade" esta desabilitado com tooltip. O cancelamento so e possivel via portal Stripe externo. Precisamos:
1. Permitir cancelar a assinatura (para ao fim do ciclo) direto pelo frontend
2. Tornar o botao de downgrade funcional (cria novo checkout com plano inferior)

---

### 1. Edge Function `cancel-subscription` (nova)

**Arquivo:** `supabase/functions/cancel-subscription/index.ts`

- Autentica o usuario, verifica se e admin
- Busca o `stripe_subscription_id` da empresa via service role
- Chama `stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })` -- isso mantem o acesso ate o fim do ciclo atual, sem cobranca futura
- Retorna `{ success: true, cancel_at: timestamp }`

---

### 2. Webhook: tratar `customer.subscription.updated` (novo evento)

**Arquivo:** `supabase/functions/stripe-webhook/index.ts`

- Adicionar handler para `customer.subscription.updated`
- Quando `cancel_at_period_end === true`: nao faz nada no banco (acesso continua ate expirar)
- Quando `cancel_at_period_end === false` (reativacao): tambem nao precisa de acao
- O evento `customer.subscription.deleted` ja trata o cancelamento efetivo

**Importante:** Voce precisara adicionar `customer.subscription.updated` no dashboard do Stripe Webhooks tambem.

---

### 3. Downgrade via novo Checkout

**Logica:** Downgrade = criar uma nova sessao de checkout com o plano inferior. O Stripe automaticamente cancela a assinatura anterior quando uma nova e criada para o mesmo customer (ou podemos cancelar explicitamente antes).

- Na `create-checkout`, adicionar logica: se a empresa ja tem `stripe_subscription_id` ativo, cancelar a assinatura atual (com `prorate: true` ou `cancel_at_period_end`) antes de criar o novo checkout
- Alternativa mais simples: usar `stripe.subscriptions.update()` para trocar o price_id diretamente (sem checkout), fazendo downgrade imediato com prorate

**Abordagem escolhida:** Criar nova Edge Function `change-plan` que usa `stripe.subscriptions.update()` para trocar o price diretamente. Isso e mais limpo para downgrades.

**Arquivo:** `supabase/functions/change-plan/index.ts`

- Autentica usuario, verifica admin
- Busca `stripe_subscription_id` da empresa
- Chama `stripe.subscriptions.retrieve()` para pegar o `subscription_item_id`
- Chama `stripe.subscriptions.update(subId, { items: [{ id: itemId, price: newPriceId }], proration_behavior: 'create_prorations' })`
- O webhook `invoice.paid` ja cuida de atualizar o banco quando a proxima fatura for paga
- Para efeito imediato no banco, tambem chama a RPC `activate_plan_from_stripe` com os novos dados

---

### 4. Frontend `Planos.tsx`

**Mudancas:**

- **Botao "Cancelar assinatura"**: aparece no card do plano atual quando ha `stripe_subscription_id`. Abre dialogo de confirmacao. Chama `cancel-subscription`. Mostra toast "Sua assinatura sera cancelada ao fim do ciclo atual."

- **Botao "Fazer downgrade"**: em vez de desabilitado, chama `change-plan` com o plano inferior. Mostra dialogo de confirmacao explicando que a mudanca sera aplicada com prorate.

- **Indicador visual**: quando a assinatura esta marcada para cancelar (`cancel_at_period_end`), mostrar badge "Cancelamento agendado" no card do plano atual.

---

### 5. Atualizar `AuthContext` / `companies`

- Adicionar campo `cancel_at_period_end` (ou similar) para o frontend saber se o cancelamento esta agendado
- Alternativa: buscar essa info diretamente do estado do plano (via RPC ou campo na tabela)

**Migracao SQL:**
- Adicionar coluna `subscription_cancel_at` (timestamptz, nullable) em `companies`
- Atualizar na `cancel-subscription` e limpar quando reativado

---

### Resumo dos arquivos

| Arquivo | Acao |
|---|---|
| `supabase/functions/cancel-subscription/index.ts` | Criar |
| `supabase/functions/change-plan/index.ts` | Criar |
| `supabase/functions/stripe-webhook/index.ts` | Editar (add `customer.subscription.updated`) |
| `src/pages/Planos.tsx` | Editar (cancelamento + downgrade funcional) |
| Migracao SQL | Criar (coluna `subscription_cancel_at`) |

### Nota para o Stripe Dashboard

Apos implementar, adicionar o evento `customer.subscription.updated` no webhook existente no Stripe Dashboard.

