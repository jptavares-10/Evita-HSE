import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Plus,
  GraduationCap,
  Truck,
  FileText,
  Bell,
  TrendingUp,
  Users,
  Lock,
  AlertTriangle,
  ShieldCheck,
  Fingerprint,
  Clock,
  ServerCog,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EvitaLogo, EvitaWordmark } from "@/components/landing/EvitaBrand";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Reveal } from "@/components/landing/Reveal";
import { useParallax, useSpotlight, useCountUp } from "@/hooks/useMotion";

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
  "Saneamento",
  "Agronegócio",
];

const heroStats = [
  { value: 11, suffix: "+", label: "módulos integrados" },
  { value: 100, suffix: "%", label: "prazos monitorados" },
  { value: 14, suffix: " dias", label: "trial sem cartão" },
];

const painPoints = [
  {
    icon: AlertTriangle,
    problem: "Você descobre o vencimento quando o fiscal chega.",
    solution: "O Evita avisa semanas antes — treinamento, ASO, licença, CA de EPI, CDF de MTR. Tudo com data e responsável.",
  },
  {
    icon: FileText,
    problem: "A evidência existe, mas está perdida no WhatsApp.",
    solution: "Cada certificado, laudo e protocolo fica anexado ao registro certo, com histórico imutável e download em segundos.",
  },
  {
    icon: Clock,
    problem: "Auditoria vira três dias montando planilha.",
    solution: "Filtre, exporte e apresente conformidade por área, cargo ou unidade sem depender de ninguém do time.",
  },
];

const trustPillars = [
  { icon: Fingerprint, title: "Isolamento por empresa", desc: "Row Level Security no banco: nenhum dado atravessa a fronteira da sua operação." },
  { icon: Lock, title: "Documentos privados", desc: "Arquivos em buckets fechados, acessados apenas por URLs assinadas com validade de 1 hora." },
  { icon: ShieldCheck, title: "Trilha de auditoria", desc: "Quem criou, quem alterou, quando e com qual evidência. Pronto para fiscalização." },
  { icon: ServerCog, title: "Permissão por módulo", desc: "Editor ou leitor em cada área. O campo registra, a gestão audita, ninguém apaga histórico." },
];

type ModuleItem = { name: string; desc: string; slug: string };
const moduleGroups: Record<string, ModuleItem[]> = {
  Segurança: [
    { name: "Serviços Periódicos", desc: "Extintores, dedetização, qualquer recorrência com alertas.", slug: "servicos-periodicos" },
    { name: "Inspeções", desc: "Modelos com frequência automática e ações corretivas.", slug: "inspecoes" },
    { name: "IC & NC", desc: "Incidentes e não conformidades com plano de ação.", slug: "incidentes" },
    { name: "EPIs", desc: "CA, estoque, entregas e vencimento de certificado.", slug: "epi" },
    { name: "Biblioteca", desc: "PGR, PCMSO, procedimentos com ciclo de revisão.", slug: "documentos" },
  ],
  Saúde: [
    { name: "Treinamentos", desc: "Matriz por cargo, certificados e conformidade NR.", slug: "treinamentos" },
    { name: "ASO / Exames", desc: "Admissionais, periódicos e demissionais com alerta.", slug: "aso" },
  ],
  "Meio Ambiente": [
    { name: "MTR", desc: "Prazo de CDF monitorado e gráficos de geração.", slug: "mtr" },
    { name: "Licenças", desc: "LO, LI, outorgas com renovações e alertas.", slug: "licencas" },
    { name: "Portal Fornecedores", desc: "Link único, sem WhatsApp, sem e-mail.", slug: "fornecedores" },
  ],
};
const groupTabs = ["Segurança", "Saúde", "Meio Ambiente"] as const;

const testimonials = [
  { initials: "MS", name: "Marco S.", role: "Téc. Segurança · Indústria", text: "Antes era planilha. Agora o sistema avisa antes do vencimento e tenho histórico de tudo." },
  { initials: "AT", name: "Ana T.", role: "Eng. Ambiental · Construção", text: "O MTR me economiza horas por mês. Prazo de CDF nunca mais passou em branco." },
  { initials: "RL", name: "Rafael L.", role: "Gerente HSE · Facilities", text: "O portal de fornecedores acabou com o WhatsApp de documento. Cada um tem seu link." },
];

