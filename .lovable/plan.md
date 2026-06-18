## Objetivo

Reformular `src/pages/LandingPage.tsx` abandonando a estética editorial densa (IBM Plex Serif, capítulos numerados, parágrafos longos) e adotando o padrão das referências citadas — **Linear / Notion / Stripe / Vercel / Supabase**: above-the-fold cristalino, produto sendo mostrado em vez de descrito, copy curta, muito espaço, motion sutil.

Mantém 100% do conteúdo funcional (rotas, módulos, planos, FAQ, SEO/JSON-LD, toggle mensal/anual, links pra `/funcionalidades/*`, `/faq`, `/auth`).

---

## Princípios aplicados

1. **Regra dos 3 segundos** — hero entrega em 1 frase: "o que é + para quem + valor". Sem rolar você vê o produto, o CTA e prova social.
2. **Produto > texto** — substituir blocos de parágrafos por mockups da UI real do app (dashboard, módulo de treinamentos, MTR, portal de fornecedores). Renderizados em HTML/CSS dentro de "browser frames" (não imagens de banco).
3. **Transparência** — CTA primário "Começar grátis" sem cartão; link "Ver preços" visível no nav; preços âncora `#precos` mostrados sem ginástica.

---

## Direção visual (Linear-inspired, mantendo Emerald Prestige)

- **Tema escuro por padrão na landing** (não afeta app interno): fundo `#0a0f0d` quase preto com verde profundo, texto `#e6efe9`, esmeralda `#10b981` como acento, dourado `#c9a84c` reservado a 1-2 detalhes.
- **Tipografia simplificada**: trocar IBM Plex Serif → **Inter Tight** (display) + **Inter** (body). Sem serifa. Mono apenas em snippets/badges (`JetBrains Mono`).
- **Componentes-chave**: cards translúcidos com borda 1px `white/8`, glow esmeralda sutil em hover, grid de pontinhos de fundo, gradient blur radial no hero.
- **Motion**: gradient mesh animado no hero, cursor-aware tilt em mockups, reveal-on-scroll já existente (manter `useReveal`), conta-regressiva de stats. Sem framer-motion (CSS + RAF).

---

## Nova estrutura (above-the-fold first)

```text
[Nav fixa translúcida: logo · Produto · Preços · FAQ · Login · CTA]

┌────────────────────────────────────────────────────┐
│ HERO (100vh)                                       │
│  Badge "Gestão HSE para indústria brasileira"      │
│  H1: "A plataforma HSE que               "         │
│      "elimina planilhas."         ← 2 linhas max   │
│  Sub 1 linha + 2 CTAs (primário/secundário)        │
│  Logos de segmentos (marquee discreto)             │
│                                                    │
│  [MOCKUP HERO: dashboard real do app em browser    │
│   frame, com tilt 3D sutil no scroll]              │
└────────────────────────────────────────────────────┘

[Bento grid de 4 módulos — cada card com mini-mockup
 da feature, hover revela detalhe]

[Section "Feito para sua operação" — tabs Segurança /
 Saúde / Meio Ambiente com mockup correspondente ao
 lado (split: lista + screenshot)]

[Stats strip — 3 números grandes animados]

[Como funciona — 3 passos visuais, ilustração em vez
 de texto longo]

[Depoimentos — 3 cards horizontais compactos com avatar]

[Pricing — 4 cards, toggle mensal/anual, Professional
 destacado com glow esmeralda]

[FAQ resumida — 4 perguntas + link /faq]

[CTA final full-bleed + Footer]
```

---

## Mockups do produto (sem banco de imagens)

Construir 4 "screenshots" puramente em HTML/CSS dentro de browser frames:

1. **Hero mockup** — Dashboard com KPIs, gráfico de barras, lista de alertas.
2. **Treinamentos** — Tabela com status (OK / Vencendo / Vencido) coloridos.
3. **MTR** — Card de transporte com timeline de prazo CDF.
4. **Portal Fornecedores** — Tela de upload com checklist.

Cada mockup vira componente local em `LandingPage.tsx` (`<DashboardMockup />`, etc.) — leve, sem dependências, dark-themed.

---

## Arquivos a alterar

- **`src/pages/LandingPage.tsx`** — reescrita completa, mantendo arrays de dados (`moduleGroups`, `pricingPlans`, `testimonials`, `faqs`), SEO/JSON-LD, hook `useReveal`, toggle de pricing.
- **`src/index.css`** — substituir tokens `--lp-*` editoriais pelos novos (dark base, esmeralda, glow shadows, grid background). Remover keyframes não usadas, adicionar `mesh-shift` e `tilt`.
- **`tailwind.config.ts`** — atualizar `fontFamily.lp-display`/`lp-sans` para `Inter Tight`/`Inter`; manter `lp-mono`. Atualizar `colors.lp.*` para nova paleta dark.
- **`src/main.tsx`** — substituir imports `@fontsource/ibm-plex-*` por `@fontsource/inter` + `@fontsource-variable/inter-tight` (manter `jetbrains-mono` para snippets).
- **`package.json`** — `bun add @fontsource/inter @fontsource-variable/inter-tight @fontsource/jetbrains-mono`; remover `@fontsource/ibm-plex-{serif,sans,mono}`.

---

## O que NÃO muda

- Nenhuma rota, lógica de auth, backend, planos, FAQ ou tokens do app interno (sidebar/dashboards/admin permanecem com tema claro atual).
- Conteúdo textual essencial (nomes de módulos, preços, perguntas) — apenas encurtado/reformatado.
- `src/pages/FAQ.tsx`, `/funcionalidades/*` ficam intactos.

---

## Validação

Capturar `/` via Playwright (1280×1800, dark), verificar:
- Above-the-fold mostra headline + sub + CTA + mockup sem rolar
- Mockups renderizam como UI real (não placeholder)
- Pricing aparece com toggle funcionando
- Nav fixa com link "Preços" visível
