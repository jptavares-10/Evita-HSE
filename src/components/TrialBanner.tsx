import { usePlan } from "@/hooks/usePlan";
import { Link } from "react-router-dom";
import { Clock, AlertTriangle } from "lucide-react";

export function TrialBanner() {
  const { status, daysRemaining, loading } = usePlan();

  if (loading) return null;

  if (status === "expired") {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-3 flex items-center gap-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-destructive font-medium">
          Seu acesso expirou. Escolha um plano para continuar usando o Evita HSE.
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

  if (status === "grace") {
    return (
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3 flex items-center gap-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
        <span className="text-yellow-700 dark:text-yellow-400 font-medium">
          Seu plano expirou. Você tem{" "}
          <strong>{daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}</strong>{" "}
          para renovar antes de perder o acesso.
        </span>
        <Link
          to="/planos"
          className="ml-auto text-yellow-700 dark:text-yellow-400 underline underline-offset-2 font-medium hover:opacity-80 transition-opacity"
        >
          Renovar agora →
        </Link>
      </div>
    );
  }

  if (status === "trial") {
    return (
      <div className="bg-primary/5 border-b border-primary/10 px-6 py-3 flex items-center gap-3 text-sm">
        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-foreground">
          Você está no período trial —{" "}
          <strong className="text-primary">
            {daysRemaining} {daysRemaining === 1 ? "dia restante" : "dias restantes"}
          </strong>
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

  // status === "active" → no banner
  return null;
}
