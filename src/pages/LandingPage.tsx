import { Link } from "react-router-dom";
import { Shield, Calendar, GraduationCap, FileText, Users, AlertTriangle, Recycle, ChevronDown, Check, Menu, X, ArrowRight, ClipboardCheck, HardHat, Stethoscope, BookOpen, Building2, Settings, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

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

const moduleGroups: Record<string, Array<{ icon: any; accent: string; name: string; desc: string }>> = {
  "Segurança": [
    { icon: Calendar, accent: "bg-red-500", name: "Serviços Periódicos", desc: "Controle extintores, limpeza de cisterna, dedetização e qualquer serviço recorrente com alertas configuráveis." },
    { icon: ClipboardCheck, accent: "bg-red-500", name: "Inspeções", desc: "Modelos de inspeção com frequência automática. Execuções, registros fotográficos e ações corretivas rastreáveis." },
    { icon: AlertTriangle, accent: "bg-red-500", name: "IC & NC", desc: "Registre incidentes e não conformidades. Plano de ação corretiva com status, evidências e rastreabilidade." },
    { icon: HardHat, accent: "bg-orange-500", name: "EPIs", desc: "Catálogo com CA, controle de estoque, entregas por colaborador e alertas de vencimento de certificado." },
    { icon: BookOpen, accent: "bg-blue-500", name: "Biblioteca de Documentos", desc: "Centralize PGR, PCMSO, procedimentos e políticas. Controle de revisões com ciclo automático." },
  ],
  "Saúde": [
    { icon: GraduationCap, accent: "bg-amber-500", name: "Treinamentos", desc: "Matriz por cargo, certificados com validade e dashboard de conformidade. Saiba quem está em dia com as NRs." },
    { icon: Stethoscope, accent: "bg-amber-500", name: "ASO / Exames", desc: "Registre exames admissionais, periódicos e demissionais. Alerta de vencimento e histórico por colaborador." },
  ],
  "Meio Ambiente": [
    { icon: Recycle, accent: "bg-emerald-500", name: "Gestão de MTR", desc: "MTR com prazo de CDF monitorado e alerta automático. Gráficos de geração mensal por categoria de resíduo." },
    { icon: FileText, accent: "bg-cyan-500", name: "Licenças Ambientais", desc: "LO, LI, outorgas e autorizações com histórico de renovações. Alertas de vencimento configuráveis." },
    { icon: Users, accent: "bg-emerald-500", name: "Portal de Fornecedores", desc: "Link único para o fornecedor enviar documentos. Sem WhatsApp, sem e-mail. Pastas organizadas." },
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
  { key: "trial", label: "Trial", price: "Grátis", period: "14 dias de acesso completo", features: ["Todos os módulos inclusos", "Até 2 usuários", "Suporte por e-mail", "Sem cartão de crédito"], featured: false },
  { key: "pro", label: "Pro", badge: "✦ Mais completo", price: "R$ 149", period: "/mês · usuários ilimitados", features: ["Todos os módulos inclusos", "Usuários ilimitados", "Suporte prioritário", "Acesso a novos módulos primeiro"], featured: true },
  { key: "basic", label: "Basic", price: "R$ 79", period: "/mês · até 5 usuários", features: ["Todos os módulos inclusos", "Até 5 usuários", "Suporte por e-mail", "Histórico completo"], featured: false },
];

const faqs = [
  { q: "Preciso instalar algum programa?", a: "Não. O Evita HSE é 100% na nuvem. Funciona em qualquer navegador, em computador ou celular." },
  { q: "Meus dados ficam seguros?", a: "Sim. Cada empresa tem seus dados isolados por Row Level Security. Documentos são armazenados em buckets privados com URLs temporárias." },
  { q: "Posso ter mais de um usuário?", a: "Sim. Trial suporta até 2, Basic até 5 e Pro é ilimitado. Convite pelo próprio sistema." },
  { q: "O que acontece quando o trial acaba?", a: "Seu acesso entra em modo leitura. Seus dados ficam preservados enquanto você decide sobre o plano." },
  { q: "Funciona para qualquer segmento?", a: "Sim. Construção civil, indústria, facilities, mineração, saúde, logística e mais." },
  { q: "Como funciona o portal de fornecedores?", a: "Você gera um link único. O fornecedor acessa sem criar conta e envia documentos organizados em pastas." },
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

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div className="min-h-screen bg-white text-foreground">
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
          <div className="flex gap-2 pt-3">
            <Link to="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Entrar</Button></Link>
            <Link to="/cadastro" className="flex-1"><Button className="w-full" size="sm">Criar conta</Button></Link>
          </div>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────── */}
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
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">O Problema</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">Sua gestão de HSE ainda<br />depende de planilha?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[560px]">A maioria das empresas perde prazos críticos porque os dados estão espalhados em Excel, WhatsApp e e-mail.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <Reveal delay={0.1}>
              <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-red-50 border-b border-red-200 font-display font-bold text-red-800 flex items-center gap-2.5">
                  😰 Do jeito antigo
                </div>
                <div className="px-6 py-5 space-y-0">
                  {painOld.map((p) => (
                    <div key={p} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0 text-sm text-muted-foreground">
                      <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" /> {p}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200 font-display font-bold text-emerald-800 flex items-center gap-2.5">
                  ✅ Com o Evita HSE
                </div>
                <div className="px-6 py-5 space-y-0">
                  {painNew.map((p) => (
                    <div key={p} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0 text-sm text-emerald-700">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" /> {p}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 relative">
            {/* Line */}
            <div className="hidden md:block absolute top-9 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-gradient-to-r from-blue-100 via-primary to-blue-100" />
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.1} className="text-center px-6 py-8 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 font-display text-7xl font-extrabold text-blue-50 select-none pointer-events-none">{s.num}</div>
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 relative z-10 shadow-[0_8px_24px_rgba(37,99,235,0.3)]">
                  {s.icon}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
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
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[560px]">Dez módulos integrados em uma plataforma. Cada um resolve uma dor específica do dia a dia.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {modules.map((m, i) => (
              <Reveal key={m.name} delay={(i % 3) * 0.1}>
                <div className="bg-card border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-transparent group">
                  <div className={`h-1 ${m.accent} group-hover:h-1.5 transition-all`} />
                  <div className="p-6 pt-7">
                    <m.icon className="h-7 w-7 text-muted-foreground mb-3.5" />
                    <span className={`inline-block text-[0.65rem] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full mb-2.5 ${m.tagColor}`}>{m.tag}</span>
                    <h3 className="font-display font-bold text-base mb-2">{m.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              </Reveal>
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
      <section id="precos" className="py-24 px-[5%] bg-white">
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center">
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-primary mb-4 block">Preços</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">Simples e transparente</h2>
            <p className="text-lg text-muted-foreground mx-auto max-w-[560px]">Comece grátis. Faça upgrade quando precisar. Cancele quando quiser.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 items-center">
            {pricingPlans.map((plan, i) => (
              <Reveal key={plan.key} delay={i * 0.1}>
                <div className={`rounded-2xl p-8 transition-all hover:shadow-lg ${
                  plan.featured
                    ? "bg-gradient-to-br from-blue-800 to-primary text-white shadow-[0_20px_60px_rgba(37,99,235,0.35)] md:scale-[1.04]"
                    : "bg-card border"
                }`}>
                  {plan.badge && (
                    <span className="inline-block bg-amber-400 text-amber-900 text-[0.7rem] font-bold px-2.5 py-1 rounded-full mb-2">{plan.badge}</span>
                  )}
                  <div className={`text-xs font-bold tracking-[0.1em] uppercase mb-2 ${plan.featured ? "text-white/70" : "text-muted-foreground"}`}>{plan.label}</div>
                  <div className={`font-display text-4xl font-extrabold leading-none mb-1 ${plan.featured ? "text-white" : ""}`}>{plan.price}</div>
                  <div className={`text-sm mb-6 ${plan.featured ? "text-white/70" : "text-muted-foreground"}`}>{plan.period}</div>
                  <div className={`h-px mb-6 ${plan.featured ? "bg-white/20" : "bg-border"}`} />
                  <ul className="space-y-2.5 mb-7">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.featured ? "text-white/90" : "text-muted-foreground"}`}>
                        <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[0.6rem] flex-shrink-0 ${plan.featured ? "bg-white/20 text-white" : "bg-emerald-500/15 text-emerald-500"}`}>
                          <Check className="h-3 w-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/cadastro">
                    <Button className={`w-full ${plan.featured ? "bg-white text-primary hover:bg-white/90 shadow-md" : ""}`} variant={plan.featured ? "secondary" : "outline"}>
                      Começar grátis{plan.featured && " →"}
                    </Button>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              💳 Pagamentos serão ativados em breve.<br />
              Crie sua conta agora e aproveite o trial completo gratuitamente.
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

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="py-14 px-[5%] border-t" style={{ background: "#070D1A", borderColor: "#1E293B" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
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
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">Acesso</div>
              <ul className="space-y-2.5">
                <li><Link to="/cadastro" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Criar conta</Link></li>
                <li><Link to="/login" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Entrar</Link></li>
                <li><Link to="/cadastro" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">Trial grátis</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">Contato</div>
              <ul className="space-y-2.5">
                <li><a href="mailto:contato@evitahse.com.br" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">contato@evitahse.com.br</a></li>
                <li><span className="text-sm text-slate-500">Suporte em português</span></li>
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
