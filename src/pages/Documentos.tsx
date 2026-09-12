import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";
import { PageHeader } from "@/components/ui/page-header";
import { useMyPendingReviewCount } from "@/hooks/useDocumentReviews";
import { usePlan } from "@/hooks/usePlan";
import { Lock } from "lucide-react";

export default function Documentos() {
  usePageTitle("Documentos — Evita HSE", { description: "Biblioteca de documentos SST e revisões.", noindex: true });
  const location = useLocation();
  const pendingReviews = useMyPendingReviewCount();
  const { hasModule } = usePlan();
  const reviewLocked = !hasModule("document_review");

  const tabClass = (active: boolean) =>
    cn(
      "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5",
      active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Documentos"
        description="Biblioteca técnica, ciclos de revisão e pendências de revisão."
      />

      <nav className="flex gap-1 border-b">
        <NavLink to="/documentos" className={tabClass(location.pathname === "/documentos")}>
          Biblioteca
        </NavLink>
        {reviewLocked ? (
          <span
            title="Disponível em planos superiores"
            className="px-4 py-2.5 text-sm font-medium text-muted-foreground/60 cursor-not-allowed flex items-center gap-1.5 border-b-2 border-transparent -mb-px"
          >
            Revisões <Lock className="h-3 w-3" />
          </span>
        ) : (
          <NavLink
            to="/documentos/revisoes"
            className={tabClass(location.pathname.startsWith("/documentos/revisoes"))}
          >
            Revisões
            {pendingReviews > 0 && (
              <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground tabular-nums">
                {pendingReviews}
              </span>
            )}
          </NavLink>
        )}
      </nav>

      <Outlet />
    </div>
  );
}
