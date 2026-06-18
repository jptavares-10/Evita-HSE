## Objetivo

Reformular `src/pages/LandingPage.tsx` adotando a estrutura editorial densa do protótipo v1 escolhido, preservando 100% das funcionalidades atuais (nav, hero com CTAs, trust strip, dor, módulos agrupados por área HSE, como funciona, depoimentos, planos, FAQ resumida com link para `/faq`, footer). Visual mais artístico-enterprise com motion sofisticado.

## Tipografia (ajustada ao setor HSE/industrial)

O protótipo usava Fraunces (serifa fashion-editorial). Para soar mais "engenharia / indústria / institucional sério" — alinhado ao público HSE — proponho:

- **Display (headlines):** `IBM Plex Serif` — serifa técnica, com herança industrial/engenharia (família IBM), peso institucional sem soar luxo-moda
- **Body / UI:** `IBM Plex Sans` — sans humanista da mesma família, ótima legibilidade técnica
- **Mono opcional (números/kickers):** `IBM Plex Mono` para kickers tipo "01 / 04 — SEGURANÇA"

A família Plex transmite rigor de engenharia + sofisticação editorial, o que casa melhor com SSMA/HSE do que Fraunces ou Cormorant. Cores permanecem **Emerald Prestige**: `#064e3b` (verde profundo), `#0d7a5f` (esmeralda), `#c9a84c` (dourado acento), `#f5f0e0` (creme).

> Se preferir alternativa, sugiro: `Newsreader + Inter Tight` (mais editorial-tech) ou `Libre Baskerville + IBM Plex Sans` (mais institucional-legal). Decida no review.

## Tokens de design (em `src/index.css` + `tailwind.config.ts`)

- Adicionar variáveis HSL para a paleta esmeralda:
  - `--lp-bg: 40 33% 98%` (creme #FDFCF9)
  - `--lp-ink: 152 39% 9%` (verde-tinta #0c1f15)
  - `--lp-emerald-deep: 159 84% 17%` (#064e3b)
  - `--lp-emerald: 162 80% 27%` (#0d7a5f)
  - `--lp-gold: 43 50% 54%` (#c9a84c)
  - `--lp-cream: 42 47% 92%` (#f5f0e0)
  - `--lp-sand: 38 25% 91%` (#F2EFE9)
- Tokens só para a landing (prefixo `lp-`) para não afetar o app interno.
- Mapear no Tailwind como `lp.bg, lp.ink, lp.emerald, lp.emeraldDeep, lp.gold, lp.cream, lp.sand`.
- Famílias: `font-display` → `IBM Plex Serif`, `font-sans-lp` → `IBM Plex Sans`, `font-mono-lp` → `IBM Plex Mono`.

## Carregamento das fontes

Instalar via `@fontsource`:
- `@fontsource/ibm-plex-serif` (300, 400 italic, 600)
- `@fontsource/ibm-plex-sans` (300, 400, 500, 600)
- `@fontsource/ibm-plex-mono` (400, 500)

Importar em `src/main.tsx`. Não usar `<link>` Google Fonts.

## Estrutura da nova LandingPage

Reescrita seguindo o esqueleto do v1, **adaptado à paleta esmeralda** (não preto-puro):

1. **Nav fixa** com `mix-blend-difference`, logo serifa "evita", links uppercase tracking-widest, botão Login outline → preenchido no hover.
2. **Hero assimétrico** col-span 8/4: kicker "Gestão HSE Inteligente" → headline gigante serifa "Segurança que *respira* tecnologia." + parágrafo curto + CTAs (`Teste grátis` → `/auth?mode=signup`, `Ver demonstração` → âncora ou `/funcionalidades`). Blob esmeralda blur no fundo.
3. **Trust strip** segmentos atuais (já em `trustSegments`) em cinza/grayscale, monospace + serifa misturados.
4. **Seção Dor** fundo `lp.ink` (verde profundo quase preto), headline serifa centralizada, 3 stats em grid (reaproveitando dados ou mantendo "0% / 45% / Real-time" como motivos editoriais; idealmente puxar de painPoints existentes).
5. **Módulos (Ecossistema Integrado)** — **manter as 4 áreas HSE com tabs** (`groupTabs`) já existentes; renderizar como grid editorial com hover invertendo cor para `lp.ink`. Sub-cards listam os 10 `modules` agrupados.
6. **Como funciona** — fundo `lp.sand`, 3 passos com numeração italic serifa (já existe `steps`).
7. **Depoimentos** — pull-quote serifa enorme com borda-esquerda esmeralda, iterando `testimonials`.
8. **Pricing** — 4 planos (preservar `pricingPlans` completo, não reduzir para 3), card central em destaque com `bg-lp.ink text-lp.cream`, outline dourado fino no recomendado.
9. **FAQ resumida** — top 4 perguntas do array `faqs` + link "Ver todas as perguntas →" para `/faq`.
10. **Footer institucional** preservando links/contato atuais.

## Motion (animações)

- Manter o hook `useReveal`/`Reveal` existente para fade-up por seção.
- Adicionar nas seções-chave:
  - Hero: fade-in + translate-y na headline com `letter-spacing` animado (CSS keyframe próprio).
  - Trust strip: marquee infinito suave (CSS `@keyframes marquee`).
  - Cards de módulo: barra inferior dourada que cresce no hover (já existe no protótipo).
  - Stats da seção dor: count-up animado ao entrar viewport (hook simples com `requestAnimationFrame`).
  - Parallax sutil no blob do hero via `transform: translateY(scrollY * 0.15)`.
- Tudo via CSS/Tailwind + hooks leves — **sem adicionar framer-motion** (já não está no projeto e não justifica para uma página).

## Componentização

Manter tudo em `src/pages/LandingPage.tsx` (como hoje), mas extrair sub-componentes locais no mesmo arquivo para legibilidade: `<Nav/>`, `<Hero/>`, `<TrustStrip/>`, `<PainSection/>`, `<ModulesSection/>`, `<StepsSection/>`, `<TestimonialsSection/>`, `<PricingSection/>`, `<FAQSection/>`, `<FooterSection/>`. Sem novos arquivos.

## SEO / acessibilidade

- Preservar `usePageTitle` e qualquer JSON-LD existente.
- Garantir único `<h1>` (no hero), demais seções com `<h2>`.
- `alt` em qualquer ícone decorativo = `aria-hidden`.
- Contraste verificado para texto `lp.ink` sobre `lp.cream` e `lp.cream` sobre `lp.ink`.

## Arquivos a alterar

- `src/pages/LandingPage.tsx` — reescrita completa (preserva todos os arrays de dados atuais)
- `src/index.css` — adicionar bloco de tokens `--lp-*` e keyframes `marquee`
- `tailwind.config.ts` — registrar cores `lp.*` e famílias `font-display`, `font-sans-lp`, `font-mono-lp`
- `src/main.tsx` — importar `@fontsource/ibm-plex-{serif,sans,mono}`
- `package.json` — via `bun add` dos 3 pacotes fontsource

## O que **não** muda

- Rotas, autenticação, qualquer página interna do app (apenas a landing pública `/`).
- Conteúdo (textos institucionais), preços, FAQ — apenas reformatados visualmente.
- `src/pages/FAQ.tsx` permanece como está; o link no resumo continua apontando para `/faq`.
- Tokens globais do app interno (sidebar, dashboards) ficam intactos — novos tokens são prefixados `lp-`.

## Validação

Após implementação: capturar screenshot da nova `/` via Playwright e comparar com o protótipo v1 para garantir composição, densidade e hierarquia equivalentes (com a paleta esmeralda + Plex no lugar de preto + Fraunces).
