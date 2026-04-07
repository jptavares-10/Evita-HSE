import { Link } from "react-router-dom";
import { Shield, Calendar, GraduationCap, FileText, Users, AlertTriangle, Recycle, ChevronDown, Check, Menu, X, ArrowRight, ClipboardCheck, HardHat, Stethoscope, BookOpen, Building2, Settings, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";

/* ── DATA ─────────────────────────────────────── */

const trustSegments = [
  "🏗️ Construção Civil",
  "🏭 Indústria",
  "🏢 Facilities",
  "⛏️ Mineração",
  "🛢️ Óleo e Gás",
  "🌿 Meio Ambiente",
];

const painPoints = [
  { old: "Certificado vencido descoberto na fiscalização", new: "Alerta automático antes de qualquer vencimento" },
  { old: "WhatsApp lotado de documentos de fornecedores", new: "Fornecedor envia pelo portal próprio" },
  { old: "Ninguém sabe quem fez qual treinamento", new: "Matriz por cargo com status em tempo real" },
  { old: "MTR sem CDF e multa ambiental", new: "CDF monitorado com prazo e alerta" },
];

const steps = [
  { num: "01", icon: Building2, title: "Cadastre sua empresa", desc: "Crie sua conta em menos de 2 minutos. Sem configuração técnica. Sem cartão de crédito." },
  { num: "02", icon: Settings, title: "Configure seus módulos", desc: "Adicione colaboradores, treinamentos, serviços e documentos. Sem consultoria." },
  { num: "03", icon: Target, title: "Monitore sem perder prazos", desc: "O dashboard centraliza tudo. Alertas visuais mostram o que precisa de atenção." },
];

const moduleGroups: Record<string, Array<{ icon: any; accent: string; name: string; desc: string; slug: string }>> = {
  "Segurança": [
    { icon: Calendar, accent: "bg-red-500", name: "Serviços Periódicos", desc: "Controle extintores, limpeza de cisterna, dedetização e qualquer serviço recorrente com alertas configuráveis.", slug: "servicos-periodicos" },
    { icon: ClipboardCheck, accent: "bg-red-500", name: "Inspeções", desc: "Modelos de inspeção com frequência automática. Execuções, registros fotográficos e ações corretivas rastreáveis.", slug: "inspecoes" },
    { icon: AlertTriangle, accent: "bg-red-500", name: "IC & NC", desc: "Registre incidentes e não conformidades. Plano de ação corretiva com status, evidências e rastreabilidade.", slug: "incidentes" },
    { icon: HardHat, accent: "bg-orange-500", name: "EPIs", desc: "Catálogo com CA, controle de estoque, entregas por colaborador e alertas de vencimento de certificado.", slug: "epi" },
    { icon: BookOpen, accent: "bg-blue-500", name: "Biblioteca de Documentos", desc: "Centralize PGR, PCMSO, procedimentos e políticas. Controle de revisões com ciclo automático.", slug: "documentos" },
  ],
  "Saúde": [
    { icon: GraduationCap, accent: "bg-amber-500", name: "Treinamentos", desc: "Matriz por cargo, certificados com validade e dashboard de conformidade. Saiba quem está em dia com as NRs.", slug: "treinamentos" },
    { icon: Stethoscope, accent: "bg-amber-500", name: "ASO / Exames", desc: "Registre exames admissionais, periódicos e demissionais. Alerta de vencimento e histórico por colaborador.", slug: "aso" },
  ],
  "Meio Ambiente": [
    { icon: Recycle, accent: "bg-emerald-500", name: "Gestão de MTR", desc: "MTR com prazo de CDF monitorado e alerta automático. Gráficos de geração mensal por categoria de resíduo.", slug: "mtr" },
    { icon: FileText, accent: "bg-cyan-500", name: "Licenças Ambientais", desc: "LO, LI, outorgas e autorizações com histórico de renovações. Alertas de vencimento configuráveis.", slug: "licencas" },
    { icon: Users, accent: "bg-emerald-500", name: "Portal de Fornecedores", desc: "Link único para o fornecedor enviar documentos. Sem WhatsApp, sem e-mail. Pastas organizadas.", slug: "fornecedores" },
  ],
};

const modules = Object.values(moduleGroups).flat();

const groupTabs = [
  { key: "Segurança", color: "bg-red-500", textColor: "text-red-600", borderColor: "border-red-500" },
  { key: "Saúde", color: "bg-amber-500", textColor: "text-amber-600", borderColor: "border-amber-500" },
  { key: "Meio Ambiente", color: "bg-emerald-500", textColor: "text-emerald-600", borderColor: "border-emerald-500" },
];

const testimonials = [
  { initials: "MS", name: "Marco S.", role: "Técnico de Segurança — Indústria", text: "Antes eu controlava tudo em planilha. Sempre descobria o vencimento na hora errada. Agora o sistema me avisa com antecedência e tenho histórico de tudo.", color: "bg-primary" },
  { initials: "AT", name: "Ana T.", role: "Engenheira Ambiental — Construção", text: "O módulo de MTR me economiza horas por mês. Prazo de CDF nunca mais passou em branco. E o gráfico de resíduos é exatamente o que precisava.", color: "bg-emerald-500" },
  { initials: "RL", name: "Rafael L.", role: "Gerente de HSE — Facilities", text: "O portal de fornecedores foi o que mais me surpreendeu. Acabou o WhatsApp de documento. Cada fornecedor tem o próprio link.", color: "bg-purple-500" },
];

const pricingPlans = [
  {
    key: "starter",
    label: "Starter",
    subtitle: "Para empresas em crescimento",
    priceMonthly: "R$ 97",
    priceAnnual: "R$ 970",
    periodMonthly: "/mês",
    periodAnnual: "/ano",
    savingsAnnual: "Economize R$ 194",
    features: ["Serviços Periódicos", "Treinamentos completo", "IC & NC", "ASO", "Até 5 usuários", "5GB de storage", "Suporte por e-mail"],
    featured: false,
  },
  {
    key: "professional",
    label: "Professional",
    badge: "⭐ Mais popular",
    subtitle: "Para equipes HSE completas",
    priceMonthly: "R$ 247",
    priceAnnual: "R$ 2.470",
    periodMonthly: "/mês",
    periodAnnual: "/ano",
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
    periodMonthly: "/mês",
    periodAnnual: "/ano",
    savingsAnnual: "Economize R$ 994",
    features: ["Tudo do Professional", "Usuários ilimitados", "100GB de storage", "Múltiplas unidades (em breve)", "Suporte SLA 24h", "Onboarding assistido"],
    featured: false,
  },
];

const faqs = [
  { q: "Preciso instalar algum programa?", a: "Não. O Evita HSE é 100% na nuvem. Funciona em qualquer navegador, em computador ou celular." },
  { q: "Meus dados ficam seguros?", a: "Sim. Cada empresa tem seus dados isolados por Row Level Security. Documentos são armazenados em buckets privados com URLs temporárias." },
  { q: "Posso ter mais de um usuário?", a: "Sim. Trial suporta até 2, Starter até 5, Professional até 10 e Enterprise é ilimitado. Convite pelo próprio sistema." },
  { q: "O que acontece quando o trial acaba?", a: "Seu acesso entra em modo leitura. Seus dados ficam preservados enquanto você decide sobre o plano." },
  { q: "Funciona para qualquer segmento?", a: "Sim. Construção civil, indústria, facilities, mineração, saúde, logística e mais." },
  { q: "Como funciona o portal de fornecedores?", a: "Você gera um link único. O fornecedor acessa sem criar conta e envia documentos organizados em pastas." },
  { q: "O que acontece com meus dados se eu não renovar?", a: "Seus dados ficam preservados por 90 dias após o vencimento do plano. Durante esse período, você pode visualizar tudo mas não criar ou editar novos registros. Após 90 dias sem renovação, os dados podem ser removidos." },
  { q: "Posso fazer upgrade ou downgrade a qualquer momento?", a: "Sim. Upgrade tem efeito imediato — você ganha acesso aos novos módulos na hora. Downgrade entra em vigor no próximo ciclo de cobrança. Módulos que você usava mas não estão no novo plano ficam em modo visualização." },
  { q: "Qual a diferença entre plano mensal e anual?", a: "O plano anual equivale a 10 meses pelo preço de 12 — você economiza 2 meses. O valor é cobrado uma vez por ano. Ambos têm os mesmos recursos e limites. O plano anual é ideal para empresas que já sabem que vão usar o sistema a longo prazo." },
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
  return { ref, className: visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6", style: { transition: "opacity 0.6s ease, transform 0.6s ease" } };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const r = useReveal();
  return (
    <div ref={r.ref} className={`${r.className} ${className}`} style={{ ...r.style, transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/* ── COMPONENT ──────────────────────────────────── */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState("Segurança");
  const [billingAnnual, setBillingAnnual] = useState(false);

  usePageTitle("Evita HSE — Software de Gestão de Segurança do Trabalho, Saúde e Meio Ambiente", {
    description: "Software de gestão de SST e meio ambiente para empresas brasileiras. Controle treinamentos NR, EPIs, inspeções, MTR, licenças ambientais, documentos e fornecedores em uma única plataforma.",
  });

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

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div className="min-h-screen bg-white text-foreground">
      <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded">Pular para o conteúdo</a>
      {/* ── NAVBAR ─────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 h-16 flex items-center px-[5%] transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-xl border-b shadow-sm" : ""}`}>
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className={`h-4 w-4 ${scrolled ? "text-primary-foreground" : "text-primary-foreground"}`} />
            </div>
            <span className={`font-display font-bold text-lg transition-colors ${scrolled ? "text-foreground" : "text-white"}`}>Evita HSE</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {[["#como-funciona", "Como funciona"], ["#modulos", "Módulos"], ["#precos", "Preços"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? "text-muted-foreground" : "text-white/70"}`}>{label}</a>
            ))}
            <Link to="/funcionalidades" className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? "text-muted-foreground" : "text-white/70"}`}>Funcionalidades</Link>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <Link to="/login">
              <Button variant="outline" size="sm" className={`transition-all ${scrolled ? "" : "border-white/25 text-white/85 bg-transparent hover:bg-white/10"}`}>
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button size="sm">Começar grátis <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className={`h-5 w-5 ${scrolled ? "text-foreground" : "text-white"}`} /> : <Menu className={`h-5 w-5 ${scrolled ? "text-foreground" : "text-white"}`} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-16 inset-x-0 z-40 bg-white border-b shadow-lg px-6 py-5 space-y-3 md:hidden">
          <a href="#como-funciona" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>Como funciona</a>
          <a href="#modulos" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>Módulos</a>
          <a href="#precos" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>Preços</a>
          <a href="#faq" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link to="/funcionalidades" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>Funcionalidades</Link>
          <div className="flex gap-2 pt-3">
            <Link to="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Entrar</Button></Link>
            <Link to="/cadastro" className="flex-1"><Button className="w-full" size="sm">Criar conta</Button></Link>
          </div>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────── */}
      <main id="conteudo-principal">
      <section className="relative min-h-screen flex items-center px-[5%] pt-24 pb-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #070D1A 0%, #0A1628 40%, #0F1F3D 70%, #0D2451 100%)" }}>
        {/* Orbs */}
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />
        {/* Dots */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative z-10 max-w-[1200px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/35 rounded-full px-4 py-1.5 text-[0.8rem] font-semibold text-blue-300 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Feito para profissionais de HSE no Brasil
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.8rem] font-extrabold text-white leading-[1.08] tracking-tight mb-5">
              Pare de perder{" "}prazos de{" "}
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">HSE.</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-9 max-w-[480px]">
              Centralize treinamentos, inspeções, EPIs, licenças, MTRs, documentos e fornecedores em uma plataforma simples. Nunca mais seja pego de surpresa por uma fiscalização.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/cadastro">
                <Button size="lg" className="text-base px-7 shadow-[0_4px_24px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_32px_rgba(37,99,235,0.5)]">
                  Começar grátis — 14 dias <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button size="lg" variant="outline" className="text-base px-7 border-white/20 text-white/80 bg-transparent hover:bg-white/[0.08] hover:border-white/35">
                  Como funciona
                </Button>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["bg-primary", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-red-500"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#070D1A] ${c} flex items-center justify-center text-[0.65rem] font-bold text-white`}>
                    {["MS", "AT", "RL", "JP", "CL"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400 leading-tight">
                <strong className="text-white">Gestores de HSE</strong> já usam o Evita
                <br />⭐⭐⭐⭐⭐ Avaliação média 4.9
              </p>
            </div>
          </div>

          {/* Right — Mockup */}
          <div className="order-1 lg:order-2 flex justify-center items-center">
            <div className="relative animate-[float_4s_ease-in-out_infinite]">
              <div className="absolute -inset-5 rounded-2xl pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.25) 0%, transparent 70%)" }} />
              <div className="w-full max-w-[440px] bg-[#0D1829] border border-white/10 rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
                {/* Title bar */}
                <div className="bg-[#070D1A] px-4 py-3 flex items-center gap-2.5 border-b border-white/[0.07]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-[0.65rem] text-slate-500 text-center">evitahse.com.br/dashboard</div>
                  <div className="w-6 h-6 bg-primary rounded-full text-[0.55rem] text-white flex items-center justify-center font-bold">JT</div>
                </div>
                {/* Body */}
                <div className="grid grid-cols-[140px_1fr] min-h-[300px]">
                  {/* Sidebar */}
                  <div className="bg-[#070D1A] border-r border-white/[0.06] py-4">
                    <div className="px-4 pb-4 border-b border-white/[0.06] mb-2 font-display text-[0.75rem] font-bold text-white">🛡️ Evita HSE</div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-blue-300 bg-primary/20 border-r-2 border-primary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> Dashboard
                    </div>
                    <div className="px-4 mt-2 mb-1 text-[0.5rem] text-white/25 tracking-widest uppercase">Segurança</div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> Serviços
                      <span className="ml-auto bg-red-500 text-white text-[0.5rem] font-bold px-1.5 rounded-full">3</span>
                    </div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> Inspeções
                      <span className="ml-auto bg-red-500 text-white text-[0.5rem] font-bold px-1.5 rounded-full">2</span>
                    </div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> IC & NC
                    </div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> EPIs
                    </div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> Documentos
                    </div>
                    <div className="px-4 mt-2 mb-1 text-[0.5rem] text-white/25 tracking-widest uppercase">Saúde</div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> Treinamentos
                      <span className="ml-auto bg-red-500 text-white text-[0.5rem] font-bold px-1.5 rounded-full">5</span>
                    </div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> ASO
                    </div>
                    <div className="px-4 mt-2 mb-1 text-[0.5rem] text-white/25 tracking-widest uppercase">Meio Amb.</div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> MTR
                      <span className="ml-auto bg-red-500 text-white text-[0.5rem] font-bold px-1.5 rounded-full">1</span>
                    </div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> Licenças
                    </div>
                    <div className="px-4 py-1.5 text-[0.65rem] text-white/40 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" /> Fornecedores
                    </div>
                  </div>
                  {/* Main */}
                  <div className="p-4">
                    <div className="text-[0.7rem] text-slate-400 mb-3 font-display">Olá, João Tavares 👋</div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        { num: "3", label: "Vencidos", color: "text-red-300" },
                        { num: "24", label: "Em dia", color: "text-emerald-300" },
                        { num: "5", label: "Pendentes", color: "text-amber-200" },
                        { num: "87%", label: "Conformidade", color: "text-blue-300" },
                      ].map((k) => (
                        <div key={k.label} className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-2.5">
                          <div className={`font-display text-xl font-bold ${k.color}`}>{k.num}</div>
                          <div className="text-[0.55rem] text-slate-500 uppercase tracking-wide">{k.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[0.6rem] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Atenção necessária</div>
                    {[
                      { icon: "🔔", text: "Extintor — Bloco A", status: "Vencido", statusClass: "bg-red-500/20 text-red-300" },
                      { icon: "🎓", text: "NR-35 — João Silva", status: "7 dias", statusClass: "bg-amber-500/20 text-amber-200" },
                      { icon: "♻️", text: "MTR-2024-089 CDF", status: "3 dias", statusClass: "bg-amber-500/20 text-amber-200" },
                    ].map((r) => (
                      <div key={r.text} className="flex items-center gap-1.5 py-1.5 border-b border-white/[0.04] text-[0.6rem] text-white/50">
                        {r.icon} {r.text}
                        <span className={`ml-auto px-1.5 py-0.5 rounded text-[0.5rem] font-semibold ${r.statusClass}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────── */}
      <div className="bg-white border-y py-6 px-[5%]">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-4">
          <span className="text-[0.7rem] font-bold text-muted-foreground tracking-[0.12em] uppercase">Confiado por profissionais de HSE em todo o Brasil</span>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            {trustSegments.map((s, i) => (
              <span key={s} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {s}
                {i < trustSegments.length - 1 && <span className="hidden md:block w-px h-5 bg-border ml-4" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── DOR vs SOLUÇÃO ─────────────────────────── */}
      <section id="problema" className="py-24 px-[5%] bg-muted/30">
        <div className="max-w-[900px] mx-auto">
          <Reveal className="text-center">
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">O Problema</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">Sua gestão de HSE ainda<br />depende de planilha?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[560px] mx-auto">A maioria das empresas perde prazos críticos porque os dados estão espalhados.</p>
          </Reveal>
          <div className="mt-14 space-y-4">
            {painPoints.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-6">
                  <div className="bg-red-50/80 border border-red-100 rounded-xl px-5 py-4 flex items-center gap-3">
                    <X className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-red-700">{p.old}</span>
                  </div>
                  <div className="hidden md:flex">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl px-5 py-4 flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-emerald-700 font-medium">{p.new}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ──────────────────────────── */}
      <section id="como-funciona" className="py-24 px-[5%] bg-white">
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center">
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">Como funciona</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">Do cadastro ao controle<br />em minutos</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-14 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+32px)] right-[calc(16.66%+32px)] h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            {steps.map((s, i) => {
              const StepIcon = s.icon;
              return (
                <Reveal key={s.num} delay={i * 0.12} className="text-center px-8 py-8 relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 font-display text-[5.5rem] font-extrabold text-primary/[0.04] select-none pointer-events-none leading-none">{s.num}</div>
                  <div className="w-[72px] h-[72px] bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-7 relative z-10 shadow-[0_12px_32px_rgba(37,99,235,0.3)] ring-4 ring-primary/10">
                    <StepIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2.5">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">{s.desc}</p>
                </Reveal>
              );
            })}
          </div>
          <Reveal className="text-center mt-12">
            <Link to="/cadastro">
              <Button size="lg" className="text-base px-8 shadow-[0_4px_24px_rgba(37,99,235,0.4)]">
                Começar agora — é grátis por 14 dias <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── MÓDULOS ────────────────────────────────── */}
      <section id="modulos" className="py-24 px-[5%] bg-muted/30">
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">Módulos</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">Tudo que sua operação<br />HSE precisa</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[560px]">Dez módulos integrados. Navegue por área para conhecer cada um.</p>
          </Reveal>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mt-10 mb-8">
            {groupTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveGroup(tab.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
                  activeGroup === tab.key
                    ? `${tab.color} text-white border-transparent shadow-md`
                    : `bg-white ${tab.textColor} ${tab.borderColor} hover:bg-muted/50`
                }`}
              >
                {tab.key}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(moduleGroups[activeGroup] || []).map((m, i) => (
              <Link key={m.name} to={`/funcionalidades/${m.slug}`} className="block">
                <div className="bg-card border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-transparent group animate-fade-in h-full">
                  <div className={`h-1 ${m.accent} group-hover:h-1.5 transition-all`} />
                  <div className="p-6 pt-7">
                    <m.icon className="h-7 w-7 text-muted-foreground mb-3.5" />
                    <h3 className="font-display font-bold text-base mb-2">{m.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{m.desc}</p>
                    <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Saiba mais <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* ── DEPOIMENTOS ─────────────────────────────── */}
      <section className="py-24 px-[5%]" style={{ background: "linear-gradient(135deg, hsl(214 100% 97%) 0%, hsl(214 95% 93%) 100%)" }}>
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center">
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">Para quem é</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">Feito por quem entende<br />a rotina de HSE</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-white/80 transition-transform hover:-translate-y-0.5">
                  <div className="text-3xl text-blue-100 font-serif leading-none mb-3">"</div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic mb-5">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>{t.initials}</div>
                    <div>
                      <div className="font-bold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">* Baseado em perfis reais de profissionais da área de HSE.</p>
        </div>
      </section>

      {/* ── PREÇOS ──────────────────────────────────── */}
      <section id="precos" className="py-24 px-[5%]" style={{ background: "#F8FAFC" }}>
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center">
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">Preços</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">Simples e transparente</h2>
            <p className="text-lg text-muted-foreground mx-auto max-w-[560px]">Comece grátis. Faça upgrade quando precisar. Cancele quando quiser.</p>
          </Reveal>

          {/* Toggle Mensal / Anual */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <span className={`text-sm font-semibold transition-colors duration-200 ${!billingAnnual ? "text-foreground" : "text-muted-foreground"}`}>Mensal</span>
            <button
              onClick={() => setBillingAnnual(!billingAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${billingAnnual ? "bg-primary" : "bg-muted-foreground/30"}`}
              aria-label="Alternar entre mensal e anual"
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${billingAnnual ? "translate-x-7" : "translate-x-0"}`} />
            </button>
            <span className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${billingAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Anual
              {billingAnnual && (
                <span className="bg-emerald-100 text-emerald-700 text-[0.7rem] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">2 meses grátis</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 items-stretch">
            {pricingPlans.map((plan, i) => {
              const monthlyNum = parseInt(plan.priceMonthly.replace(/\D/g, ""));
              const annualNum = parseInt(plan.priceAnnual.replace(/\D/g, ""));
              const equivMonthly = Math.round(annualNum / 12);

              return (
                <Reveal key={plan.key} delay={i * 0.1}>
                  <div className={`relative rounded-2xl p-8 flex flex-col h-full transition-all duration-200 hover:shadow-xl ${
                    plan.featured
                      ? "bg-gradient-to-br from-[#1E40AF] to-[#2563EB] text-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-2 border-white/30 md:scale-[1.04]"
                      : "bg-white border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                  }`}>
                    {plan.badge && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-amber-900 text-[0.7rem] font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm">{plan.badge}</span>
                    )}
                    <div className={`text-xs font-bold tracking-[0.1em] uppercase mb-3 ${plan.featured ? "text-white/70" : "text-muted-foreground"}`}>{plan.label}</div>
                    <p className={`text-sm mb-4 ${plan.featured ? "text-white/60" : "text-muted-foreground"}`}>{plan.subtitle}</p>

                    <div className="mb-1">
                      {billingAnnual ? (
                        <div style={{ transition: "opacity 0.2s ease" }}>
                          <div className="flex items-baseline gap-1">
                            <span className={`font-display text-5xl font-extrabold leading-none ${plan.featured ? "text-white" : ""}`}>R$ {equivMonthly}</span>
                            <span className={`text-base ${plan.featured ? "text-white/70" : "text-muted-foreground"}`}>/mês</span>
                          </div>
                          <div className={`text-sm mt-1 ${plan.featured ? "text-white/50" : "text-muted-foreground"}`}>
                            <span className="line-through">R$ {monthlyNum}/mês</span>
                            <span className="mx-1.5">·</span>
                            cobrado {plan.priceAnnual}/ano
                          </div>
                          <span className={`inline-block mt-2 text-[0.7rem] font-bold px-2.5 py-1 rounded-full ${plan.featured ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                            {plan.savingsAnnual}
                          </span>
                        </div>
                      ) : (
                        <div style={{ transition: "opacity 0.2s ease" }}>
                          <div className="flex items-baseline gap-1">
                            <span className={`font-display text-5xl font-extrabold leading-none ${plan.featured ? "text-white" : ""}`}>{plan.priceMonthly}</span>
                            <span className={`text-base ${plan.featured ? "text-white/70" : "text-muted-foreground"}`}>{plan.periodMonthly}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={`h-px my-6 ${plan.featured ? "bg-white/20" : "bg-[#E2E8F0]"}`} />

                    <ul className="space-y-2.5 mb-7 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.featured ? "text-white/90" : "text-[#374151]"}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            plan.featured
                              ? "bg-white/20 text-white"
                              : plan.key === "starter"
                                ? "bg-emerald-500/15 text-emerald-500"
                                : "bg-purple-500/15 text-purple-500"
                          }`}>
                            <Check className="h-3 w-3" />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link to="/cadastro">
                      <Button className={`w-full ${
                        plan.featured
                          ? "bg-white text-[#1E40AF] hover:bg-white/90 shadow-md font-semibold"
                          : "border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                      }`} variant={plan.featured ? "secondary" : "outline"}>
                        Começar trial grátis{plan.featured ? " →" : ""}
                      </Button>
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Trial highlight box */}
          <Reveal className="mt-10">
            <div className="max-w-[700px] mx-auto bg-blue-50 border border-blue-200 rounded-2xl px-8 py-6 text-center">
              <p className="text-base font-bold text-blue-800 mb-1">🎁 Trial de 14 dias grátis em todos os planos</p>
              <p className="text-sm text-blue-700">Acesso completo a todos os módulos. Sem cartão de crédito. Sem compromisso.</p>
            </div>
          </Reveal>

          <Reveal className="text-center mt-6">
            <p className="text-[13px] text-muted-foreground max-w-[500px] mx-auto">
              Pagamentos serão ativados em breve. Crie sua conta agora e aproveite o acesso completo durante o trial.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section id="faq" className="py-24 px-[5%] bg-muted/30">
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center">
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">FAQ</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">Ficou alguma dúvida?</h2>
          </Reveal>
          <div className="max-w-[740px] mx-auto mt-12 space-y-2.5">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={0}>
                <div className={`bg-card border rounded-xl overflow-hidden transition-shadow hover:shadow-md ${openFaq === i ? "shadow-md" : ""}`}>
                  <button
                    className="w-full flex items-center justify-between px-6 py-4.5 text-left font-semibold text-[0.95rem] gap-4"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.q}
                    <span className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 transition-all duration-200 ${openFaq === i ? "rotate-180 bg-blue-100 text-primary" : "text-muted-foreground"}`}>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </span>
                  </button>
                  {openFaq === i && (
                    <>
                      <div className="h-px bg-border mx-6" />
                      <div className="px-6 pb-5 pt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                    </>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────── */}
      <section className="relative py-24 px-[5%] text-center overflow-hidden" style={{ background: "linear-gradient(135deg, #070D1A 0%, #0A1628 40%, #0F1F3D 70%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)" }} />
        <Reveal className="relative z-10 max-w-[640px] mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">Comece a controlar sua operação HSE hoje.</h2>
          <p className="text-lg text-slate-400 mb-9">14 dias grátis. Sem cartão de crédito. Sem configuração complexa.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/cadastro">
              <Button size="lg" className="text-base px-8 shadow-[0_4px_24px_rgba(37,99,235,0.4)]">
                Criar conta grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-base px-7 border-white/20 text-white/75 bg-transparent hover:bg-white/[0.08]">
                Já tenho conta — Entrar
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="py-14 px-[5%] border-t" style={{ background: "#070D1A", borderColor: "#1E293B" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 font-display font-bold text-white mb-3">
                <Shield className="h-5 w-5 text-primary" /> Evita HSE
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">Plataforma de gestão de HSE para empresas brasileiras. Simples, segura e feita para quem trabalha com Saúde, Segurança e Meio Ambiente.</p>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">Produto</div>
              <ul className="space-y-2.5">
                {[["#como-funciona", "Como funciona"], ["#modulos", "Módulos"], ["#precos", "Preços"], ["#faq", "FAQ"]].map(([h, l]) => (
                  <li key={h}><a href={h} className="text-sm text-slate-500 hover:text-blue-400 transition-colors">{l}</a></li>
                ))}
                <li><Link to="/funcionalidades" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Funcionalidades</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">Funcionalidades</div>
              <ul className="space-y-2.5">
                <li><Link to="/funcionalidades/servicos-periodicos" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Serviços Periódicos</Link></li>
                <li><Link to="/funcionalidades/inspecoes" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Inspeções</Link></li>
                <li><Link to="/funcionalidades/epi" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">EPIs</Link></li>
                <li><Link to="/funcionalidades/treinamentos" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Treinamentos</Link></li>
                <li><Link to="/funcionalidades/mtr" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">MTR</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">&nbsp;</div>
              <ul className="space-y-2.5">
                <li><Link to="/funcionalidades/documentos" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Documentos</Link></li>
                <li><Link to="/funcionalidades/licencas" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Licenças</Link></li>
                <li><Link to="/funcionalidades/aso" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">ASO</Link></li>
                <li><Link to="/funcionalidades/incidentes" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">IC & NC</Link></li>
                <li><Link to="/funcionalidades/fornecedores" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Fornecedores</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">Acesso</div>
              <ul className="space-y-2.5">
                <li><Link to="/cadastro" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Criar conta</Link></li>
                <li><Link to="/login" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Entrar</Link></li>
                <li><a href="mailto:contato@evitahse.com.br" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">contato@evitahse.com.br</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-7 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-slate-500">© 2026 <span className="text-slate-400">Evita HSE</span>. Todos os direitos reservados.</p>
            <p className="text-xs text-slate-600">Feito no Brasil 🇧🇷 para profissionais de HSE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
