import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";
import { PageHeader } from "@/components/ui/page-header";

const tabs = [
  { label: "Execuções", to: "/inspecoes" },
  { label: "Ativos", to: "/inspecoes/ativos" },
  { label: "Modelos", to: "/inspecoes/modelos" },
];

export default function Inspecoes() {
  usePageTitle("Inspeções — Evita HSE", { description: "Inspeções de segurança e ações corretivas.", noindex: true });
  const location = useLocation();

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Inspeções de Segurança"
        description="Gestão de inspeções periódicas e ações corretivas."
      />

      <nav className="flex gap-1 border-b">
        {tabs.map((t) => {
          const isActive = t.to === "/inspecoes"
            ? location.pathname === "/inspecoes"
            : location.pathname.startsWith(t.to);
          return (
            <NavLink
              key={t.to}
              to={t.to}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </NavLink>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
