import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

const plans = [
  {
    key: "trial",
    label: "Trial",
    price: "Grátis",
    period: "14 dias",
    users: "Até 2 usuários",
    features: ["Todos os módulos", "Suporte por e-mail"],
    cta: null,
  },
  {
    key: "basic",
    label: "Basic",
    price: "R$ 79",
    period: "/mês",
    users: "Até 5 usuários",
    features: ["Todos os módulos", "Suporte prioritário"],
    cta: "Assinar Basic",
  },
  {
    key: "pro",
    label: "Pro",
    price: "R$ 149",
    period: "/mês",
    users: "Usuários ilimitados",
    features: ["Todos os módulos", "Portal do Fornecedor", "Suporte dedicado"],
    cta: "Assinar Pro",
    highlight: true,
  },
];

export default function Planos() {
  usePageTitle("Planos — Evita HSE");
  const { company } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Planos</h1>
        <p className="text-muted-foreground mt-1">Escolha o plano ideal para sua empresa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = company?.plan === plan.key;

          return (
            <div
              key={plan.key}
              className={cn(
                "relative bg-card border rounded-lg p-6 flex flex-col",
                plan.highlight && "border-primary shadow-md ring-1 ring-primary/20"
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Recomendado
                </span>
              )}

              <h3 className="text-lg font-bold">{plan.label}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{plan.users}</p>

              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <div className="text-center text-sm font-medium text-primary bg-primary/10 rounded-md py-2">
                    Seu plano atual
                  </div>
                ) : plan.cta ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button className="w-full" disabled variant={plan.highlight ? "default" : "outline"}>
                        {plan.cta}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Em breve</TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    Plano de avaliação
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Os pagamentos serão ativados em breve. Entre em contato para condições especiais.
      </p>
    </div>
  );
}
