

## Plano: SEO de alto nivel para Evita HSE

### Problema atual
O site e uma SPA React sem pre-renderizacao. O Google consegue indexar SPAs modernas, mas o SEO atual e basico: apenas meta tags estaticas no `index.html`, sem sitemap, sem canonical, sem dados estruturados, sem semantica HTML adequada.

### O que sera implementado

**1. Sitemap XML estatico** (`public/sitemap.xml`)
- URLs publicas: `/`, `/login`, `/cadastro`
- URL base: `https://evita-hse-br.lovable.app`
- Referenciado no `robots.txt`

**2. robots.txt atualizado**
- Adicionar `Sitemap: https://evita-hse-br.lovable.app/sitemap.xml`
- Bloquear rotas internas (`/dashboard`, `/servicos`, `/epi`, etc.) com `Disallow`

**3. index.html — meta tags otimizadas**
- Tag canonical: `<link rel="canonical" href="https://evita-hse-br.lovable.app/">`
- `og:url` definido
- Description reescrita com palavras-chave do segmento: "software de gestão de SST", "segurança do trabalho", "meio ambiente", "NR", "gestão de EPI", "treinamentos NR", "MTR"
- Title otimizado para busca: "Evita HSE — Software de Gestão de Segurança do Trabalho, Saúde e Meio Ambiente"
- `twitter:site` corrigido (remover @Lovable)
- Preconnect para fontes externas (se houver)

**4. JSON-LD (Dados Estruturados)** — script no `index.html`
- Schema `SoftwareApplication` com nome, descricao, categoria, sistema operacional (web), oferta com preco inicial
- Schema `Organization` com nome, URL, logo, contato
- Schema `FAQPage` injetado dinamicamente na LandingPage para as perguntas frequentes

**5. Semantica HTML na LandingPage**
- Substituir `<section>` por tags semanticas onde apropriado (`<main>`, `<article>`, `<footer>` ja existe)
- Garantir um unico `<h1>` na hero (ja existe)
- Adicionar `alt` descritivo em imagens/icones decorativos
- FAQ usando `<details>`/`<summary>` nativo para acessibilidade e crawlability (ou manter visual atual + JSON-LD)

**6. Meta tags dinamicas por pagina**
- Atualizar `usePageTitle` para tambem definir `<meta name="description">` e `<link rel="canonical">` dinamicamente
- LandingPage define description rica com keywords do segmento
- Paginas internas (protegidas) nao precisam de SEO, mas terao title correto

**7. Performance (Core Web Vitals)**
- Adicionar `<link rel="preload">` para fonte principal se custom font for usada
- Garantir que imagens grandes tenham `loading="lazy"`
- Favicon ja e SVG (bom)

### Detalhes tecnicos

```text
Arquivos modificados:
├── index.html              — meta tags, canonical, JSON-LD, preconnect
├── public/robots.txt       — sitemap ref + disallow rotas internas
├── public/sitemap.xml      — novo arquivo
├── src/hooks/usePageTitle.ts — expandir para description + canonical
├── src/pages/LandingPage.tsx — JSON-LD FAQPage, semantica, alt texts
```

Keywords-alvo para as meta tags (baseadas no segmento HSE brasileiro):
- "software gestao SST"
- "gestao de seguranca do trabalho"
- "controle de EPI"
- "gestao de treinamentos NR"
- "MTR residuos"
- "licenca ambiental controle"
- "plataforma HSE Brasil"
- "gestao saude seguranca meio ambiente"

