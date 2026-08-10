# Reformulação da Landing Page — Dark + Gold Trust

Nova identidade pública: fundo preto profundo, esmeralda como cor de ação e dourado como cor de autoridade/confiança. Motion cinematográfico (parallax, contadores, mockups em 3D, spotlight de mouse, gradientes animados). Copy de venda mais forte e remoção total dos rótulos de seção.

## Identidade visual (público)

Novos tokens `--lp-*` em `src/index.css`:

- Fundo `#080B0A`, superfície `#12201B`, esmeralda `#0FA271`, dourado `#D4A72C`
- Texto claro sobre escuro, bordas sutis com brilho, `lp-card` em modo vidro escuro
- Utilitários novos: aurora/mesh animada, ruído (grain), spotlight radial, borda com gradiente, glow dourado
- O app autenticado continua no tema claro atual nesta etapa (os tokens do shadcn são desacoplados dos `--lp-*` para não vazar mudança para dentro do sistema). Quando você aprovar, aplico o mesmo padrão no software depois.

## Remoções pedidas (imagens 1–3)

- Todos os "kickers" / rótulos de seção em caixa alta com tracking: PRODUTO, MÓDULOS INTEGRADOS, QUEM USA, PREÇOS, FUNCIONALIDADES, COMO FUNCIONA, "Usado por equipes HSE em", "* Baseado em perfis reais..."
- A pílula de anúncio "Novo: módulo de inspeções V2" no topo do hero
- As hierarquias passam a ser carregadas apenas pelo H2 e pelo subtítulo, sem etiqueta acima

## Copy de venda

- Hero reescrito com promessa e risco: dor da autuação/multa e do vencimento perdido, prova de segurança de dados
- Nova seção de dor → solução ("antes / depois") substituindo o rótulo removido de Produto
- Bloco de confiança/segurança: isolamento por empresa (RLS), arquivos privados com link temporário, trilha de auditoria, permissões por módulo — com selo dourado
- Blocos de objeção: migração de planilhas, tempo de implantação, o que acontece ao fim do trial
- CTAs mais diretos em cada dobra + CTA final com garantia (14 dias, sem cartão)
- Depoimentos com resultado quantificado e nota de que são perfis representativos

## Motion cinematográfico

- Parallax por scroll no hero e nos mockups (translate/rotate leve, com `prefers-reduced-motion` respeitado)
- Spotlight que segue o mouse nos cards e no hero
- Contadores animados nas estatísticas quando entram na viewport
- Mockups com perspectiva 3D e brilho que percorre a borda
- Reveal escalonado por seção, marquee de segmentos mantido mas sem rótulo
- Barra de progresso de leitura no header e header que muda de densidade ao rolar

## Páginas públicas no novo padrão

- `SiteHeader`, `LandingLayout` (footer), `LandingHero`, `FeatureSection`, `HowItWorks`, `LandingCTA`, `LandingFAQ`
- `Funcionalidades`, as 10 páginas de módulo, `FAQ`, `Blog`, `BlogPost`, `Seguranca`
- `AuthShell` (login/cadastro) alinhado ao novo visual escuro
- Todos os kickers dessas páginas removidos junto

## Detalhes técnicos

- Tokens em HSL em `src/index.css`, expostos no `tailwind.config.ts` (paleta `lp.*` + `lp.gold`)
- Nenhuma cor hardcoded em componentes; tudo por token
- Novos hooks utilitários: `useParallax`, `useCountUp`, `useSpotlight` em `src/hooks/`
- `Reveal` existente estendido com variantes (blur, scale, direção)
- Zero mudança em lógica de negócio, queries, RLS ou rotas — apenas apresentação
- Contraste AA verificado no tema escuro; foco visível preservado; JSON-LD e metadados de SEO mantidos
