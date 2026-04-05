import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

const tabs = [
  { label: "Visão Geral", to: "/epi" },
  { label: "Catálogo", to: "/epi/catalogo" },
  { label: "Estoque", to: "/epi/estoque" },
  { label: "Entregas", to: "/epi/entregas" },
  { label: "Ficha de EPI", to: "/epi/ficha" },
];

export default function Epi() {
  usePageTitle("EPIs — Evita HSE");
  const location = useLocation();

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equipamentos de Proteção Individual</h1>
        <p className="text-muted-foreground mt-1">Catálogo, estoque, entregas e controle de CA.</p>
      </div>

      <nav className="flex gap-1 border-b">
        {tabs.map((t) => {
          const isActive = t.to === "/epi"
            ? location.pathname === "/epi"
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