const pricingPlans = [
  {
    key: "starter",
    label: "Starter",
    subtitle: "Empresas em crescimento",
    priceMonthly: "R$ 97",
    priceAnnual: "R$ 970",
    savingsAnnual: "Economize R$ 194",
    features: ["Serviços Periódicos", "Treinamentos completo", "IC & NC", "ASO", "5 usuários", "5GB storage", "Suporte e-mail"],
    featured: false,
  },
  {
    key: "professional",
    label: "Professional",
    badge: "Mais escolhido",
    subtitle: "Equipes HSE completas",
    priceMonthly: "R$ 247",
    priceAnnual: "R$ 2.470",
    savingsAnnual: "Economize R$ 494",
    features: ["Tudo do Starter", "MTR", "Licenças Ambientais", "Portal Fornecedores", "Biblioteca", "Inspeções", "EPIs", "10 usuários", "20GB", "SLA 48h"],
    featured: true,
  },
  {
    key: "enterprise",
    label: "Enterprise",
    subtitle: "Grandes operações",
    priceMonthly: "R$ 497",
    priceAnnual: "R$ 4.970",
    savingsAnnual: "Economize R$ 994",
    features: ["Tudo do Professional", "Usuários ilimitados", "100GB storage", "Múltiplas unidades", "SLA 24h", "Onboarding assistido"],
    featured: false,
  },
];

const faqs = [
  { q: "Preciso instalar algum programa?", a: "Não. 100% na nuvem. Funciona em qualquer navegador, computador ou celular." },
  { q: "Meus dados ficam seguros?", a: "Sim. Cada empresa tem dados isolados por Row Level Security. Documentos em buckets privados com URLs temporárias." },
  { q: "Como controlar a segurança do trabalho?", a: "Centralize treinamentos NR, EPIs, inspeções, documentos e incidentes em um único software com alertas automáticos." },
  { q: "O que acontece quando o trial acaba?", a: "Acesso entra em modo leitura. Seus dados ficam preservados enquanto você decide sobre o plano." },
  { q: "Como funciona o portal de fornecedores?", a: "Você gera um link único. O fornecedor acessa sem criar conta e envia documentos organizados." },
  { q: "Funciona para qualquer segmento?", a: "Sim. Construção, indústria, facilities, mineração, saúde, logística e mais." },
];

/* ── STAT ─────────────────────────────────── */

function StatValue({ value, suffix }: { value: number; suffix: string }) {
  const { ref, value: current } = useCountUp(value);
  return (
    <span ref={ref} className="tabular-nums">
      {Math.round(current)}
      {suffix}
    </span>
  );
}

/* ── MOCKUPS ─────────────────────────────── */

