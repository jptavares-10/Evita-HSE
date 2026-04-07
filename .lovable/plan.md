

## Plano: Paginas publicas de SEO por modulo

### Escopo

Criar **11 paginas publicas indexaveis** — 1 pagina central `/funcionalidades` + 10 landing pages por modulo — todas vinculadas a landing page principal e seguindo o mesmo design (navbar, footer, Reveal animations, cores, tipografia).

### Paginas a criar

| Rota | Modulo | Keywords-alvo |
|------|--------|---------------|
| `/funcionalidades` | Hub central | software gestao SST, plataforma HSE |
| `/funcionalidades/servicos-periodicos` | Servicos Periodicos | controle extintores, servicos recorrentes SST |
| `/funcionalidades/inspecoes` | Inspecoes | inspecao seguranca trabalho, checklist NR |
| `/funcionalidades/incidentes` | IC & NC | registro incidentes trabalho, nao conformidade SST |
| `/funcionalidades/epi` | EPIs | controle EPI, gestao equipamento protecao individual |
| `/funcionalidades/documentos` | Biblioteca Documentos | gestao documentos SST, controle PGR PCMSO |
| `/funcionalidades/treinamentos` | Treinamentos | controle treinamentos NR, matriz treinamento |
| `/funcionalidades/aso` | ASO / Exames | controle ASO, gestao exames ocupacionais |
| `/funcionalidades/mtr` | Gestao MTR | controle MTR residuos, gestao CDF |
| `/funcionalidades/licencas` | Licencas Ambientais | controle licenca ambiental, gestao LO LI |
| `/funcionalidades/fornecedores` | Portal Fornecedores | portal fornecedor documentos, gestao fornecedores SST |

### Arquitetura

**1. Layout compartilhado** — `src/components/landing/LandingLayout.tsx`
- Extrai navbar e footer da LandingPage atual para componente reutilizavel
- Recebe `children` e renderiza navbar + main + footer
- Reutiliza o hook `useReveal` e componente `Reveal`

**2. Pagina hub** — `src/pages/Funcionalidades.tsx`
- Hero compacto com h1 "Todos os modulos do Evita HSE"
- Grid dos 10 modulos como cards clicaveis (Link para cada sub-pagina)
- Agrupados por categoria (Seguranca, Saude, Meio Ambiente)
- CTA final "Comece gratis"

**3. Pagina por modulo** — `src/pages/funcionalidades/[Modulo].tsx` (10 arquivos)
Cada pagina segue estrutura identica:
- **Hero** com icone, h1 do modulo, descricao rica com keywords, CTA
- **Secao "Funcionalidades"** — 4-6 cards com as funcionalidades reais do modulo (baseadas nos componentes existentes)
- **Secao "Como funciona"** — 3 passos especificos do modulo
- **Secao "Perguntas frequentes"** — 3-4 FAQs especificas + JSON-LD FAQPage
- **CTA final** — mesmo estilo da landing principal
- `usePageTitle` com title e description otimizados para SEO

**4. Alteracoes na LandingPage principal**
- Cards de modulos na secao "Modulos" viram links para `/funcionalidades/[slug]`
- Footer ganha coluna "Funcionalidades" com links para as sub-paginas
- Navbar ganha link "Funcionalidades" apontando para `/funcionalidades`

**5. Rotas** — `src/App.tsx`
- Adicionar rotas publicas com `<LandingRoute>` para todas as 11 paginas

**6. SEO**
- Atualizar `public/sitemap.xml` com as 11 novas URLs
- Atualizar `public/robots.txt` — permitir todas as rotas `/funcionalidades/*`
- Cada pagina injeta JSON-LD `FAQPage` e define canonical + description via `usePageTitle`

### Estrutura de arquivos

```text
src/
├── components/landing/
│   ├── LandingLayout.tsx       (navbar + footer compartilhados)
│   ├── LandingHero.tsx         (hero reutilizavel para sub-paginas)
│   ├── LandingCTA.tsx          (CTA final reutilizavel)
│   └── LandingFAQ.tsx          (secao FAQ reutilizavel com JSON-LD)
├── pages/
│   ├── Funcionalidades.tsx     (hub central)
│   ├── funcionalidades/
│   │   ├── ServicosPage.tsx
│   │   ├── InspecoesPage.tsx
│   │   ├── IncidentesPage.tsx
│   │   ├── EpiPage.tsx
│   │   ├── DocumentosPage.tsx
│   │   ├── TreinamentosPage.tsx
│   │   ├── AsoPage.tsx
│   │   ├── MtrPage.tsx
│   │   ├── LicencasPage.tsx
│   │   └── FornecedoresPage.tsx
│   └── LandingPage.tsx         (editado — links nos cards + footer)
├── App.tsx                     (11 novas rotas)
public/
├── sitemap.xml                 (atualizado)
└── robots.txt                  (atualizado)
```

### Conteudo das paginas por modulo

O conteudo sera baseado nos dados ja existentes em `moduleGroups` na LandingPage e nas funcionalidades reais dos componentes do sistema (drawers, filtros, KPIs). Exemplo para EPI:
- h1: "Gestao de EPIs — Controle de Equipamentos de Protecao Individual"
- Features: Catalogo com CA, Controle de estoque, Entregas por colaborador, Ficha de EPI, Alertas de vencimento CA
- FAQs: "O que e CA?", "Como controlar estoque de EPI?", "Como registrar entrega de EPI?"

### Vinculacao com landing principal

- Navbar: link "Funcionalidades" visivel em desktop e mobile
- Secao Modulos: cada card de modulo tem link "Saiba mais" para a sub-pagina
- Footer: nova coluna "Funcionalidades" com os 10 links
- Breadcrumb em cada sub-pagina: Inicio > Funcionalidades > [Modulo]

