import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";
import { Check, CalendarClock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const plans = [
  {
    key: "trial",
    label: "Trial",
    priceMonthly: "Grátis",
    priceAnnual: "Grátis",
    period: "14 dias",
    users: "Até 2 usuários",
    storage: "5GB storage",
    features: [
      "Acesso completo a todos os módulos",
      "Suporte por e-mail",
    ],
  },
  {
    key: "starter",
    label: "Starter",
    priceMonthly: 97,
    priceAnnual: 970,
    users: "Até 5 usuários",
    storage: "5GB storage",
    features: [
      "Serviços Periódicos",
      "Treinamentos (completo)",
      "IC & NC",
      "ASO / Exames",
      "Suporte por e-mail",
    ],
  },
  {
    key: "professional",
    label: "Professional",
    priceMonthly: 247,
    priceAnnual: 2470,
    users: "Até 10 usuários",
    storage: "20GB storage",
    features: [
      "Todos os módulos do Starter",
      "MTR + Licenças Ambientais",
      "Fornecedores + Portal externo",
      "Biblioteca de Documentos",
      "Inspeções de Segurança",
      "EPIs (Catálogo, Estoque, Entregas)",
      "Sistema de permissões por módulo",
      "Suporte com SLA 48h",
    ],
    highlight: true,
  },
  {
    key: "enterprise",
    label: "Enterprise",
    priceMonthly: 497,
    priceAnnual: 4970,
    users: "Usuários ilimitados",
    storage: "100GB storage",
    features: [
      "Tudo do Professional",
      "Múltiplas unidades (em breve)",
      "Usuários ilimitados",
      "Suporte SLA 24h",
      "Onboarding assistido",
    ],
  },
];

const planOrder = ["trial", "starter", "professional", "enterprise"];

export default function Planos() {
  usePageTitle("Planos — Evita HSE");
  const { company } = useAuth();
  const { plan: currentPlan } = usePlan();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const isAnnual = billing === "annual";

  const currentPlanIndex = planOrder.indexOf(currentPlan || "trial");

  return (
    <div className="min-h-full" style={{ background: "#F8FAFC" }}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-tight">Planos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha o plano ideal para sua empresa.
          </p>
        </div>

        {/* Toggle Mensal / Anual */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-semibold transition-colors duration-200 ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Mensal
          </span>
          <button
            onClick={() => setBilling(isAnnual ? "monthly" : "annual")}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${isAnnual ? "bg-primary" : "bg-muted-foreground/30"}`}
            aria-label="Alternar entre mensal e anual"
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${isAnnual ? "translate-x-7" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Anual
            {isAnnual && (
              <span className="bg-emerald-100 text-emerald-700 text-[0.7rem] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                2 meses grátis
              </span>
            )}
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {plans.map((plan) => {
            const isCurrent = (currentPlan || company?.plan) === plan.key;
            const planIndex = planOrder.indexOf(plan.key);
            const isUpgrade = planIndex > currentPlanIndex;
            const isDowngrade = planIndex < currentPlanIndex;
            const isTrial = plan.key === "trial";
            const isHighlight = plan.highlight;

            const monthlyNum = typeof plan.priceMonthly === "number" ? plan.priceMonthly : 0;
            const annualNum = typeof plan.priceAnnual === "number" ? plan.priceAnnual : 0;
            const equivMonthly = annualNum > 0 ? Math.round(annualNum / 12) : 0;

            return (
              <div
                key={plan.key}
                className={`relative rounded-xl p-6 flex flex-col transition-all duration-200 ${
                  isHighlight
                    ? "bg-gradient-to-br from-[#1E40AF] to-[#2563EB] text-white border-2 border-white/30 shadow-[0_4px_24px_rgba(37,99,235,0.25)]"
                    : "bg-white border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                }`}
              >
                {isHighlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-amber-900 text-[0.65rem] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                    ⭐ Recomendado
                  </span>
                )}

                {/* Plan label */}
                <div className={`text-[11px] font-bold tracking-[0.1em] uppercase mb-3 ${
                  isHighlight ? "text-white/70" : isTrial ? "text-muted-foreground" : "text-primary"
                }`}>
                  {plan.label}
                </div>

                {/* Price */}
                <div className="mb-1">
                  {isTrial ? (
                    <div>
                      <span className="text-[32px] font-bold leading-none">Grátis</span>
                      <p className={`text-sm mt-1 ${isHighlight ? "text-white/60" : "text-muted-foreground"}`}>14 dias</p>
                    </div>
                  ) : isAnnual ? (
                    <div style={{ transition: "opacity 0.2s ease" }}>
                      <div className="flex items-baseline gap-1">
                        <span className={`font-display text-[32px] font-bold leading-none`}>
                          R$ {annualNum.toLocaleString("pt-BR")}
                        </span>
                        <span className={`text-sm ${isHighlight ? "text-white/70" : "text-muted-foreground"}`}>/ano</span>
                      </div>
                      <span className={`inline-block mt-1.5 text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                        isHighlight ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        2 meses grátis
                      </span>
                      <p className={`text-xs mt-1 ${isHighlight ? "text-white/50" : "text-muted-foreground"}`}>
                        equivale a R$ {equivMonthly}/mês
                      </p>
                    </div>
                  ) : (
                    <div style={{ transition: "opacity 0.2s ease" }}>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-[32px] font-bold leading-none">
                          R$ {monthlyNum}
                        </span>
                        <span className={`text-sm ${isHighlight ? "text-white/70" : "text-muted-foreground"}`}>/mês</span>
                      </div>
                    </div>
                  )}
                </div>

                <p className={`text-sm mt-1 ${isHighlight ? "text-white/60" : "text-muted-foreground"}`}>{plan.users}</p>
                <p className={`text-xs ${isHighlight ? "text-white/50" : "text-muted-foreground"}`}>{plan.storage}</p>

                <div className={`h-px my-4 ${isHighlight ? "bg-white/20" : "bg-[#E2E8F0]"}`} />

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${isHighlight ? "text-white/90" : "text-[#374151]"}`}>
                      <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isHighlight
                          ? "bg-white/20 text-white"
                          : isTrial
                            ? "bg-muted text-muted-foreground"
                            : "bg-emerald-500/15 text-emerald-500"
                      }`}>
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-5">
                  {isCurrent ? (
                    <div className={`text-center text-sm font-semibold rounded-md py-2.5 ${
                      isHighlight
                        ? "bg-white/20 text-white"
                        : "bg-[#EFF6FF] text-primary border border-[#BFDBFE]"
                    }`}>
                      Seu plano atual
                    </div>
                  ) : isTrial ? (
                    <div className="text-center text-sm text-muted-foreground py-2.5 bg-muted/50 rounded-md">
                      Plano de avaliação
                    </div>
                  ) : isUpgrade ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className={`w-full font-semibold ${
                            isHighlight
                              ? "bg-white text-[#1E40AF] hover:bg-white/90 shadow-md"
                              : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          }`}
                          disabled
                          variant={isHighlight ? "secondary" : "outline"}
                        >
                          Fazer upgrade
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Pagamentos em breve. Entre em contato.
                      </TooltipContent>
                    </Tooltip>
                  ) : isDowngrade ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className="w-full font-semibold" disabled variant="outline">
                          Fazer downgrade
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Para downgrade entre em contato.
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-[13px] text-muted-foreground max-w-[500px] mx-auto">
          Pagamentos serão ativados em breve. Crie sua conta agora e aproveite o trial
          completo. Entre em contato para condições especiais de lançamento.
        </p>
      </div>
    </div>
  );
}