function BrowserFrame({ children, label = "evita.hse/dashboard" }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-lp-border bg-lp-surface shadow-[0_40px_90px_-30px_hsl(0_0%_0%/0.75)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-lp-border bg-lp-bg/60">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        <span className="ml-3 font-lp-mono text-[10px] text-lp-muted">{label}</span>
      </div>
      <div className="bg-gradient-to-br from-lp-surface to-lp-bg">{children}</div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <BrowserFrame label="evita.hse/dashboard">
      <div className="grid grid-cols-12 min-h-[420px]">
        {/* Sidebar */}
        <aside className="col-span-3 border-r border-lp-border p-4 space-y-1.5">
          <div className="flex items-center gap-2 mb-5 px-2">
            <EvitaLogo className="h-5 w-5" />
            <span className="text-xs font-semibold text-lp-ink tracking-tight">
              Evita
              <span className="text-lp-emerald font-lp-mono text-[9px] tracking-[0.2em] ml-1">HSE</span>
            </span>
          </div>
          {["Dashboard", "Serviços", "Treinamentos", "Inspeções", "EPIs", "MTR", "Licenças"].map((it, i) => (
            <div key={it} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] ${i === 0 ? "bg-lp-emerald/10 text-lp-emerald font-medium" : "text-lp-muted"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-lp-emerald" : "bg-lp-border"}`} />
              {it}
            </div>
          ))}
        </aside>
        {/* Main */}
        <div className="col-span-9 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-lp-muted">Visão geral</p>
              <p className="text-sm font-semibold text-lp-ink">Painel HSE — Junho 2026</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lp-emerald/10 text-lp-emerald text-[10px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-lp-emerald animate-lp-pulse-dot" />
              Sincronizado
            </div>
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { l: "Conformidade", v: "94%", c: "text-lp-emerald" },
              { l: "Vencendo 7d", v: "12", c: "text-yellow-400" },
              { l: "Vencidos", v: "3", c: "text-red-400" },
              { l: "Colaboradores", v: "184", c: "text-lp-ink" },
            ].map((k) => (
              <div key={k.l} className="rounded-lg border border-lp-border bg-lp-bg/50 p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-lp-muted mb-1">{k.l}</p>
                <p className={`text-lg font-semibold tabular-nums ${k.c}`}>{k.v}</p>
              </div>
            ))}
          </div>
          {/* Chart */}
          <div className="rounded-lg border border-lp-border bg-lp-bg/50 p-3.5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] uppercase tracking-wider text-lp-muted">Conformidade por área</p>
              <p className="text-[10px] text-lp-muted">últimos 6 meses</p>
            </div>
            <div className="flex items-end gap-2 h-20">
              {[55, 70, 62, 80, 88, 94].map((h, i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                  <div className="w-full rounded-t bg-gradient-to-t from-lp-emerald-deep to-lp-emerald-glow" style={{ height: `${h}%` }} />
                  <span className="text-[8px] text-lp-muted">{["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function TrainingsMockup() {
  const rows = [
    { nome: "NR-10 Básico", colab: "Marco Silva", status: "OK", cor: "emerald", venc: "12/2026" },
    { nome: "NR-35 Altura", colab: "Ana Torres", status: "Vencendo", cor: "yellow", venc: "08/2026" },
    { nome: "NR-33 Confinado", colab: "Rafael Lima", status: "Vencido", cor: "red", venc: "03/2026" },
    { nome: "Brigada Incêndio", colab: "Júlia M.", status: "OK", cor: "emerald", venc: "11/2026" },
  ];
  const corMap: Record<string, string> = {
    emerald: "bg-lp-emerald/15 text-lp-emerald border-lp-emerald/30",
    yellow: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <BrowserFrame label="evita.hse/treinamentos">
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-wider text-lp-muted mb-1">Treinamentos</p>
        <p className="text-sm font-semibold text-lp-ink mb-4">Matriz por cargo · NR conformidade</p>
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.nome + r.colab} className="grid grid-cols-12 items-center gap-2 px-3 py-2.5 rounded-md border border-lp-border bg-lp-bg/40 text-[11px]">
              <span className="col-span-4 text-lp-ink font-medium">{r.nome}</span>
              <span className="col-span-4 text-lp-muted">{r.colab}</span>
              <span className="col-span-2 font-lp-mono text-lp-muted">{r.venc}</span>
              <span className={`col-span-2 text-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${corMap[r.cor]}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function MTRMockup() {
  return (
    <BrowserFrame label="evita.hse/mtr">
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-wider text-lp-muted mb-1">MTR · #240618</p>
        <p className="text-sm font-semibold text-lp-ink mb-4">Transporte de resíduos · Classe IIA</p>
        <div className="rounded-lg border border-lp-border bg-lp-bg/50 p-4 space-y-3">
          <div className="grid grid-cols-3 text-[10px]">
            <div><p className="text-lp-muted uppercase tracking-wider">Quantidade</p><p className="text-lp-ink font-semibold text-sm mt-1 tabular-nums">2,485 t</p></div>
            <div><p className="text-lp-muted uppercase tracking-wider">Emitido</p><p className="text-lp-ink font-semibold text-sm mt-1 tabular-nums">10/06/2026</p></div>
            <div><p className="text-lp-muted uppercase tracking-wider">Prazo CDF</p><p className="text-yellow-300 font-semibold text-sm mt-1 tabular-nums">83/90 dias</p></div>
          </div>
          <div className="h-1.5 rounded-full bg-lp-border overflow-hidden">
            <div className="h-full bg-gradient-to-r from-lp-emerald via-yellow-400 to-red-400" style={{ width: "92%" }} />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 text-yellow-300"><Bell className="h-3 w-3" /> Alerta de prazo enviado</span>
            <span className="text-lp-muted font-lp-mono">CDF pendente</span>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function PortalMockup() {
  const docs = [
    { n: "ART de Segurança", ok: true },
    { n: "PGR 2026", ok: true },
    { n: "ASO Marco Silva", ok: false },
    { n: "Certificado NR-10", ok: true },
  ];
  return (
    <BrowserFrame label="portal.fornecedor/abc123">
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-wider text-lp-muted mb-1">Portal · Construtora Alfa</p>
        <p className="text-sm font-semibold text-lp-ink mb-4">Envie seus documentos</p>
        <div className="space-y-1.5">
          {docs.map((d) => (
            <div key={d.n} className="flex items-center justify-between px-3 py-2.5 rounded-md border border-lp-border bg-lp-bg/40 text-[11px]">
              <span className="text-lp-ink">{d.n}</span>
              {d.ok ? (
                <span className="flex items-center gap-1.5 text-lp-emerald text-[10px] font-medium"><Check className="h-3 w-3" /> Recebido</span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-lp-border text-lp-muted">Enviar</span>
              )}
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-2.5 rounded-md bg-lp-emerald/15 border border-lp-emerald/30 text-lp-emerald text-[11px] font-semibold">
          Enviar arquivos
        </button>
      </div>
    </BrowserFrame>
  );
}

/* ── PAGE ──────────────────────────────────── */

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<typeof groupTabs[number]>("Segurança");
  const [billingAnnual, setBillingAnnual] = useState(false);
  const heroParallax = useParallax<HTMLDivElement>(60);
  const spotlight = useSpotlight<HTMLDivElement>();

  usePageTitle("Evita HSE — Gestão de SST e Meio Ambiente", {
    description: "Plataforma de gestão de SST: treinamentos NR, EPIs, inspeções, MTR, licenças e ASO. Alertas de vencimento automáticos. Teste 14 dias grátis.",
  });

  useEffect(() => {
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = "faq-jsonld";
    s.textContent = JSON.stringify(faqJsonLd);
    document.head.appendChild(s);
    return () => { document.getElementById("faq-jsonld")?.remove(); };
  }, []);

  const moduleMockup: Record<string, React.ReactNode> = {
    Segurança: <DashboardMockup />,
    Saúde: <TrainingsMockup />,
    "Meio Ambiente": <MTRMockup />,
  };

  return (
    <div className="lp-dark lp-grain min-h-screen bg-lp-bg text-lp-ink font-lp-sans antialiased selection:bg-lp-emerald/30 selection:text-lp-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-lp-emerald focus:text-lp-bg focus:px-4 focus:py-2 rounded">Pular para o conteúdo</a>

      {/* ── NAVBAR (compartilhada com /funcionalidades, /blog e /faq) ─ */}
      <SiteHeader />

      <main id="main">
        {/* ── HERO ──────────────────── */}
        <section className="relative pt-32 pb-16 px-6 lg:px-8 overflow-hidden">
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="lp-aurora" />
          </div>
          <div aria-hidden className="absolute inset-0 lp-mesh-bg animate-lp-mesh pointer-events-none" />
          <div aria-hidden className="absolute inset-0 lp-grid-bg pointer-events-none opacity-40" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-lp-bg to-transparent pointer-events-none" />
          <div className="relative max-w-6xl mx-auto text-center">
            <Reveal variant="blur">
              <h1 className="font-lp-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] text-lp-ink mb-6">
                Nenhum prazo de HSE{" "}
                <span className="bg-gradient-to-r from-lp-emerald via-lp-emerald-glow to-lp-gold bg-clip-text text-transparent">vence sem você saber</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg md:text-xl text-lp-muted max-w-2xl mx-auto mb-8 leading-relaxed">
                Treinamentos NR, EPIs, inspeções, ASO, MTR e licenças ambientais em uma única plataforma — com alerta antecipado,
                evidência anexada e trilha de auditoria pronta para o fiscal.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
                <Link to="/cadastro" className="group px-6 py-3 bg-lp-emerald text-lp-bg font-medium rounded-lg hover:bg-lp-emerald-glow transition-all inline-flex items-center gap-2 lp-glow">
                  Começar grátis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a href="#produto" className="px-6 py-3 border border-lp-border text-lp-ink font-medium rounded-lg hover:bg-lp-surface transition-colors inline-flex items-center gap-2">
                  Ver o produto
                </a>
              </div>
              <p className="text-xs text-lp-muted">14 dias grátis · Sem cartão de crédito · Cancele quando quiser</p>
            </Reveal>

            {/* Hero mockup */}
            <Reveal delay={0.25} variant="scale" className="mt-16">
              <div ref={heroParallax.ref} className="relative max-w-5xl mx-auto" style={{ transform: `translateY(${heroParallax.offset * -0.4}px)` }}>
                <div aria-hidden className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-b from-lp-emerald/20 via-transparent to-transparent blur-3xl" />
                <div className="relative lp-tilt lp-sheen rounded-xl">
                  <DashboardMockup />
                </div>
              </div>
            </Reveal>

            {/* Stats */}
            <Reveal delay={0.3}>
              <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                {heroStats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-lp-display text-3xl md:text-4xl font-semibold text-lp-ink">
                      <StatValue value={s.value} suffix={s.suffix} />
                    </p>
                    <p className="text-xs text-lp-muted mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── TRUST STRIP ──────────────────── */}
        <section className="py-12 border-y border-lp-border overflow-hidden">
          <p className="text-center text-sm text-lp-muted mb-6">Equipes HSE que operam com o Evita</p>
          <div className="flex overflow-hidden">
            <div className="flex shrink-0 animate-lp-marquee gap-12 px-6">
              {[...trustSegments, ...trustSegments].map((s, i) => (
                <span key={i} className="font-lp-display text-lg text-lp-muted/70 whitespace-nowrap">{s}</span>
              ))}
            </div>
            <div className="flex shrink-0 animate-lp-marquee gap-12 px-6" aria-hidden>
              {[...trustSegments, ...trustSegments].map((s, i) => (
                <span key={i} className="font-lp-display text-lg text-lp-muted/70 whitespace-nowrap">{s}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── DOR → SOLUÇÃO ──────────────────── */}
        <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
          <div aria-hidden className="absolute inset-0 lp-mesh-bg opacity-50 pointer-events-none" />
          <div className="relative max-w-6xl mx-auto">
            <Reveal className="text-center mb-14">
              <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink mb-4">
                Planilha não avisa. Planilha não assina. Planilha não te defende.
              </h2>
              <p className="text-lg text-lp-muted max-w-2xl mx-auto">
                Em uma autuação, o que vale é evidência com data. É exatamente isso que o Evita produz todos os dias, sem esforço extra do seu time.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {painPoints.map((p, i) => (
                <Reveal key={p.problem} delay={i * 0.08} variant="blur">
                  <div
                    className="lp-card lp-spot lp-ring-gradient rounded-2xl p-7 h-full"
                    onMouseMove={spotlight.onMouseMove}
                  >
                    <div className="w-11 h-11 rounded-xl bg-lp-gold/10 border border-lp-gold/25 grid place-items-center mb-5">
                      <p.icon className="h-5 w-5 text-lp-gold" />
                    </div>
                    <h3 className="font-lp-display text-lg font-semibold text-lp-ink mb-3 leading-snug">{p.problem}</h3>
                    <p className="text-sm text-lp-muted leading-relaxed">{p.solution}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENTO MÓDULOS PRINCIPAIS ──────────────────── */}
        <section id="produto" className="py-24 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-14">
              <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink mb-4">Tudo que sua operação HSE precisa.</h2>
              <p className="text-lg text-lp-muted max-w-2xl mx-auto">Substitui dezenas de planilhas, controles paralelos e lembretes no celular. Ative só o que sua operação usa.</p>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Big card: Dashboard */}
              <Reveal className="md:col-span-2">
                <div className="lp-card rounded-2xl p-8 transition-all">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-lp-emerald/10 text-lp-emerald text-xs font-medium mb-4">
                        <TrendingUp className="h-3.5 w-3.5" /> Dashboard HSE
                      </div>
                      <h3 className="font-lp-display text-2xl font-semibold text-lp-ink mb-3">Uma única fonte de verdade.</h3>
                      <p className="text-lp-muted mb-5">Conformidade por área, alertas de vencimento, KPIs de incidentes. Tudo em tempo real, sem exportar planilha.</p>
                      <Link to="/funcionalidades" className="text-sm text-lp-emerald font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">Explorar módulos <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </div>
                    <div><DashboardMockup /></div>
                  </div>
                </div>
              </Reveal>

              {/* Treinamentos */}
              <Reveal delay={0.05}>
                <div className="lp-card rounded-2xl p-8 h-full transition-all">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-lp-emerald/10 text-lp-emerald text-xs font-medium mb-4">
                    <GraduationCap className="h-3.5 w-3.5" /> Treinamentos
                  </div>
                  <h3 className="font-lp-display text-xl font-semibold text-lp-ink mb-2">Conformidade NR no automático.</h3>
                  <p className="text-lp-muted text-sm mb-5">Matriz por cargo, certificados com validade, alertas antes do vencimento.</p>
                  <TrainingsMockup />
                </div>
              </Reveal>

              {/* MTR */}
              <Reveal delay={0.1}>
                <div className="lp-card rounded-2xl p-8 h-full transition-all">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-lp-emerald/10 text-lp-emerald text-xs font-medium mb-4">
                    <Truck className="h-3.5 w-3.5" /> Resíduos & MTR
                  </div>
                  <h3 className="font-lp-display text-xl font-semibold text-lp-ink mb-2">Prazo de CDF nunca mais perdido.</h3>
                  <p className="text-lp-muted text-sm mb-5">90 dias monitorados, alertas em 83 dias, gráficos de geração mensal.</p>
                  <MTRMockup />
                </div>
              </Reveal>

              {/* Portal */}
              <Reveal delay={0.15} className="md:col-span-2">
                <div className="lp-card rounded-2xl p-8 transition-all">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-lp-emerald/10 text-lp-emerald text-xs font-medium mb-4">
                        <Users className="h-3.5 w-3.5" /> Portal de Fornecedores
                      </div>
                      <h3 className="font-lp-display text-2xl font-semibold text-lp-ink mb-3">Acabe com o WhatsApp de documento.</h3>
                      <p className="text-lp-muted mb-5">Cada fornecedor recebe um link único. Envia documentos organizados por categoria, sem precisar criar conta.</p>
                      <ul className="space-y-2 text-sm text-lp-muted">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-lp-emerald" /> Sem cadastro do fornecedor</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-lp-emerald" /> Validação automática de documentos</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-lp-emerald" /> Histórico completo e rastreável</li>
                      </ul>
                    </div>
                    <div><PortalMockup /></div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── MODULES (tabs) ──────────────────── */}
        <section id="modulos" className="py-24 px-6 lg:px-8 border-t border-lp-border">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-12">
              <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink mb-4">Feito para sua operação.</h2>
              <p className="text-lg text-lp-muted max-w-2xl mx-auto">Segurança, Saúde e Meio Ambiente cobertos em profundidade — sem precisar de software extra.</p>
            </Reveal>

            <div className="flex justify-center gap-1 p-1 rounded-lg bg-lp-surface border border-lp-border w-fit mx-auto mb-10">
              {groupTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveGroup(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeGroup === tab ? "bg-lp-emerald text-lp-bg" : "text-lp-muted hover:text-lp-ink"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-2 space-y-2">
                {(moduleGroups[activeGroup] || []).map((m, i) => (
                  <Link
                    key={m.slug}
                    to={`/funcionalidades/${m.slug}`}
                    className="group block p-4 rounded-lg border border-lp-border bg-lp-surface/40 hover:bg-lp-surface hover:border-lp-emerald/40 transition-all animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-lp-display font-semibold text-lp-ink mb-1">{m.name}</p>
                        <p className="text-sm text-lp-muted">{m.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-lp-muted shrink-0 mt-1 transition-all group-hover:text-lp-emerald group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
              <div className="lg:col-span-3">{moduleMockup[activeGroup]}</div>
            </div>
          </div>
        </section>

        {/* ── DEPOIMENTOS ──────────────────── */}
        <section className="py-24 px-6 lg:px-8 border-t border-lp-border">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-14">
              <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink">Profissionais HSE no campo.</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.05}>
                  <div className="lp-card rounded-xl p-6 h-full flex flex-col">
                    <p className="text-lp-ink text-base leading-relaxed mb-5 flex-1">"{t.text}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-lp-border">
                      <div className="h-9 w-9 rounded-full bg-lp-emerald/20 grid place-items-center text-lp-emerald text-xs font-bold">{t.initials}</div>
                      <div>
                        <p className="text-sm font-medium text-lp-ink">{t.name}</p>
                        <p className="text-xs text-lp-muted">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="text-center text-xs text-lp-muted mt-10">* Baseado em perfis reais de profissionais HSE.</p>
          </div>
        </section>

        {/* ── SEGURANÇA ──────────────────── */}
        <section className="relative py-24 px-6 lg:px-8 border-t border-lp-border overflow-hidden">
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
            <div className="lp-aurora" />
          </div>
          <div className="relative max-w-6xl mx-auto">
            <Reveal className="text-center mb-14">
              <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink mb-4">
                Seus dados de HSE são sensíveis. Tratamos como tal.
              </h2>
              <p className="text-lg text-lp-muted max-w-2xl mx-auto">
                Segurança não é uma página de marketing aqui — é a arquitetura do produto.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trustPillars.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.06} variant="scale">
                  <div className="lp-card lp-spot rounded-2xl p-6 h-full" onMouseMove={spotlight.onMouseMove}>
                    <div className="w-11 h-11 rounded-xl bg-lp-emerald/10 border border-lp-emerald/25 grid place-items-center mb-4">
                      <p.icon className="h-5 w-5 text-lp-emerald-glow" />
                    </div>
                    <h3 className="font-lp-display text-base font-semibold text-lp-ink mb-2">{p.title}</h3>
                    <p className="text-sm text-lp-muted leading-relaxed">{p.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10 text-center">
              <Link to="/seguranca" className="text-sm text-lp-emerald-glow font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Ver como protegemos sua operação <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── PREÇOS ──────────────────── */}
        <section id="precos" className="py-24 px-6 lg:px-8 border-t border-lp-border">
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-10">
              <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink mb-4">Transparente, sem pegadinhas.</h2>
              <p className="text-lg text-lp-muted">Custa menos que uma autuação. Comece grátis, faça upgrade quando precisar, cancele quando quiser.</p>
            </Reveal>

            <div className="flex items-center justify-center gap-3 mb-10">
              <span className={`text-sm font-medium ${!billingAnnual ? "text-lp-ink" : "text-lp-muted"}`}>Mensal</span>
              <button onClick={() => setBillingAnnual(!billingAnnual)} className={`relative w-12 h-6 rounded-full transition-colors ${billingAnnual ? "bg-lp-emerald" : "bg-lp-border"}`} aria-label="Alternar billing">
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-lp-ink rounded-full transition-transform ${billingAnnual ? "translate-x-6" : "translate-x-0"}`} />
              </button>
              <span className={`text-sm font-medium flex items-center gap-2 ${billingAnnual ? "text-lp-ink" : "text-lp-muted"}`}>
                Anual
                <span className="px-2 py-0.5 rounded-full bg-lp-emerald/15 text-lp-emerald text-[10px] font-semibold">2 meses grátis</span>
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-5 items-stretch">
              {pricingPlans.map((plan, i) => {
                const monthlyNum = parseInt(plan.priceMonthly.replace(/\D/g, ""));
                const annualNum = parseInt(plan.priceAnnual.replace(/\D/g, ""));
                const equivMonthly = Math.round(annualNum / 12);
                const featured = plan.featured;
                return (
                  <Reveal key={plan.key} delay={i * 0.05}>
                    <div className={`relative rounded-2xl p-7 h-full flex flex-col transition-all ${featured ? "bg-lp-surface border border-lp-emerald/40 lp-glow" : "lp-card"}`}>
                      {featured && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-lp-emerald text-lp-bg text-[10px] font-bold uppercase tracking-wider">
                          {plan.badge}
                        </span>
                      )}
                      <p className="text-sm font-medium text-lp-emerald mb-1">{plan.label}</p>
                      <p className="text-xs text-lp-muted mb-5">{plan.subtitle}</p>
                      <div className="mb-6">
                        {billingAnnual ? (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className="font-lp-display text-4xl font-semibold text-lp-ink tabular-nums">R$ {equivMonthly}</span>
                              <span className="text-sm text-lp-muted">/mês</span>
                            </div>
                            <p className="text-xs text-lp-muted mt-2">
                              <span className="line-through">R$ {monthlyNum}</span> · cobrado {plan.priceAnnual}/ano
                            </p>
                          </>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="font-lp-display text-4xl font-semibold text-lp-ink tabular-nums">{plan.priceMonthly}</span>
                            <span className="text-sm text-lp-muted">/mês</span>
                          </div>
                        )}
                      </div>
                      <ul className="space-y-2.5 mb-6 flex-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-lp-muted">
                            <Check className="h-4 w-4 mt-0.5 text-lp-emerald shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/cadastro"
                        className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-all ${featured ? "bg-lp-emerald text-lp-bg hover:bg-lp-emerald-glow" : "border border-lp-border text-lp-ink hover:border-lp-emerald hover:text-lp-emerald"}`}
                      >
                        Começar grátis
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal className="mt-8 text-center">
              <p className="text-sm text-lp-muted inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-lp-emerald" /> 14 dias grátis em todos os planos · sem cartão
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ──────────────────── */}
        <section id="faq" className="py-24 px-6 lg:px-8 border-t border-lp-border">
          <div className="max-w-3xl mx-auto">
            <Reveal className="text-center mb-12">
              <h2 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight text-lp-ink">Perguntas frequentes.</h2>
            </Reveal>
            <div className="space-y-2">
              {faqs.slice(0, 4).map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div key={i} className="rounded-lg border border-lp-border bg-lp-surface/40 overflow-hidden">
                    <button className="w-full flex items-center justify-between p-5 text-left gap-4" onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open}>
                      <span className="text-lp-ink font-medium">{faq.q}</span>
                      <Plus className={`h-4 w-4 text-lp-muted shrink-0 transition-transform ${open ? "rotate-45 text-lp-emerald" : ""}`} />
                    </button>
                    <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-lp-muted leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Reveal className="mt-8 text-center">
              <Link to="/faq" className="text-sm text-lp-emerald font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                Ver todas as perguntas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── CTA FINAL ──────────────────── */}
        <section className="relative py-28 px-6 lg:px-8 border-t border-lp-border overflow-hidden">
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="lp-aurora" />
          </div>
          <div aria-hidden className="absolute inset-0 lp-mesh-bg animate-lp-mesh opacity-60 pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <Reveal variant="blur">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lp-gold/30 bg-lp-gold/10 text-xs font-medium text-lp-gold mb-6">
                <Sparkles className="h-3.5 w-3.5" /> Configuração em minutos
              </div>
              <h2 className="font-lp-display text-4xl md:text-6xl font-semibold tracking-tight text-lp-ink mb-5 leading-[1.05]">
                O próximo vencimento já está a caminho.
              </h2>
              <p className="text-lg text-lp-muted mb-8">14 dias grátis. Sem cartão. Sem implantação longa — cadastre e comece a monitorar hoje.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/cadastro" className="group px-6 py-3 bg-lp-emerald text-lp-bg font-medium rounded-lg hover:bg-lp-emerald-glow transition-all inline-flex items-center justify-center gap-2 lp-glow">
                  Criar conta grátis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/login" className="px-6 py-3 border border-lp-border text-lp-ink font-medium rounded-lg hover:bg-lp-surface transition-colors">
                  Já tenho conta
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────── */}
      <footer className="border-t border-lp-border bg-lp-bg py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4" aria-label="Evita HSE">
              <EvitaLogo className="h-9 w-9" />
              <EvitaWordmark size="lg" />
            </Link>
            <p className="text-sm text-lp-muted leading-relaxed max-w-sm mb-4">
              Software de gestão de Saúde, Segurança e Meio Ambiente para a indústria brasileira.
            </p>
            <a href="mailto:contato@evitahse.com.br" className="text-sm text-lp-muted hover:text-lp-ink transition-colors">contato@evitahse.com.br</a>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-wider text-lp-ink font-semibold mb-4">Produto</h5>
            <ul className="space-y-2 text-sm text-lp-muted">
              <li><a href="#produto" className="hover:text-lp-ink transition-colors">Produto</a></li>
              <li><a href="#modulos" className="hover:text-lp-ink transition-colors">Módulos</a></li>
              <li><a href="#precos" className="hover:text-lp-ink transition-colors">Preços</a></li>
              <li><Link to="/faq" className="hover:text-lp-ink transition-colors">FAQ</Link></li>
              <li><Link to="/funcionalidades" className="hover:text-lp-ink transition-colors">Funcionalidades</Link></li>
              <li><Link to="/blog" className="hover:text-lp-ink transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-wider text-lp-ink font-semibold mb-4">Funcionalidades</h5>
            <ul className="space-y-2 text-sm text-lp-muted">
              <li><Link to="/funcionalidades/servicos-periodicos" className="hover:text-lp-ink transition-colors">Serviços Periódicos</Link></li>
              <li><Link to="/funcionalidades/inspecoes" className="hover:text-lp-ink transition-colors">Inspeções</Link></li>
              <li><Link to="/funcionalidades/epi" className="hover:text-lp-ink transition-colors">EPIs</Link></li>
              <li><Link to="/funcionalidades/treinamentos" className="hover:text-lp-ink transition-colors">Treinamentos</Link></li>
              <li><Link to="/funcionalidades/mtr" className="hover:text-lp-ink transition-colors">MTR</Link></li>
              <li><Link to="/funcionalidades/licencas" className="hover:text-lp-ink transition-colors">Licenças</Link></li>
              <li><Link to="/funcionalidades/aso" className="hover:text-lp-ink transition-colors">ASO</Link></li>
              <li><Link to="/funcionalidades/incidentes" className="hover:text-lp-ink transition-colors">IC & NC</Link></li>
              <li><Link to="/funcionalidades/documentos" className="hover:text-lp-ink transition-colors">Documentos</Link></li>
              <li><Link to="/funcionalidades/fornecedores" className="hover:text-lp-ink transition-colors">Fornecedores</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-wider text-lp-ink font-semibold mb-4">Acesso</h5>
            <ul className="space-y-2 text-sm text-lp-muted">
              <li><Link to="/cadastro" className="hover:text-lp-ink transition-colors">Criar conta</Link></li>
              <li><Link to="/login" className="hover:text-lp-ink transition-colors">Entrar</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-lp-border flex flex-col sm:flex-row justify-between gap-3 text-xs text-lp-muted">
          <span>© 2026 Evita HSE · Todos os direitos reservados</span>
          <span>Feito no Brasil para profissionais de HSE.</span>
        </div>
      </footer>
    </div>
  );
}