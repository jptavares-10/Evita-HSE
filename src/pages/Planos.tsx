import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useState } from "react";

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
    cta: null,
  },
  {
    key: "starter",
    label: "Starter",
    priceMonthly: "R$ 97",
    priceAnnual: "R$ 970",
    period: "/mês",
    periodAnnual: "/ano",
    users: "Até 5 usuários",
    storage: "5GB storage",
    features: [
      "Serviços Periódicos",
      "Treinamentos (completo)",
      "IC & NC",
      "ASO / Exames",
      "Suporte por e-mail",
    ],
    ctaUp: "Fazer upgrade",
    ctaDown: "Fazer downgrade",
  },
  {
    key: "professional",
    label: "Professional",
    priceMonthly: "R$ 247",
    priceAnnual: "R$ 2.470",
    period: "/mês",
    periodAnnual: "/ano",
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
    ctaUp: "Fazer upgrade",
    ctaDown: "Fazer downgrade",
    highlight: true,
  },
  {
    key: "enterprise",
    label: "Enterprise",
    priceMonthly: "R$ 497",
    priceAnnual: "R$ 4.970",
    period: "/mês",
    periodAnnual: "/ano",
    users: "Usuários ilimitados",
    storage: "100GB storage",
    features: [
      "Tudo do Professional",
      "Múltiplas unidades (em breve)",
      "Usuários ilimitados",
      "Suporte SLA 24h",
      "Onboarding assistido",
    ],
    ctaUp: "Fazer upgrade",
    ctaDown: "Fazer downgrade",
  },
];

const planOrder = ["trial", "starter", "professional", "enterprise"];

export default function Planos() {
  usePageTitle("Planos — Evita HSE");
  const { company } = useAuth();
  const { plan: currentPlan } = usePlan();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const currentPlanIndex = planOrder.indexOf(currentPlan || "trial");

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Planos</h1>
        <p className="text-muted-foreground mt-1">
          Escolha o plano ideal para sua empresa.
        </p>
      </div>

      {/* Toggle Mensal / Anual */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setBilling("monthly")}
          className={cn(
            "px-4 py-2 rounded-l-lg text-sm font-medium border transition-colors",
            billing === "monthly"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:bg-accent"
          )}
        >
          Mensal
        </button>
        <button
          onClick={() => setBilling("annual")}
          className={cn(
            "px-4 py-2 rounded-r-lg text-sm font-medium border transition-colors relative",
            billing === "annual"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:bg-accent"
          )}
        >
          Anual
          {billing === "annual" && (
            <Badge className="absolute -top-3 -right-3 text-[10px] bg-green-600 hover:bg-green-600 text-white">
              2 meses grátis
            </Badge>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => {
          const isCurrent = (currentPlan || company?.plan) === plan.key;
          const planIndex = planOrder.indexOf(plan.key);
          const isUpgrade = planIndex > currentPlanIndex;
          const isDowngrade = planIndex < currentPlanIndex;

          const price = billing === "annual" && plan.priceAnnual
            ? plan.priceAnnual
            : plan.priceMonthly;
          const periodLabel = billing === "annual" && plan.periodAnnual
            ? plan.periodAnnual
            : plan.period;

          return (
            <div
              key={plan.key}
              className={cn(
                "relative bg-card border rounded-lg p-5 flex flex-col",
                plan.highlight && "border-primary shadow-md ring-1 ring-primary/20"
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  ⭐ Recomendado
                </span>
              )}

              <h3 className="text-lg font-bold">{plan.label}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{price}</span>
                {periodLabel && (
                  <span className="text-muted-foreground text-sm">{periodLabel}</span>
                )}
              </div>
              {billing === "annual" && plan.key !== "trial" && (
                <Badge variant="outline" className="mt-1 w-fit text-[10px] text-green-600 border-green-600/30">
                  2 meses grátis
                </Badge>
              )}
              <p className="text-sm text-muted-foreground mt-1">{plan.users}</p>
              <p className="text-xs text-muted-foreground">{plan.storage}</p>

              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {isCurrent ? (
                  <div className="text-center text-sm font-medium text-primary bg-primary/10 rounded-md py-2">
                    Seu plano atual
                  </div>
                ) : plan.key === "trial" ? (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    Plano de avaliação
                  </div>
                ) : isUpgrade ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="w-full"
                        disabled
                        variant={plan.highlight ? "default" : "outline"}
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
                      <Button className="w-full" disabled variant="outline">
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

      <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        Pagamentos serão ativados em breve. Crie sua conta agora e aproveite o trial
        completo. Entre em contato para condições especiais de lançamento.
      </p>
    </div>
  );
}
