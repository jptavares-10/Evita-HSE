import { Link } from "react-router-dom";
import { Calendar, ClipboardCheck, AlertTriangle, HardHat, BookOpen, GraduationCap, Stethoscope, Recycle, FileText, Users, ArrowRight, Shield, HeartPulse, Leaf } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { Reveal } from "@/components/landing/Reveal";
import { LandingCTA } from "@/components/landing/LandingCTA";

const groups = [
  {
    label: "Segurança",
    pillIcon: Shield,
    modules: [
      { icon: Calendar, slug: "servicos-periodicos", name: "Serviços Periódicos", desc: "Controle extintores, dedetização e serviços recorrentes com alertas automáticos." },
      { icon: ClipboardCheck, slug: "inspecoes", name: "Inspeções de Segurança", desc: "Modelos de inspeção, execuções com fotos e ações corretivas rastreáveis." },
      { icon: AlertTriangle, slug: "incidentes", name: "IC & NC", desc: "Registro de incidentes e não conformidades com plano de ação corretiva." },
      { icon: HardHat, slug: "epi", name: "Gestão de EPIs", desc: "Catálogo com CA, estoque, entregas por colaborador e alertas de vencimento." },
      { icon: BookOpen, slug: "documentos", name: "Biblioteca de Documentos", desc: "Centralize PGR, PCMSO e procedimentos com controle de revisões." },
    ],
  },
  {
    label: "Saúde",
    pillIcon: HeartPulse,
    modules: [
      { icon: GraduationCap, slug: "treinamentos", name: "Treinamentos", desc: "Matriz por cargo, certificados com validade e dashboard de conformidade NR." },
      { icon: Stethoscope, slug: "aso", name: "ASO / Exames Ocupacionais", desc: "Exames admissionais, periódicos e demissionais com alertas de vencimento." },
    ],
  },
  {
    label: "Meio Ambiente",
    pillIcon: Leaf,
    modules: [
      { icon: Recycle, slug: "mtr", name: "Gestão de MTR", desc: "MTR com prazo de CDF monitorado, alertas e gráficos por categoria de resíduo." },
      { icon: FileText, slug: "licencas", name: "Licenças Ambientais", desc: "LO, LI, outorgas e autorizações com histórico de renovações e alertas." },
      { icon: Users, slug: "fornecedores", name: "Portal de Fornecedores", desc: "Link único para fornecedor enviar documentos. Sem WhatsApp, sem e-mail." },
    ],
  },
];

export default function Funcionalidades() {
  usePageTitle("Funcionalidades — Todos os Módulos do Evita HSE", {
    description: "Conheça os 10 módulos integrados do Evita HSE: serviços periódicos, inspeções, EPIs, treinamentos, ASO, MTR, licenças ambientais, documentos, incidentes e portal de fornecedores.",
  });

  return (
    <LandingLayout>
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-6 lg:px-8 overflow-hidden">
        <div aria-hidden className="absolute inset-0 lp-mesh-bg pointer-events-none" />
        <div aria-hidden className="absolute inset-0 lp-grid-bg pointer-events-none opacity-40" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-lp-emerald/30 bg-lp-emerald/10 px-3 py-1.5 text-xs font-medium text-lp-emerald mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-lp-emerald" />
              10 módulos integrados
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="font-lp-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-lp-ink mb-5">
              Todos os módulos do{" "}
              <span className="bg-gradient-to-r from-lp-emerald via-lp-emerald-glow to-lp-emerald bg-clip-text text-transparent">Evita HSE</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg text-lp-muted leading-relaxed max-w-2xl mx-auto mb-8">
              Dez módulos integrados para gestão completa de Segurança do Trabalho, Saúde Ocupacional e Meio Ambiente.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link to="/cadastro" className="group inline-flex items-center gap-2 px-6 py-3 bg-lp-emerald text-lp-bg font-medium rounded-lg hover:bg-lp-emerald-glow transition-all lp-glow">
              Começar grátis — 14 dias
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Module groups */}
      {groups.map((group) => {
        const Pill = group.pillIcon;
        return (
          <section key={group.label} className="py-20 px-6 lg:px-8 border-t border-lp-border">
            <div className="max-w-6xl mx-auto">
              <Reveal className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-lp-emerald/10 text-lp-emerald text-xs font-medium mb-3">
                  <Pill className="h-3.5 w-3.5" />
                  {group.label}
                </div>
                <h2 className="font-lp-display text-3xl md:text-4xl font-semibold tracking-tight text-lp-ink">
                  {group.label}.
                </h2>
              </Reveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.modules.map((m, i) => (
                  <Reveal key={m.slug} delay={i * 0.05}>
                    <Link to={`/funcionalidades/${m.slug}`} className="block h-full">
                      <div className="lp-card rounded-2xl p-6 h-full flex flex-col transition-all group">
                        <div className="w-11 h-11 rounded-lg bg-lp-emerald/10 border border-lp-emerald/20 flex items-center justify-center mb-4">
                          <m.icon className="h-5 w-5 text-lp-emerald" />
                        </div>
                        <h3 className="font-lp-display text-lg font-semibold text-lp-ink mb-2">{m.name}</h3>
                        <p className="text-sm text-lp-muted leading-relaxed flex-1">{m.desc}</p>
                        <span className="text-sm font-medium text-lp-emerald mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          Saiba mais <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <LandingCTA />
    </LandingLayout>
  );
}
