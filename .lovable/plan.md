## Problemas identificados

1. **Botão "Novo evento" desabilitado no Professional** — O módulo `calendar` não foi adicionado à lista `modules` do plano em `plan_definitions`. Por isso `has_module_editor_permission('calendar')` retorna `false` e o `PermissionButton` aparece com opacidade e sem clique. No trial funciona porque o trial já inclui todos os módulos.

2. **Aba "cortada" com sidebar estendida** — A página `Calendario.tsx` força `min-w-[1280px]` no container principal. Como a sidebar ocupa ~256px, o conteúdo total ultrapassa a viewport, gerando scroll horizontal e cortando o botão "Novo evento" à direita e a coluna do dia selecionado.

3. **Conformidade geral 67% sem dados** — No `Dashboard.tsx` (linha 117), quando não há colaboradores ativos, o `asoStats.conformity` retorna **0** (e não 100, como em serviços e treinamentos). A média ponderada vira `(100 + 100 + 0) / 3 ≈ 67%`.

## Mudanças

### 1. Política de planos (regra permanente)
Atualizar `plan_definitions` via migration:
- **starter** → permanece como está (sem novos módulos automaticamente).
- **professional** → recebe `calendar` (e qualquer módulo novo futuro que não seja explicitamente Enterprise).
- **enterprise** → recebe `calendar` também.

Isto também será aplicado a partir de agora como regra fixa: novo módulo criado entra automaticamente em Professional + Enterprise, salvo indicação contrária. Vou registrar essa regra no `mem://` para nunca esquecer.

SQL:
```sql
UPDATE public.plan_definitions
SET modules = array_append(modules, 'calendar')
WHERE plan_key IN ('trial','professional','enterprise')
  AND NOT ('calendar' = ANY(modules));
```

### 2. Sidebar não corta mais o Calendário
Em `src/pages/Calendario.tsx`:
- Remover `min-w-[1280px]` do container raiz (o layout global já garante 1280px mínimo).
- Trocar o grid `grid-cols-[1fr_360px]` para algo mais flexível (ex.: `lg:grid-cols-[minmax(0,1fr)_340px]`) para que a coluna do dia não force overflow.

### 3. Correção da Conformidade geral
Em `src/pages/Dashboard.tsx`, linha 117: quando `total === 0` (nenhum colaborador ativo), retornar `100` em vez de `0`, alinhando com serviços e treinamentos. Assim a conformidade geral fica em 100% para empresas vazias.

### 4. Memória de regra de planos
Adicionar `mem://logic/planos-modulos-novos`:
> Ao criar qualquer módulo novo, adicioná-lo automaticamente ao array `modules` dos planos `trial`, `professional` e `enterprise` em `plan_definitions`. O plano `starter` permanece como está, salvo solicitação do usuário. Só não incluir em Professional se o usuário disser explicitamente que o módulo é exclusivo de Enterprise.

## Detalhes técnicos
- Não há alteração em RLS — apenas dados em `plan_definitions`.
- `usePlan` invalida cache automaticamente após mudança de plano; após a migration o usuário pode precisar fazer logout/login (ou aguardar o cache do hook) para a permissão de `calendar` aparecer no Professional já existente.
- Nenhum impacto em Starter (continua sem Calendário; o sidebar e a rota já são bloqueados por `useModuleAccess`/`usePermission`).
