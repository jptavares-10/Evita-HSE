# Cards mais ousados, alegres e sem ícones

Mantém a estética clara aprovada (Emerald Prestige) e reformula todos os cards da landing page: hierarquia tipográfica no lugar dos ícones, motion mais expressivo e disposições menos monótonas.

## 1. Zero ícones e zero emojis nos cards

- Remover todos os ícones decorativos dos cards: `AlertTriangle`, `FileText`, `Clock` (dor → solução), `Fingerprint`, `Lock`, `ShieldCheck`, `ServerCog` (segurança), `TrendingUp`, `GraduationCap`, `Truck`, `Users` (bento de módulos), `Check` das listas e `Plus` do FAQ.
- No lugar de cada ícone entra um elemento tipográfico: numeral grande em display ("01 / 02 / 03"), etiqueta curta em caixa alta com tracking largo, ou marcador de régua/traço em esmeralda.
- Listas com check viram itens com traço vertical esmeralda + texto.
- FAQ passa a usar um sinal tipográfico ("+" / "−" em texto) que rotaciona ao abrir.
- Setas de navegação (botões de CTA e links "explorar") passam a usar a glifo "→" em texto, sem componente de ícone.

## 2. Títulos e subtítulos melhores

Cada card ganha três camadas claras: etiqueta curta, título afirmativo e subtítulo que entrega o benefício concreto. Exemplos da nova copy:

- Dor 1 — Etiqueta "Prazos" · "O fiscal não avisa. O Evita avisa." · subtítulo com os prazos cobertos (NR, ASO, licença, CA, CDF) e responsável nomeado.
- Dor 2 — "Sua evidência não mora no WhatsApp." · anexo no registro certo, histórico imutável, download em segundos.
- Dor 3 — "Auditoria em minutos, não em três dias." · filtro por área, cargo e unidade com exportação pronta.
- Segurança — "Cada empresa em sua própria fronteira", "Documento fechado, acesso por hora", "Toda alteração tem autor e data", "Quem registra, quem audita".
- Módulos — títulos mais diretos ("Um painel, a verdade inteira", "NR em conformidade sem lembrete manual", "CDF no prazo, sempre", "O fim do documento por WhatsApp"), cada um com subtítulo de resultado.

## 3. Disposição por seção (menos grade repetida)

- **Dor → solução**: passa de 3 colunas iguais para uma escada assimétrica — primeiro card mais alto e destacado, os outros dois deslocados verticalmente, com numeração grande no fundo do card.
- **Bento de módulos**: grade de 6 colunas com alturas variadas (card largo do dashboard, dois cards médios, card do portal em faixa), em vez de blocos de mesma altura.
- **Pilares de segurança**: cards estreitos com numeral gigante translúcido ao fundo e borda em gradiente esmeralda→dourado.
- **Depoimentos**: cards levemente rotacionados em repouso, alinhando ao passar o mouse.
- **Preços**: card do plano recomendado elevado e com escala maior, selo em gradiente.

## 4. Motion mais ousado

- Entrada em cascata com deslocamento e blur por card (stagger maior que o atual).
- Hover: leve levantamento com tilt 3D suave, spotlight seguindo o mouse (já existe, aplicado a todos os cards), brilho na borda em gradiente e numeral que ganha opacidade.
- Números e KPIs animam com contagem ao entrar na viewport.
- Tabs de módulos com transição de troca (fade + slide) no painel do mockup.
- Todo o motion respeita `prefers-reduced-motion`.

## Detalhes técnicos

- Arquivos: `src/pages/LandingPage.tsx` (dor, bento, módulos, depoimentos, segurança, preços, FAQ), `src/components/landing/FeatureSection.tsx`, `HowItWorks.tsx`, `LandingFAQ.tsx`, `LandingCTA.tsx`, `LandingHero.tsx`.
- Novos utilitários de card em `src/index.css` (ex.: `lp-card-bold`, `lp-numeral`, `lp-tilt-soft`) e keyframes/stagger em `tailwind.config.ts`, sempre com tokens `--lp-*` — nenhuma cor fixa.
- Reutiliza `Reveal`, `useSpotlight`, `useCountUp`; nenhuma mudança de rota, dados ou backend.
- Ícones permanecem apenas no header/menu mobile (Menu/X/Home), fora do escopo dos cards.
