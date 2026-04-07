import { Link } from "react-router-dom";
import { Calendar, ClipboardCheck, AlertTriangle, HardHat, BookOpen, GraduationCap, Stethoscope, Recycle, FileText, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { Reveal } from "@/components/landing/Reveal";
import { LandingCTA } from "@/components/landing/LandingCTA";

const groups = [
  {
    label: "Segurança",
    color: "bg-red-500",
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
    color: "bg-amber-500",
    modules: [
      { icon: GraduationCap, slug: "treinamentos", name: "Treinamentos", desc: "Matriz por cargo, certificados com validade e dashboard de conformidade NR." },
      { icon: Stethoscope, slug: "aso", name: "ASO / Exames Ocupacionais", desc: "Exames admissionais, periódicos e demissionais com alertas de vencimento." },
    ],
  },
  {
    label: "Meio Ambiente",
    color: "bg-emerald-500",
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
      <section className="relative py-20 px-[5%] overflow-hidden" style={{ background: "linear-gradient(135deg, #070D1A 0%, #0A1628 40%, #0F1F3D 70%, #0D2451 100%)" }}>
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-[800px] mx-auto text-center">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
            Todos os módulos do{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Evita HSE</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-[600px] mx-auto mb-9">
            Dez módulos integrados para gestão completa de Segurança do Trabalho, Saúde Ocupacional e Meio Ambiente.
          </p>
          <Link to="/cadastro">
            <Button size="lg" className="text-base px-7 shadow-[0_4px_24px_rgba(37,99,235,0.4)]">
              Começar grátis — 14 dias <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Module groups */}
      {groups.map((group) => (
        <section key={group.label} className="py-20 px-[5%] bg-white even:bg-muted/30">
          <div className="max-w-[1200px] mx-auto">
            <Reveal>
              <div className="flex items-center gap-3 mb-10">
                <div className={`w-3 h-3 rounded-full ${group.color}`} />
                <h2 className="font-display text-2xl font-extrabold">{group.label}</h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.modules.map((m, i) => (
                <Reveal key={m.slug} delay={i * 0.08}>
                  <Link to={`/funcionalidades/${m.slug}`} className="block h-full">
                    <div className="bg-card border rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 group h-full flex flex-col">
                      <m.icon className="h-7 w-7 text-muted-foreground mb-3.5 group-hover:text-primary transition-colors" />
                      <h3 className="font-display font-bold text-base mb-2">{m.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{m.desc}</p>
                      <span className="text-sm font-semibold text-primary mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Saiba mais <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      <LandingCTA />
    </LandingLayout>
  );
}
