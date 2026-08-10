import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { Reveal } from "@/components/landing/Reveal";
import { LandingCTA } from "@/components/landing/LandingCTA";

const groups = [
  {
    label: "Segurança",
    headline: "Ninguém se acidenta por falta de controle.",
    sub: "Do extintor à investigação de incidente: cinco módulos que fecham o ciclo de prevenção.",
    modules: [
      { slug: "servicos-periodicos", eyebrow: "Serviços Periódicos", name: "Nada recorrente passa batido.", desc: "Extintores, dedetização, laudos e manutenções com recorrência configurada e alerta antes do vencimento." },
      { slug: "inspecoes", eyebrow: "Inspeções", name: "A inspeção sai do papel e vira prova.", desc: "Modelos com frequência automática, execução em campo com foto e ação corretiva rastreada até fechar." },
      { slug: "incidentes", eyebrow: "IC & NC", name: "Investigação com método, não com achismo.", desc: "5 Porquês, Ishikawa e Bow-Tie ligados a plano 5W2H, hierarquia de controle e lições aprendidas." },
      { slug: "epi", eyebrow: "EPIs", name: "Entrega assinada, CA sempre válido.", desc: "Catálogo com CA, saldo de estoque, entrega assinada no tablet e ficha NR-6 pronta para fiscalização." },
      { slug: "documentos", eyebrow: "Biblioteca", name: "A revisão vigente, sempre à mão.", desc: "PGR, PCMSO, IT e APR com ciclo de revisão, versão obsoleta marcada e histórico completo." },
    ],
  },
  {
    label: "Saúde",
    headline: "Aptidão e capacitação em dia, sem caçar papel.",
    sub: "Quem pode trabalhar, em que função e até quando — respondido em uma tela.",
    modules: [
      { slug: "treinamentos", eyebrow: "Treinamentos", name: "A matriz cobra por você.", desc: "Treinamento obrigatório por cargo, certificado com validade e painel de conformidade NR por colaborador." },
      { slug: "aso", eyebrow: "ASO", name: "Exame ocupacional sem vencido escondido.", desc: "Admissional, periódico e demissional com validade, alerta antecipado e histórico por colaborador." },
    ],
  },
  {
    label: "Meio Ambiente",
    headline: "Órgão ambiental cobra prazo. Aqui o prazo é vigiado.",
    sub: "Licença, condicionante, resíduo e fornecedor sob a mesma trilha de evidência.",
    modules: [
      { slug: "mtr", eyebrow: "Resíduos & MTR", name: "CDF cobrado antes de virar multa.", desc: "Os 90 dias correm na tela, alerta em 83 dias e gráfico de geração mensal por categoria de resíduo." },
      { slug: "licencas", eyebrow: "Licenças Ambientais", name: "Condicionante com evidência anexada.", desc: "LO, LI e outorgas com prazos únicos, recorrentes ou contínuos, protocolo e conformidade medida." },
      { slug: "fornecedores", eyebrow: "Fornecedores", name: "Documento de terceiro sem grupo de WhatsApp.", desc: "Link único por fornecedor, pastas por categoria e envio seguro por token — sem criar conta." },
    ],
  },
];

export default function Funcionalidades() {
  usePageTitle("Funcionalidades — Módulos do Evita HSE", {
    description: "Conheça os 10 módulos do Evita HSE: serviços, inspeções, EPIs, treinamentos, ASO, MTR, licenças, documentos, incidentes e fornecedores.",
  });

  return (
    <LandingLayout>
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-6 lg:px-8 overflow-hidden">
        <div aria-hidden className="absolute inset-0 lp-mesh-bg pointer-events-none" />
        <div aria-hidden className="absolute inset-0 lp-grid-bg pointer-events-none opacity-40" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal delay={0.05}>
            <h1 className="font-lp-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-lp-ink mb-5">
              Dez módulos. Uma{" "}
              <span className="bg-gradient-to-r from-lp-emerald via-lp-emerald-glow to-lp-emerald bg-clip-text text-transparent">operação auditável</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg text-lp-muted leading-relaxed max-w-2xl mx-auto mb-8">
              Segurança do Trabalho, Saúde Ocupacional e Meio Ambiente no mesmo sistema — cada prazo com responsável, evidência e histórico.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link to="/cadastro" className="group inline-flex items-center gap-2 px-6 py-3 bg-lp-emerald text-lp-bg font-medium rounded-lg hover:bg-lp-emerald-glow transition-all lp-glow">
              Começar grátis — 14 dias
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Module groups */}
      {groups.map((group) => (
          <section key={group.label} className="py-20 px-6 lg:px-8 border-t border-lp-border">
            <div className="max-w-6xl mx-auto">
              <Reveal className="mb-12 max-w-2xl">
                <span className="lp-eyebrow">{group.label}</span>
                <h2 className="font-lp-display text-3xl md:text-4xl font-semibold tracking-tight text-lp-ink mt-5 leading-[1.1]">
                  {group.headline}
                </h2>
                <p className="text-lp-muted mt-4 leading-relaxed">{group.sub}</p>
              </Reveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {group.modules.map((m, i) => (
                  <Reveal key={m.slug} delay={i * 0.07} variant="blur" className={i % 3 === 1 ? "lg:mt-8" : i % 3 === 2 ? "lg:mt-16" : ""}>
                    <Link to={`/funcionalidades/${m.slug}`} className="block h-full">
                      <div className="group lp-card-bold rounded-[1.5rem] p-7 h-full flex flex-col">
                        <span aria-hidden className="lp-numeral font-lp-display text-[4.5rem]">{String(i + 1).padStart(2, "0")}</span>
                        <span className="lp-eyebrow relative">{m.eyebrow}</span>
                        <h3 className="relative font-lp-display text-xl font-semibold text-lp-ink mt-4 mb-2.5 leading-snug">{m.name}</h3>
                        <p className="relative text-sm text-lp-muted leading-relaxed flex-1">{m.desc}</p>
                        <span className="relative text-sm font-semibold text-lp-emerald mt-5 inline-flex items-center gap-1.5 group-hover:gap-3 transition-all">
                          Saiba mais <span aria-hidden>→</span>
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
