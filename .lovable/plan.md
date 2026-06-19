## Objetivo

Trazer o software autenticado para o mesmo padrão visual da landing (Emerald Prestige light), padronizar como cards de KPI e cards de módulo se comportam, e elevar o Dashboard. Atualizar a landing para usar o dashboard real como hero.

## 1. Sistema de design unificado (app interno)

Sem mexer em lógica de dados, hooks, RLS, Stripe ou onboarding.

- **Tokens do app**: trazer os tokens `lp-*` (bg cream `#FAFBF8`, ink, border, emerald, gold, mesh, grid) para `src/index.css` como base também do app autenticado. Mapear shadcn `--background / --card / --primary / --border / --muted` para esses tokens, mantendo `--destructive`, `--warning`, `--success` como acentos semânticos.
- **Tipografia interna**: títulos em Inter Tight, corpo em Inter (mesma stack da landing). Números/KPIs em tabular-nums.
- **Sidebar `AppSidebar.tsx`**:
  - Trocar tema escuro por superfície clara (cream/white) com texto ink, hover esmeralda suave, item ativo com pill esmeralda à esquerda + bg `emerald/8`.
  - Logo do header usa `EvitaLogo` + `EvitaWordmark` (mesmo da landing).
  - **Badges intuitivos preservados**: vermelho = vencido/crítico, âmbar = atenção/vencendo, verde = ok, azul = informativo. Reutilizar tokens semânticos existentes; só ajustar saturação para harmonizar com cream.
- **Header de página padrão**: novo componente `PageHeader` (título Inter Tight 28-32, subtítulo muted, slot para ação primária). Aplicar em todas as páginas (Licenças, EPI, IC&NC, Serviços, ASO, MTR, Treinamentos, Inspeções, Documentos, Fornecedores, Usuários, Empresa, Perfil).
- **Componentes compartilhados**: criar `KpiCard`, `ModuleCard`, `SectionCard` em `src/components/ui/` com variantes (default, success, warning, danger, info, neutral). Cor de fundo neutra + barra/ícone colorido em vez de tile inteiro pastel.

## 2. Padronização de interatividade (KPI & cards de módulo)

Comportamento único em toda a app:

- **KPI cards (todas as listas: Licenças, EPI, IC&NC, MTR, Serviços, ASO, Treinamentos)** ficam clicáveis e filtram a tabela da própria página (`Total` limpa filtros, `Vencendo` aplica filtro de status warning, etc.). Estado ativo com ring esmeralda + check sutil; usar `aria-pressed`. Reaproveita filtros já existentes nas páginas.
- **Cards de módulo (Dashboard)**: a área inteira é clicável e leva à página do módulo. "Ver todos →" deixa de ser um link separado; o card todo vira `role="link"` com `:focus-visible` ring. Subitens numéricos (Em dia / Vencendo / Vencidos) tornam-se chips que, ao clicar, abrem a página com pré-filtro aplicado (via querystring, ex.: `/servicos?status=expired`).
- **Hover/foco consistente**: classe utilitária `lp-interactive` (hover translate-y -1px, shadow esmeralda suave, border emerald/20). Aplicada em todo card clicável.
- **Cards estritamente informativos** (ex.: "Conformidade por módulo", "Pendências urgentes") perdem hover/cursor e ganham um leve fundo neutro para diferenciar.

## 3. Dashboard redesenhado

Estrutura:

```
HEADER
  Olá, {nome} · {data} · status global (chip: Tudo em dia / X pendências)
  → ação rápida "Ver pendências"

BANNER DE ATENÇÃO (se houver itens críticos)
  itens com link direto para a página do módulo

GRID PRINCIPAL (12 cols)
  ┌───────────────────────────────┬─────────────────────────┐
  │ KPIs gerais (4 cards small)   │ Pendências urgentes     │
  │ conformidade · ativos · venc. │ (lista compacta, top 5) │
  ├───────────────────────────────┤                         │
  │ Grid bento de MÓDULOS         │                         │
  │ (cards clicáveis padronizados)│                         │
  │ - Serviços   - Treinamentos   │ Conformidade por módulo │
  │ - MTR        - ASO            │ (mini barras horiz.)    │
  │ - Licenças   - IC&NC          │                         │
  │ - EPI        - Inspeções      │ Inspeções da semana     │
  └───────────────────────────────┴─────────────────────────┘
```

- KPI cards e module cards usam os novos componentes padronizados; toda área clicável vai para o módulo correspondente com filtro.
- Lista "Pendências urgentes" ganha agrupamento por módulo, ícone semântico (vermelho/âmbar) e ação rápida.
- Mini barras de conformidade usam token esmeralda com track neutro.
- Tudo light, sem fundos pastel cheios; ênfase via tipografia e acento esmeralda/dourado.

## 4. Landing: hero com dashboard real

- Capturar screenshot do Dashboard novo via Playwright (logado com a sessão pré-injetada, 1280×800, modo retina) e usar `lovable-assets` para servir via CDN.
- Substituir o mockup atual no `LandingHero` por esse screenshot dentro do `BrowserFrame` existente, com badge "Dashboard real do produto".
- Demais seções (Funcionalidades, FeatureSection) **mantêm mockups SVG/HTML** estilizados, conforme escolha.

## 5. Validação

- Playwright em 1280×1800 capturando: Dashboard, Licenças, EPI, IC&NC, Serviços, Treinamentos (visão geral), Sidebar colapsado/expandido. Comparar contraste de badges semânticos.
- Verificar que filtros por KPI funcionam (clicar em "Vencidas" filtra a tabela).
- Build + lint.

## Fora de escopo

- Lógica de negócio, RLS, edge functions, Stripe, onboarding, permissões.
- Páginas de auth (já migradas).
- Tema dark.

## Arquivos principais a tocar

- `src/index.css`, `tailwind.config.ts` (tokens compartilhados app + landing)
- `src/components/AppSidebar.tsx`, `src/components/AppLayout.tsx`
- `src/components/ui/` (novos: `KpiCard`, `ModuleCard`, `PageHeader`, `SectionCard`)
- `src/pages/Dashboard.tsx` (rewrite estrutural)
- Todas as páginas de lista: substituir cards KPI ad-hoc pelo `KpiCard` + ligar filtros
- `src/pages/LandingPage.tsx` + `src/components/landing/LandingHero.tsx` (novo screenshot)
- 1 asset novo: `src/assets/dashboard-hero.png.asset.json`
