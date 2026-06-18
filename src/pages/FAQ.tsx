import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowLeft, Search } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { Input } from "@/components/ui/input";

const faqCategories = [
  {
    label: "Sobre o Evita HSE",
    faqs: [
      { q: "Preciso instalar algum programa?", a: "Não. O Evita HSE é 100% na nuvem. Funciona em qualquer navegador, em computador ou celular." },
      { q: "Meus dados ficam seguros?", a: "Sim. Cada empresa tem seus dados isolados por Row Level Security. Documentos são armazenados em buckets privados com URLs temporárias." },
      { q: "Posso ter mais de um usuário?", a: "Sim. Trial suporta até 2, Starter até 5, Professional até 10 e Enterprise é ilimitado. Convite pelo próprio sistema." },
      { q: "Funciona para qualquer segmento?", a: "Sim. Construção civil, indústria, facilities, mineração, saúde, logística e mais." },
      { q: "Plataforma online de gestão de saúde e segurança do trabalho?", a: "O Evita HSE é uma plataforma 100% online de gestão HSE. Sem instalação, sem servidor próprio. Acesse de qualquer lugar, a qualquer hora, com dados seguros na nuvem." },
    ],
  },
  {
    label: "Planos e pagamento",
    faqs: [
      { q: "O que acontece quando o trial acaba?", a: "Seu acesso entra em modo leitura. Seus dados ficam preservados enquanto você decide sobre o plano." },
      { q: "O que acontece com meus dados se eu não renovar?", a: "Seus dados ficam preservados por 90 dias após o vencimento do plano. Durante esse período, você pode visualizar tudo mas não criar ou editar novos registros. Após 90 dias sem renovação, os dados podem ser removidos." },
      { q: "Posso fazer upgrade ou downgrade a qualquer momento?", a: "Sim. Upgrade tem efeito imediato — você ganha acesso aos novos módulos na hora. Downgrade entra em vigor no próximo ciclo de cobrança. Módulos que você usava mas não estão no novo plano ficam em modo visualização." },
      { q: "Qual a diferença entre plano mensal e anual?", a: "O plano anual equivale a 10 meses pelo preço de 12 — você economiza 2 meses. O valor é cobrado uma vez por ano. Ambos têm os mesmos recursos e limites." },
      { q: "Existe software para controle de EPI gratuito?", a: "O Evita HSE oferece 14 dias de teste grátis com acesso completo, incluindo gestão de EPIs com catálogo, controle de estoque, entregas e alertas de CA. Após o trial, planos a partir de R$ 97/mês." },
    ],
  },
  {
    label: "Módulos e funcionalidades",
    faqs: [
      { q: "Como controlar a segurança do trabalho na minha empresa?", a: "Com o Evita HSE você centraliza tudo: treinamentos NR, EPIs, inspeções, documentos e incidentes em um único software. Alertas automáticos garantem que nada vença sem você saber." },
      { q: "Qual o melhor software de gestão de segurança do trabalho?", a: "O Evita HSE é uma plataforma completa de gestão de SST, projetada para empresas brasileiras. Integra 10 módulos — de treinamentos a licenças ambientais — sem precisar de várias ferramentas separadas." },
      { q: "Como fazer gestão de treinamentos NR na empresa?", a: "O módulo de treinamentos do Evita HSE organiza uma matriz por cargo, registra certificados com validade e mostra em tempo real quem está em dia e quem precisa reciclar. Funciona para NR-10, NR-35, NR-33 e todas as outras." },
      { q: "Software para controle de MTR e resíduos sólidos?", a: "O Evita HSE tem módulo dedicado para gestão de MTR com monitoramento de prazo de CDF, alertas automáticos e gráficos de geração mensal por categoria de resíduo. Tudo conforme a legislação ambiental." },
      { q: "Como organizar documentos de segurança do trabalho?", a: "A Biblioteca de Documentos do Evita HSE centraliza PGR, PCMSO, procedimentos e políticas com controle de revisões, ciclo de aprovação e histórico completo. Acabou a confusão de pastas no computador." },
      { q: "Sistema para controle de licenças ambientais?", a: "O Evita HSE gerencia LO, LI, outorgas e autorizações com alertas de vencimento configuráveis, histórico de renovações e documentos anexados. Nunca mais perca o prazo de uma licença." },
      { q: "Como registrar e controlar incidentes e não conformidades?", a: "O módulo de IC & NC do Evita HSE permite registrar ocorrências com evidências fotográficas, criar planos de ação corretiva, acompanhar status e manter rastreabilidade completa." },
      { q: "Como funciona o portal de fornecedores?", a: "Você gera um link único. O fornecedor acessa sem criar conta e envia documentos organizados em pastas. Sem WhatsApp ou e-mail." },
      { q: "Como fazer inspeções de segurança digitais?", a: "O módulo de inspeções do Evita HSE permite criar modelos com frequência automática, registrar execuções com fotos e gerar ações corretivas rastreáveis. Tudo digital, sem papel." },
      { q: "Sistema de gestão de ASO e exames ocupacionais?", a: "O Evita HSE registra exames admissionais, periódicos, demissionais e de retorno. Cada colaborador tem histórico completo, e o sistema alerta quando um exame está próximo do vencimento." },
      { q: "Como automatizar alertas de vencimento de documentos e treinamentos?", a: "O Evita HSE envia alertas automáticos configuráveis antes do vencimento de qualquer item: treinamentos, ASOs, CAs de EPIs, licenças ambientais, serviços periódicos e prazos de CDF." },
    ],
  },
  {
    label: "Por segmento",
    faqs: [
      { q: "Software de SST para construção civil?", a: "O Evita HSE atende construção civil com todos os módulos necessários: inspeções de campo, controle de EPI por colaborador, treinamentos NR obrigatórios, gestão de fornecedores e documentos técnicos." },
      { q: "Software para gestão de fornecedores em SST?", a: "O portal de fornecedores do Evita HSE permite que cada fornecedor envie documentos por um link exclusivo, sem WhatsApp ou e-mail. Tudo organizado em pastas por fornecedor." },
    ],
  },
];

