import { Link } from "react-router-dom";
import { ChevronDown, Check, Menu, X, ArrowUpRight, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";

/* ── DATA ─────────────────────────────────────── */

const trustSegments = [
  "Construção Civil",
  "Indústria",
  "Facilities",
  "Mineração",
  "Óleo & Gás",
  "Meio Ambiente",
  "Logística",
  "Energia",
];

const painPoints = [
  { stat: "0", suffix: "%", label: "Prazos perdidos com alertas automáticos antes do vencimento." },
  { stat: "10", suffix: "+", label: "Módulos integrados em uma única fonte de verdade operacional." },
  { stat: "14", suffix: " dias", label: "De trial completo, sem cartão e sem consultoria técnica." },
];

const steps = [
  { num: "01", title: "Cadastre sua empresa", desc: "Crie sua conta em menos de 2 minutos. Sem configuração técnica. Sem cartão de crédito." },
  { num: "02", title: "Configure seus módulos", desc: "Adicione colaboradores, treinamentos, serviços e documentos. Sem consultoria." },
  { num: "03", title: "Monitore sem perder prazos", desc: "O dashboard centraliza tudo. Alertas visuais mostram o que precisa de atenção." },
];

type ModuleItem = { name: string; desc: string; slug: string };
const moduleGroups: Record<string, ModuleItem[]> = {
  "Segurança": [
    { name: "Serviços Periódicos", desc: "Extintores, dedetização e qualquer serviço recorrente com alertas configuráveis.", slug: "servicos-periodicos" },
    { name: "Inspeções", desc: "Modelos com frequência automática, registros fotográficos e ações corretivas rastreáveis.", slug: "inspecoes" },
    { name: "IC & NC", desc: "Registre incidentes e não conformidades com plano de ação e evidências.", slug: "incidentes" },
    { name: "EPIs", desc: "Catálogo com CA, controle de estoque, entregas e vencimento de certificado.", slug: "epi" },
    { name: "Biblioteca de Documentos", desc: "PGR, PCMSO, procedimentos e políticas com ciclo de revisão automático.", slug: "documentos" },
  ],
  "Saúde": [
    { name: "Treinamentos", desc: "Matriz por cargo, certificados com validade e conformidade NR em tempo real.", slug: "treinamentos" },
    { name: "ASO / Exames", desc: "Admissionais, periódicos e demissionais com alerta de vencimento e histórico.", slug: "aso" },
  ],
  "Meio Ambiente": [
    { name: "Gestão de MTR", desc: "Prazo de CDF monitorado e gráficos de geração mensal por categoria.", slug: "mtr" },
    { name: "Licenças Ambientais", desc: "LO, LI, outorgas e autorizações com histórico de renovações e alertas.", slug: "licencas" },
    { name: "Portal de Fornecedores", desc: "Link único para envio de documentos. Sem WhatsApp, sem e-mail.", slug: "fornecedores" },
  ],
};

const groupTabs = ["Segurança", "Saúde", "Meio Ambiente"] as const;

const testimonials = [
  { initials: "MS", name: "Marco S.", role: "Técnico de Segurança — Indústria", text: "Antes eu controlava tudo em planilha. Sempre descobria o vencimento na hora errada. Agora o sistema me avisa com antecedência e tenho histórico de tudo." },
  { initials: "AT", name: "Ana T.", role: "Engenheira Ambiental — Construção", text: "O módulo de MTR me economiza horas por mês. Prazo de CDF nunca mais passou em branco. E o gráfico de resíduos é exatamente o que precisava." },
  { initials: "RL", name: "Rafael L.", role: "Gerente de HSE — Facilities", text: "O portal de fornecedores foi o que mais me surpreendeu. Acabou o WhatsApp de documento. Cada fornecedor tem o próprio link." },
];

const pricingPlans = [
  {
    key: "starter",
    label: "Starter",
    subtitle: "Para empresas em crescimento",
    priceMonthly: "R$ 97",
    priceAnnual: "R$ 970",
    savingsAnnual: "Economize R$ 194",
    features: ["Serviços Periódicos", "Treinamentos completo", "IC & NC", "ASO", "Até 5 usuários", "5GB de storage", "Suporte por e-mail"],
    featured: false,
  },
  {
    key: "professional",
    label: "Professional",
    badge: "Mais escolhido",
    subtitle: "Para equipes HSE completas",
    priceMonthly: "R$ 247",
    priceAnnual: "R$ 2.470",
    savingsAnnual: "Economize R$ 494",
    features: ["Tudo do Starter", "Gestão de MTR", "Licenças Ambientais", "Portal de Fornecedores", "Biblioteca de Documentos", "Inspeções de Segurança", "Gestão de EPIs", "Permissões por módulo", "Até 10 usuários", "20GB de storage", "Suporte SLA 48h"],
    featured: true,
  },
  {
    key: "enterprise",
    label: "Enterprise",
    subtitle: "Para grandes operações",
    priceMonthly: "R$ 497",
    priceAnnual: "R$ 4.970",
    savingsAnnual: "Economize R$ 994",
    features: ["Tudo do Professional", "Usuários ilimitados", "100GB de storage", "Múltiplas unidades (em breve)", "Suporte SLA 24h", "Onboarding assistido"],
    featured: false,
  },
];

const faqs = [
  { q: "Preciso instalar algum programa?", a: "Não. O Evita HSE é 100% na nuvem. Funciona em qualquer navegador, em computador ou celular." },
  { q: "Meus dados ficam seguros?", a: "Sim. Cada empresa tem seus dados isolados por Row Level Security. Documentos são armazenados em buckets privados com URLs temporárias." },
  { q: "Como controlar a segurança do trabalho na minha empresa?", a: "Com o Evita HSE você centraliza tudo: treinamentos NR, EPIs, inspeções, documentos e incidentes em um único software. Alertas automáticos garantem que nada vença sem você saber." },
  { q: "O que acontece quando o trial acaba?", a: "Seu acesso entra em modo leitura. Seus dados ficam preservados enquanto você decide sobre o plano." },
  { q: "Como funciona o portal de fornecedores?", a: "Você gera um link único. O fornecedor acessa sem criar conta e envia documentos organizados em pastas." },
  { q: "Funciona para qualquer segmento?", a: "Sim. Construção civil, indústria, facilities, mineração, saúde, logística e mais." },
];

/* ── SCROLL REVEAL HOOK ─────────────────────────── */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    className: visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-6 blur-[6px]",
    style: { transition: "opacity 0.9s ease, transform 0.9s ease, filter 0.9s ease" },
  };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const r = useReveal();
  return (
    <div ref={r.ref} className={`${r.className} ${className}`} style={{ ...r.style, transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/* ── COUNT-UP ─────────────────────────────────── */
function CountUp({ to, duration = 1400 }: { to: number; duration?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(to * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{n}</span>;
}

/* ── COMPONENT ──────────────────────────────────── */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<typeof groupTabs[number]>("Segurança");
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  usePageTitle("Evita HSE — Software de Gestão de Segurança do Trabalho, Saúde e Meio Ambiente", {
    description: "Software completo de gestão de SST e meio ambiente para empresas brasileiras. Controle treinamentos NR, EPIs, inspeções, MTR, licenças ambientais, ASO, documentos e fornecedores em uma única plataforma online. Alertas automáticos de vencimento. Teste grátis por 14 dias.",
  });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Inject FAQ JSON-LD
  useEffect(() => {
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((f) => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld";
    script.textContent = JSON.stringify(faqJsonLd);
    document.head.appendChild(script);
    return () => { document.getElementById("faq-jsonld")?.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-lp-bg text-lp-ink font-lp-sans selection:bg-lp-ink selection:text-lp-cream antialiased">
      <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-lp-ink focus:text-lp-cream focus:px-4 focus:py-2">Pular para o conteúdo</a>

      {/* ── NAVBAR ─────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 lg:px-10 py-5 flex justify-between items-center mix-blend-difference">
        <Link to="/" className="font-lp-display text-2xl font-semibold text-white tracking-tight">
          evita<span className="italic font-light">hse</span>
        </Link>
        <div className="hidden md:flex gap-8 text-[11px] font-medium text-white/85 uppercase tracking-[0.2em]">
          <a href="#modulos" className="hover:opacity-60 transition-opacity">Módulos</a>
          <a href="#como-funciona" className="hover:opacity-60 transition-opacity">Metodologia</a>
          <a href="#precos" className="hover:opacity-60 transition-opacity">Preços</a>
          <a href="#faq" className="hover:opacity-60 transition-opacity">FAQ</a>
          <Link to="/funcionalidades" className="hover:opacity-60 transition-opacity">Funcionalidades</Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white border border-white/30 hover:bg-white hover:text-black transition-all duration-500">
            Entrar
          </Link>
          <Link to="/cadastro" className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all duration-500">
            Teste grátis
          </Link>
        </div>
        <button className="md:hidden p-2 text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-16 inset-x-0 z-40 bg-lp-ink text-lp-cream px-6 py-6 space-y-4 md:hidden">
          <a href="#modulos" className="block text-sm uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Módulos</a>
          <a href="#como-funciona" className="block text-sm uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Metodologia</a>
          <a href="#precos" className="block text-sm uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Preços</a>
          <a href="#faq" className="block text-sm uppercase tracking-widest" onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link to="/funcionalidades" className="block text-sm uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Funcionalidades</Link>
          <div className="flex gap-3 pt-4">
            <Link to="/login" className="flex-1 text-center py-3 border border-lp-cream/30 text-xs uppercase tracking-widest">Entrar</Link>
            <Link to="/cadastro" className="flex-1 text-center py-3 bg-lp-cream text-lp-ink text-xs uppercase tracking-widest">Teste grátis</Link>
          </div>
        </div>
      )}

      <main id="conteudo-principal">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-24 pt-32 pb-20 overflow-hidden">
        {/* Parallax emerald blob */}
        <div
          aria-hidden
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[55%] h-[80%] rounded-l-full -z-10 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(var(--lp-emerald-deep)/0.18) 0%, transparent 70%)",
            transform: `translate(0, calc(-50% + ${scrollY * 0.12}px))`,
          }}
        />
        {/* Hairline ornament */}
        <div aria-hidden className="absolute top-32 left-6 lg:left-24 flex items-center gap-4">
          <span className="font-lp-mono text-[10px] uppercase tracking-[0.3em] text-lp-ink/40">N°01 — 2026</span>
          <span className="w-12 h-px bg-lp-ink/20" />
          <span className="font-lp-mono text-[10px] uppercase tracking-[0.3em] text-lp-ink/40">Edição Anual</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-end relative z-10">
          <div className="lg:col-span-8">
            <span className="inline-block mb-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-lp-emerald-deep">
              · Gestão HSE Inteligente
            </span>
            <h1 className="font-lp-display text-5xl md:text-7xl lg:text-[7.5rem] font-light leading-[0.92] tracking-tight mb-8 text-lp-ink">
              Segurança que{" "}
              <span className="italic text-lp-emerald-deep">respira</span>{" "}
              <br className="hidden md:block" />
              tecnologia.
            </h1>
          </div>
          <div className="lg:col-span-4 pb-2">
            <p className="text-lg text-lp-ink/75 leading-relaxed mb-10 max-w-sm">
              Centralize Saúde, Segurança e Meio Ambiente em uma plataforma editorialmente intuitiva e tecnicamente rigorosa. Alertas automáticos para nunca mais perder um prazo de fiscalização.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/cadastro"
                className="group relative px-8 py-4 bg-lp-ink text-lp-cream text-[11px] font-bold uppercase tracking-[0.25em] overflow-hidden inline-flex items-center justify-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Teste grátis
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="absolute inset-0 bg-lp-emerald-deep translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
              <a
                href="#como-funciona"
                className="px-8 py-4 border border-lp-ink text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-lp-ink hover:text-lp-cream transition-colors duration-500 inline-flex items-center justify-center"
              >
                Ver demonstração
              </a>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-6 lg:left-24 flex items-center gap-4">
          <span className="w-12 h-px bg-lp-ink/30" />
          <span className="font-lp-mono text-[10px] uppercase tracking-[0.3em] text-lp-ink/40 italic">role para explorar</span>
        </div>
      </section>

      {/* ── TRUST STRIP (marquee) ─────────────── */}
      <section className="py-10 border-y border-lp-ink/10 overflow-hidden bg-lp-bg">
        <div className="container mx-auto px-6 mb-6">
          <p className="text-center text-[10px] uppercase tracking-[0.4em] font-bold text-lp-ink/40">
            Empresas e operações que confiam na Evita
          </p>
        </div>
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-lp-marquee gap-16 px-8 opacity-50">
            {[...trustSegments, ...trustSegments].map((s, i) => (
              <span
                key={i}
                className={`font-lp-display text-2xl tracking-tight whitespace-nowrap ${i % 2 === 0 ? "italic font-light" : "font-normal"}`}
              >
                {s}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 animate-lp-marquee gap-16 px-8 opacity-50" aria-hidden>
            {[...trustSegments, ...trustSegments].map((s, i) => (
              <span
                key={i}
                className={`font-lp-display text-2xl tracking-tight whitespace-nowrap ${i % 2 === 0 ? "italic font-light" : "font-normal"}`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMA ─────────────────────────── */}
      <section id="problema" className="py-32 bg-lp-ink text-lp-cream">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Reveal>
            <span className="block text-[11px] uppercase tracking-[0.4em] font-semibold text-lp-gold mb-8">— Capítulo I · O problema</span>
            <h2 className="font-lp-display text-4xl md:text-6xl font-light leading-[1.05] mb-12 text-balance">
              Planilhas isoladas são o{" "}
              <span className="italic text-lp-cream/60">ponto cego</span>{" "}
              da sua conformidade.
            </h2>
            <p className="text-lg text-lp-cream/70 leading-relaxed max-w-2xl mx-auto mb-20">
              Dados fragmentados geram riscos invisíveis. A Evita unifica cada métrica HSE em um ecossistema visual que <span className="italic">previne antes de remediar</span>.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-px bg-lp-cream/10">
            {painPoints.map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="p-12 bg-lp-ink h-full flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="font-lp-display text-6xl font-light mb-4 flex items-baseline">
                    <CountUp to={parseInt(p.stat)} />
                    <span className="text-lp-gold">{p.suffix}</span>
                  </div>
                  <p className="text-sm text-lp-cream/55 leading-relaxed max-w-[260px]">{p.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ─────────────────────────── */}
      <section id="modulos" className="py-32 px-6 lg:px-24 bg-lp-bg">
        <Reveal>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
            <div>
              <span className="block text-[11px] uppercase tracking-[0.4em] font-semibold text-lp-emerald-deep mb-6">— Capítulo II · Ecossistema</span>
              <h2 className="font-lp-display text-5xl md:text-6xl font-light leading-tight max-w-2xl">
                Dez módulos. <span className="italic">Três pilares.</span> Uma única fonte de verdade.
              </h2>
            </div>
            <p className="max-w-md text-lp-ink/60 text-base leading-relaxed">
              Projetados para cobrir cada detalhe da sua operação HSE — do extintor vencido à licença ambiental anual.
            </p>
          </div>
        </Reveal>

        {/* Tabs */}
        <div className="flex flex-wrap gap-0 border-b border-lp-ink/15 mb-12">
          {groupTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveGroup(tab)}
              className={`relative px-6 py-4 text-[11px] uppercase tracking-[0.25em] font-bold transition-colors ${
                activeGroup === tab ? "text-lp-ink" : "text-lp-ink/40 hover:text-lp-ink/70"
              }`}
            >
              <span className="font-lp-mono mr-2">0{groupTabs.indexOf(tab) + 1}</span>
              {tab}
              {activeGroup === tab && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-lp-emerald-deep" />
              )}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(moduleGroups[activeGroup] || []).map((m, i) => (
            <Link
              key={m.slug}
              to={`/funcionalidades/${m.slug}`}
              className="group relative p-8 border border-lp-ink/10 hover:bg-lp-ink hover:text-lp-cream transition-all duration-500 cursor-pointer flex flex-col animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="font-lp-mono text-[10px] tracking-[0.3em] opacity-30 group-hover:opacity-60 transition-opacity">
                0{i + 1}
              </span>
              <h3 className="font-lp-display text-2xl font-normal mt-10 mb-4">{m.name}</h3>
              <p className="text-sm opacity-60 mb-12 leading-relaxed flex-1">{m.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold opacity-60">Saiba mais</span>
                <ArrowUpRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="absolute bottom-0 left-0 h-px w-0 bg-lp-gold group-hover:w-full transition-all duration-700" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────── */}
      <section id="como-funciona" className="py-32 bg-lp-sand">
        <div className="container mx-auto px-6 lg:px-24">
          <Reveal>
            <span className="block text-[11px] uppercase tracking-[0.4em] font-semibold text-lp-emerald-deep mb-6">— Capítulo III · Metodologia</span>
            <h2 className="font-lp-display text-5xl md:text-6xl font-light mb-20 max-w-3xl">
              Simplicidade em <span className="italic">cada etapa</span>.
            </h2>
          </Reveal>
          <div className="max-w-4xl space-y-20">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.1}>
                <div
                  className="flex flex-col md:flex-row gap-8 md:gap-16 items-start border-t border-lp-ink/15 pt-10"
                  style={{ marginLeft: `${i * 48}px` }}
                >
                  <div className="font-lp-display text-5xl font-light italic text-lp-emerald-deep w-24 shrink-0">
                    {s.num}.
                  </div>
                  <div>
                    <h3 className="font-lp-display text-3xl font-normal mb-4">{s.title}</h3>
                    <p className="text-lg text-lp-ink/60 leading-relaxed max-w-xl">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ─────────────────────────── */}
      <section className="py-32 px-6 lg:px-24 bg-lp-bg">
        <Reveal>
          <span className="block text-[11px] uppercase tracking-[0.4em] font-semibold text-lp-emerald-deep mb-6">— Capítulo IV · Vozes do campo</span>
        </Reveal>
        <div className="space-y-24 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.05}>
              <div className={`border-l-2 border-lp-emerald-deep pl-8 md:pl-16 max-w-5xl ${i % 2 === 1 ? "md:ml-auto" : ""}`}>
                <p className="font-lp-display text-3xl md:text-5xl font-light italic leading-[1.15] mb-10 text-lp-ink/90">
                  <span className="text-lp-gold not-italic mr-2">“</span>
                  {t.text}
                  <span className="text-lp-gold not-italic ml-1">”</span>
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-lp-ink text-lp-cream flex items-center justify-center text-xs font-bold font-lp-mono">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-[0.2em] text-xs">{t.name}</p>
                    <p className="text-xs text-lp-ink/50 mt-1">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-lp-ink/40 mt-16">
          * Baseado em perfis reais de profissionais da área de HSE.
        </p>
      </section>

      {/* ── PREÇOS ─────────────────────────────── */}
      <section id="precos" className="py-32 px-6 lg:px-24 bg-lp-cream">
        <Reveal>
          <div className="text-center mb-16">
            <span className="block text-[11px] uppercase tracking-[0.4em] font-semibold text-lp-emerald-deep mb-6">— Capítulo V · Investimento</span>
            <h2 className="font-lp-display text-5xl md:text-6xl font-light mb-6">
              Estratégico, <span className="italic">não burocrático</span>.
            </h2>
            <p className="text-lp-ink/60 text-base max-w-xl mx-auto">
              Comece grátis. Faça upgrade quando precisar. Cancele quando quiser.
            </p>
          </div>
        </Reveal>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <span className={`text-[11px] uppercase tracking-[0.25em] font-bold transition-colors ${!billingAnnual ? "text-lp-ink" : "text-lp-ink/40"}`}>
            Mensal
          </span>
          <button
            onClick={() => setBillingAnnual(!billingAnnual)}
            className={`relative w-14 h-7 rounded-full transition-colors border ${billingAnnual ? "bg-lp-emerald-deep border-lp-emerald-deep" : "bg-lp-bg border-lp-ink/20"}`}
            aria-label="Alternar entre mensal e anual"
          >
            <span className={`absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-lp-cream rounded-full transition-transform ${billingAnnual ? "translate-x-7" : "translate-x-0"}`} />
          </button>
          <span className={`text-[11px] uppercase tracking-[0.25em] font-bold flex items-center gap-3 transition-colors ${billingAnnual ? "text-lp-ink" : "text-lp-ink/40"}`}>
            Anual
            {billingAnnual && (
              <span className="bg-lp-emerald-deep text-lp-cream text-[9px] tracking-widest font-bold px-2.5 py-1">2 MESES GRÁTIS</span>
            )}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan, i) => {
            const monthlyNum = parseInt(plan.priceMonthly.replace(/\D/g, ""));
            const annualNum = parseInt(plan.priceAnnual.replace(/\D/g, ""));
            const equivMonthly = Math.round(annualNum / 12);
            const featured = plan.featured;
            return (
              <Reveal key={plan.key} delay={i * 0.1}>
                <div className={`relative p-10 flex flex-col h-full transition-all ${
                  featured
                    ? "bg-lp-ink text-lp-cream md:-translate-y-6 shadow-[0_20px_60px_-15px_rgba(12,31,21,0.4)]"
                    : "bg-lp-bg border border-lp-ink/10"
                }`}>
                  {featured && (
                    <span className="absolute top-0 left-0 right-0 -translate-y-1/2 mx-auto w-max bg-lp-gold text-lp-ink text-[9px] font-bold uppercase tracking-[0.3em] px-4 py-2">
                      {plan.badge}
                    </span>
                  )}
                  {/* Gold outline accent for featured */}
                  {featured && <div className="absolute inset-0 border border-lp-gold/40 pointer-events-none" />}

                  <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-8 ${featured ? "text-lp-gold" : "text-lp-ink/40"}`}>
                    {plan.label}
                  </p>
                  <p className={`text-sm mb-8 ${featured ? "text-lp-cream/60" : "text-lp-ink/60"}`}>{plan.subtitle}</p>

                  <div className="mb-8">
                    {billingAnnual ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className={`font-lp-display text-5xl font-light ${featured ? "text-lp-cream" : "text-lp-ink"}`}>R$ {equivMonthly}</span>
                          <span className={`text-sm ${featured ? "text-lp-cream/50" : "text-lp-ink/50"}`}>/mês</span>
                        </div>
                        <div className={`text-xs mt-2 ${featured ? "text-lp-cream/50" : "text-lp-ink/50"}`}>
                          <span className="line-through">R$ {monthlyNum}/mês</span>
                          <span className="mx-2">·</span>
                          cobrado {plan.priceAnnual}/ano
                        </div>
                        <span className={`inline-block mt-3 text-[10px] uppercase tracking-widest font-bold px-2 py-1 ${featured ? "bg-lp-gold/20 text-lp-gold" : "bg-lp-emerald-deep/10 text-lp-emerald-deep"}`}>
                          {plan.savingsAnnual}
                        </span>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className={`font-lp-display text-5xl font-light ${featured ? "text-lp-cream" : "text-lp-ink"}`}>{plan.priceMonthly}</span>
                        <span className={`text-sm ${featured ? "text-lp-cream/50" : "text-lp-ink/50"}`}>/mês</span>
                      </div>
                    )}
                  </div>

                  <div className={`h-px mb-8 ${featured ? "bg-lp-cream/15" : "bg-lp-ink/10"}`} />

                  <ul className="space-y-3 mb-10 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-3 text-sm ${featured ? "text-lp-cream/85" : "text-lp-ink/80"}`}>
                        <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${featured ? "text-lp-gold" : "text-lp-emerald-deep"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/cadastro"
                    className={`block text-center py-4 text-[11px] uppercase tracking-[0.25em] font-bold transition-all ${
                      featured
                        ? "bg-lp-cream text-lp-ink hover:bg-lp-gold"
                        : "border border-lp-ink text-lp-ink hover:bg-lp-ink hover:text-lp-cream"
                    }`}
                  >
                    Começar trial grátis
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-14 max-w-2xl mx-auto text-center">
          <div className="border border-lp-emerald-deep/20 bg-lp-bg px-8 py-6">
            <p className="font-lp-display text-xl italic text-lp-emerald-deep mb-1">14 dias grátis em todos os planos</p>
            <p className="text-sm text-lp-ink/60">Acesso completo a todos os módulos. Sem cartão de crédito. Sem compromisso.</p>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ─────────────────────────────────── */}
      <section id="faq" className="py-32 bg-lp-bg border-t border-lp-ink/10" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <span className="block text-[11px] uppercase tracking-[0.4em] font-semibold text-lp-emerald-deep mb-6">— Capítulo VI · Esclarecimentos</span>
            <h2 id="faq-heading" className="font-lp-display text-4xl md:text-5xl font-light mb-12">
              Perguntas <span className="italic">frequentes</span>.
            </h2>
          </Reveal>
          <div className="space-y-0 border-t border-lp-ink/15">
            {faqs.slice(0, 4).map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="border-b border-lp-ink/15">
                  <button
                    className="w-full flex items-center justify-between py-6 text-left gap-6 group"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="font-lp-display text-xl md:text-2xl font-normal text-lp-ink leading-snug">{faq.q}</span>
                    <span className={`flex-shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
                      <Plus className="h-5 w-5 text-lp-ink/60" />
                    </span>
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <p className="text-lp-ink/60 leading-relaxed pr-12">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Reveal className="mt-10 text-center">
            <Link to="/faq" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-bold text-lp-emerald-deep hover:gap-3 transition-all">
              Ver todas as perguntas <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────── */}
      <section className="relative py-32 px-6 bg-lp-ink text-lp-cream overflow-hidden">
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--lp-emerald)/0.25) 0%, transparent 70%)" }}
        />
        <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="block text-[11px] uppercase tracking-[0.4em] font-semibold text-lp-gold mb-6">— Epílogo</span>
          <h2 className="font-lp-display text-5xl md:text-6xl font-light leading-tight mb-8">
            Comece a controlar sua operação HSE <span className="italic">hoje</span>.
          </h2>
          <p className="text-lg text-lp-cream/60 mb-12">14 dias grátis. Sem cartão de crédito. Sem configuração complexa.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/cadastro"
              className="group px-10 py-5 bg-lp-cream text-lp-ink text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-lp-gold transition-colors inline-flex items-center gap-2"
            >
              Criar conta grátis
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-10 py-5 border border-lp-cream/30 text-lp-cream text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-lp-cream/10 transition-colors"
            >
              Já tenho conta — Entrar
            </Link>
          </div>
        </Reveal>
      </section>

      </main>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="bg-lp-ink text-lp-cream/60 py-20 px-6 lg:px-24 border-t border-lp-cream/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="font-lp-display text-3xl font-semibold text-lp-cream mb-6">
              evita<span className="italic font-light">hse</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm mb-8">
              Software de gestão de Saúde, Segurança do Trabalho e Meio Ambiente para empresas brasileiras. Controle treinamentos NR, EPIs, inspeções, licenças ambientais e muito mais.
            </p>
            <div className="flex gap-6 text-[10px] uppercase tracking-[0.3em]">
              <a href="mailto:contato@evitahse.com.br" className="hover:text-lp-cream transition-colors">contato@evitahse.com.br</a>
            </div>
          </div>
          <div>
            <h5 className="text-lp-cream text-[10px] uppercase tracking-[0.3em] mb-6">Produto</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#como-funciona" className="hover:text-lp-cream transition-colors">Metodologia</a></li>
              <li><a href="#modulos" className="hover:text-lp-cream transition-colors">Módulos</a></li>
              <li><a href="#precos" className="hover:text-lp-cream transition-colors">Preços</a></li>
              <li><Link to="/faq" className="hover:text-lp-cream transition-colors">FAQ</Link></li>
              <li><Link to="/funcionalidades" className="hover:text-lp-cream transition-colors">Funcionalidades</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lp-cream text-[10px] uppercase tracking-[0.3em] mb-6">Funcionalidades</h5>
            <ul className="space-y-3 text-sm">
              <li><Link to="/funcionalidades/servicos-periodicos" className="hover:text-lp-cream transition-colors">Serviços Periódicos</Link></li>
              <li><Link to="/funcionalidades/inspecoes" className="hover:text-lp-cream transition-colors">Inspeções</Link></li>
              <li><Link to="/funcionalidades/epi" className="hover:text-lp-cream transition-colors">EPIs</Link></li>
              <li><Link to="/funcionalidades/treinamentos" className="hover:text-lp-cream transition-colors">Treinamentos</Link></li>
              <li><Link to="/funcionalidades/mtr" className="hover:text-lp-cream transition-colors">MTR</Link></li>
              <li><Link to="/funcionalidades/licencas" className="hover:text-lp-cream transition-colors">Licenças</Link></li>
              <li><Link to="/funcionalidades/aso" className="hover:text-lp-cream transition-colors">ASO</Link></li>
              <li><Link to="/funcionalidades/incidentes" className="hover:text-lp-cream transition-colors">IC & NC</Link></li>
              <li><Link to="/funcionalidades/documentos" className="hover:text-lp-cream transition-colors">Documentos</Link></li>
              <li><Link to="/funcionalidades/fornecedores" className="hover:text-lp-cream transition-colors">Fornecedores</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lp-cream text-[10px] uppercase tracking-[0.3em] mb-6">Acesso</h5>
            <ul className="space-y-3 text-sm">
              <li><Link to="/cadastro" className="hover:text-lp-cream transition-colors">Criar conta</Link></li>
              <li><Link to="/login" className="hover:text-lp-cream transition-colors">Entrar</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-lp-cream/10 flex flex-col sm:flex-row justify-between gap-4 text-[10px] uppercase tracking-[0.3em]">
          <span>© 2026 Evita HSE · Todos os direitos reservados</span>
          <span className="italic font-lp-display normal-case tracking-normal text-sm">Feito no Brasil para profissionais de HSE.</span>
        </div>
      </footer>
    </div>
  );
}
