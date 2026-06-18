# Unificar o novo visual em todas as rotas públicas

Hoje o novo design (light, Emerald Prestige, logo + wordmark `Evita HSE`, tokens `lp-*`, fontes Inter Tight/Inter/JetBrains Mono) vive só em `LandingPage.tsx`. Tudo que está fora da `/` ainda usa o tema antigo: azul corporativo (`#2563EB`, gradientes `#070D1A → #0D2451`), logo de escudo azul, fonte padrão e badges/cards no estilo SaaS genérico.

A intervenção é **puramente visual/apresentação** — nenhuma lógica de auth, RPC, RLS, rota, Stripe ou Supabase muda.

## Escopo — rotas a migrar

**Auth / onboarding**
- `src/pages/Cadastro.tsx` (imagem 3 do usuário — logo escudo azul, botão azul "Criar conta")
- `src/pages/Login.tsx`
- `src/pages/CompletarCadastro.tsx`
- `src/pages/Convite.tsx`
- `src/pages/ResetPassword.tsx`

**Landing pública**
- `src/pages/Funcionalidades.tsx` (hero azul-escuro com pontinhos — imagem 2)
- `src/pages/FAQ.tsx`
- `src/pages/Planos.tsx`
- `src/pages/funcionalidades/*Page.tsx` (10 arquivos: Aso, Documentos, Epi, Fornecedores, Incidentes, Inspecoes, Licencas, Mtr, Servicos, Treinamentos)
- `src/pages/PortalFornecedor.tsx`
- `src/pages/NotFound.tsx`

**App interno**: NÃO muda. Dashboard, sidebar, gestão (Epi, Mtr, Treinamentos, Usuários, Empresa, Perfil etc.) ficam exatamente como estão — são o "produto" no tema claro azul, e a memória do projeto exige preservá-los.

## Estratégia técnica

### 1. Extrair componentes compartilhados do novo visual
Mover do `LandingPage.tsx` para `src/components/landing/`:
- `EvitaLogo.tsx` — SVG do escudo esmeralda com folha/check e acento dourado
- `EvitaWordmark.tsx` — "Evita" display + "HSE" mono com ponto verde
- `BrowserFrame.tsx` — wrapper de mockups
- `AuthShell.tsx` (novo) — layout para páginas de auth: fundo `lp-bg` com `lp-grid-bg` + glow esmeralda sutil, card central glassmorphism com borda `lp-border`, logo+wordmark no topo, link "voltar para o início"

`LandingPage.tsx` passa a importar esses componentes (não muda visualmente).

### 2. Refatorar `src/components/landing/*` para o novo tema
Hoje `LandingLayout`, `LandingHero`, `FeatureSection`, `HowItWorks`, `LandingFAQ`, `LandingCTA` ainda usam gradientes azuis e cores hardcoded. Reescrever cada um para:
- Header e footer idênticos ao da `LandingPage` (nav fixa translúcida, EvitaLogo + EvitaWordmark, links Produto/Preços/FAQ/Login, CTA "Começar grátis" com glow esmeralda)
- `LandingHero` — fundo `lp-bg` com `lp-mesh-bg` + `lp-grid-bg`, breadcrumb em `lp-muted`, badge `lp-emerald/10` com borda esmeralda, headline `font-lp-display`, highlight em gradient esmeralda→dourado, CTAs estilo do hero principal
- `FeatureSection` / `HowItWorks` — cards `lp-card` com hover-glow, ícones em containers esmeralda, tipografia Inter Tight
- `LandingFAQ` — accordion com bordas `lp-border`, ícone "+/−" esmeralda, sem fundo azul
- `LandingCTA` — bloco final com gradient mesh esmeralda + dourado e botão glow

Isso atualiza todos os 10 `/funcionalidades/*Page.tsx` em cascata, sem precisar tocar em cada arquivo.

### 3. Reescrever `Funcionalidades.tsx`
Remover o hero `linear-gradient(#070D1A → #0D2451)` e os pontinhos azuis. Usar o novo header/footer + bento grid no estilo da LandingPage, agrupando por Segurança / Saúde / Meio Ambiente com cards `lp-card` clicáveis.

### 4. Migrar páginas de auth
Padrão único usando `<AuthShell>`:
- `Cadastro` — substitui logo escudo azul por `EvitaLogo` + `EvitaWordmark`, troca seções `DADOS DA EMPRESA` por headings `font-lp-display` com divisores esmeralda, inputs com borda `lp-border` + focus ring esmeralda, botão "Criar conta" com gradient esmeralda + glow (mantém toda a lógica de signUp/RPC/retry)
- `Login`, `ResetPassword`, `CompletarCadastro`, `Convite` — mesmo shell, mesma tipografia/inputs/CTA

### 5. Migrar `Planos.tsx` (público)
Usar o nav/footer novo. Reusar o bloco de pricing já desenhado na `LandingPage` (4 cards com toggle mensal/anual, Professional destacado com glow), expandindo apenas com a tabela comparativa que essa página tem hoje. Toda a lógica de Stripe/checkout permanece.

### 6. `FAQ.tsx`, `PortalFornecedor.tsx`, `NotFound.tsx`
- FAQ: nav + footer novos, accordion estilo `LandingFAQ` reformulado
- PortalFornecedor: header com `EvitaLogo`/`EvitaWordmark` e card central no padrão `AuthShell` (mantém token de fornecedor + upload + RLS)
- NotFound: fundo `lp-bg` + mensagem com tipografia display + CTA "voltar ao início"

## Detalhes técnicos

- **Sem mudança de tokens globais**: `src/index.css` e `tailwind.config.ts` já têm os tokens `lp-*` light. Reusar.
- **Sem mudança de dependências** (fontes já instaladas).
- **App interno fica isolado** — nenhum arquivo dentro de `src/pages/Dashboard|Epi(exceto landing)|Mtr|Treinamentos|Usuarios|Empresa|Perfil|Servicos|Inspecoes|Documentos|Licencas|Incidentes|Fornecedores|Revisoes|Aso|MtrAnalise|InspecaoDetalhe|EpiCatalogo|EpiEntregas|EpiEstoque|EpiFicha|EpiVisaoGeral|TreinamentosCargos|TreinamentosCatalogo|TreinamentosColaboradores|TreinamentosMatriz|TreinamentosVisaoGeral|InspecoesExecucoes|InspecoesModelos|FornecedorDocumentos` será alterado.
- **Zero `text-white`/`bg-[#xxxx]` em components** — só tokens semânticos `lp-*`.
- **SEO preservado**: `usePageTitle`, breadcrumbs e JSON-LD permanecem.

## Validação

Playwright em 1280×1800 capturando: `/`, `/cadastro`, `/login`, `/funcionalidades`, `/funcionalidades/epi`, `/funcionalidades/mtr`, `/precos`, `/faq`, `/portal-fornecedor/preview` (se aplicável) e `/404`. Confirmar visualmente: mesmo header com EvitaLogo+wordmark, mesmo footer, fundo claro `lp-bg`, nenhuma faixa azul escura, CTAs com glow esmeralda.

## Fora do escopo

- Conteúdo textual / copy
- Lógica de signUp, RPC, Stripe, RLS, edge functions
- Tema do app autenticado (sidebar, dashboards, tabelas de gestão)
- Adicionar/remover rotas
