import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { Clock, AlertTriangle } from "lucide-react";

export function TrialBanner() {
  const { company } = useAuth();

  if (!company) return null;

  if (company.plan === "expired") {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-3 flex items-center gap-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-destructive font-medium">
          Seu trial expirou. Escolha um plano para continuar.
        </span>
        <Link
          to="/planos"
          className="ml-auto text-destructive underline underline-offset-2 font-medium hover:opacity-80 transition-opacity"
        >
          Ver planos →
        </Link>
      </div>
    );
  }

  if (company.plan === "trial" && company.trial_ends_at) {
    const daysLeft = differenceInDays(new Date(company.trial_ends_at), new Date());

    if (daysLeft < 0) return null;

    return (
      <div className="bg-primary/5 border-b border-primary/10 px-6 py-3 flex items-center gap-3 text-sm">
        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-foreground">
          Você está no período trial —{" "}
          <strong className="text-primary">{daysLeft} {daysLeft === 1 ? "dia restante" : "dias restantes"}</strong>
        </span>
        <Link
          to="/planos"
          className="ml-auto text-primary underline underline-offset-2 font-medium hover:opacity-80 transition-opacity"
        >
          Conheça os planos →
        </Link>
      </div>
    );
  }

  return null;
}