const allFaqs = faqCategories.flatMap((c) => c.faqs);

export default function FAQ() {
  usePageTitle("Perguntas Frequentes — Evita HSE", {
    description: "Tire suas dúvidas sobre o Evita HSE: software de gestão de SST, controle de EPIs, treinamentos NR, MTR, licenças ambientais, inspeções e mais. FAQ completo.",
    breadcrumbs: [
      { name: "Início", url: "https://evita-hse-br.lovable.app/" },
      { name: "Perguntas Frequentes", url: "https://evita-hse-br.lovable.app/faq" },
    ],
  });

  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Inject FAQ JSON-LD with ALL questions
  useEffect(() => {
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: allFaqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-page-jsonld";
    script.textContent = JSON.stringify(faqJsonLd);
    document.head.appendChild(script);
    return () => { document.getElementById("faq-page-jsonld")?.remove(); };
  }, []);

  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (f) =>
          (!search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())) &&
          (!activeCategory || activeCategory === cat.label)
      ),
    }))
    .filter((cat) => cat.faqs.length > 0);

  return (
    <LandingLayout>
      <section className="relative pt-20 pb-12 px-6 lg:px-8 overflow-hidden">
        <div aria-hidden className="absolute inset-0 lp-mesh-bg pointer-events-none" />
        <div aria-hidden className="absolute inset-0 lp-grid-bg pointer-events-none opacity-40" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-lp-muted hover:text-lp-emerald transition-colors mb-8">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao início
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-lp-emerald/30 bg-lp-emerald/10 px-3 py-1.5 text-xs font-medium text-lp-emerald mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-lp-emerald" />
            FAQ
          </div>
          <h1 className="font-lp-display text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] text-lp-ink mb-4">
            Perguntas frequentes.
          </h1>
          <p className="text-lg text-lp-muted max-w-xl mb-8">
            Tudo que você precisa saber sobre o Evita HSE e gestão de SST e meio ambiente.
          </p>

          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-lp-muted" />
            <Input
              placeholder="Buscar pergunta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-lp-surface border-lp-border text-lp-ink placeholder:text-lp-muted focus-visible:ring-lp-emerald/40"
            />
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-24 border-t border-lp-border">
        <div className="max-w-3xl mx-auto pt-10">
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                !activeCategory
                  ? "bg-lp-emerald text-lp-bg border-lp-emerald"
                  : "bg-lp-surface border-lp-border text-lp-muted hover:border-lp-emerald/40 hover:text-lp-ink"
              }`}
            >
              Todas
            </button>
            {faqCategories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeCategory === cat.label
                    ? "bg-lp-emerald text-lp-bg border-lp-emerald"
                    : "bg-lp-surface border-lp-border text-lp-muted hover:border-lp-emerald/40 hover:text-lp-ink"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <p className="text-center text-lp-muted py-12">Nenhuma pergunta encontrada para "{search}"</p>
          )}

          {filteredCategories.map((cat) => (
            <div key={cat.label} className="mb-10">
              <h2 className="font-lp-display font-semibold text-xl text-lp-ink mb-4">{cat.label}</h2>
              <div className="space-y-2">
                {cat.faqs.map((faq) => {
                  const key = faq.q;
                  const isOpen = openFaq === key;
                  return (
                    <div key={key} className="rounded-lg border border-lp-border bg-lp-surface/40 overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                        onClick={() => setOpenFaq(isOpen ? null : key)}
                        aria-expanded={isOpen}
                      >
                        <span className="text-lp-ink font-medium text-[0.95rem]">{faq.q}</span>
                        <Plus className={`h-4 w-4 text-lp-muted shrink-0 transition-transform ${isOpen ? "rotate-45 text-lp-emerald" : ""}`} />
                      </button>
                      <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <p className="px-5 pb-5 text-sm text-lp-muted leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </LandingLayout>
  );
}