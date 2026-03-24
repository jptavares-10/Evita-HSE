

# Melhorias na Sidebar, Serviços Periódicos e IC & NC

## Resumo

Tres partes: (1) reorganizar sidebar em grupos colapsaveis HSE, (2) adicionar tipo de realizacao em servicos periodicos, (3) melhorar historico do drawer de detalhes com exportacao CSV.

---

## 1. Banco de Dados (1 migration)

Adicionar 2 colunas em `service_history`:
- `realization_type` (text, default `'scheduled'`)
- `failure_description` (text, nullable)

---

## 2. Sidebar — Reorganizacao Completa

**Arquivo:** `src/components/AppSidebar.tsx` — reescrever a navegacao

Estrutura de grupos colapsaveis:

```text
Dashboard (item direto, sem grupo)

SEGURANCA (vermelho, Shield icon)
  → Servicos Periodicos [badge]
  → IC & NC [badge]

SAUDE (amarelo, Heart/HeartPulse icon)
  → Treinamentos [badge]
    → sub-itens (Visao Geral, Colaboradores, etc.)

MEIO AMBIENTE (verde, Leaf icon)
  → Gestao de MTR [badge]
  → Fornecedores [badge]

CONFIGURACOES (secao fixa)
  → Minha Empresa, Usuarios, Plano

[Avatar + logout no rodape]
```

Comportamento:
- Estado de cada grupo (aberto/fechado) salvo em `localStorage` key `evita-sidebar-groups`
- Default: todos abertos
- Badge no cabecalho do grupo = soma dos badges dos subitens
- Treinamentos mantem sub-navegacao expansivel dentro do grupo SAUDE
- Sidebar colapsavel (mini-mode) mantem funcionamento atual

---

## 3. Renomear "Incidentes" → "IC & NC"

Arquivos afetados:
- `AppSidebar.tsx` — label do item
- `Incidentes.tsx` — titulo da pagina e `usePageTitle`
- `Dashboard.tsx` — titulo do card e link label
- `OccurrenceKpiCards.tsx` — se houver referencia textual
- Rotas permanecem `/incidentes`

---

## 4. Tipo de Realizacao em Servicos Periodicos

### RegisterCompletionModal.tsx
- Adicionar toggle `realization_type`: "Programado" (default) / "Corretivo"
- Se corretivo: revelar textarea "Descricao da falha"
- Passar ambos campos para o hook `useRegisterCompletion`

### useServices.ts — `useRegisterCompletion`
- Adicionar `realization_type` e `failure_description` ao INSERT em `service_history`

### ServiceDetailDrawer.tsx — Aba Historico
- Exibir badge verde "Programado" ou laranja "Corretivo" em cada entrada
- Se corretivo + failure_description: exibir motivo em italico
- Adicionar botao "Exportar historico" no topo da aba que gera CSV com colunas: Data, Tipo, Fornecedor, Observacao, Motivo da falha, Registrado por

---

## 5. Botao "Ver detalhes" na Tabela de Servicos

**Arquivo:** `src/pages/Servicos.tsx`
- Adicionar icone Eye na coluna de acoes antes dos outros botoes
- Ao clicar: abrir `ServiceDetailDrawer` na aba Detalhes (comportamento existente)

---

## 6. Detalhes Tecnicos

- `useServiceHistory` query ja faz join com `profiles:registered_by` e `notes_editor:notes_edited_by` — precisa incluir os novos campos `realization_type` e `failure_description` (vem automaticamente com `select("*", ...)`)
- Exportacao CSV usa `Blob` + `URL.createObjectURL` + `<a download>` no frontend
- localStorage key para grupos: `evita-sidebar-groups` com formato `{ seguranca: true, saude: true, meio_ambiente: true }`

