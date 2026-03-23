import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

const tabs = [
  { label: "Visão Geral", to: "/treinamentos" },
  { label: "Colaboradores", to: "/treinamentos/colaboradores" },
  { label: "Treinamentos", to: "/treinamentos/catalogo" },
  { label: "Cargos", to: "/treinamentos/cargos" },
  { label: "Matriz", to: "/treinamentos/matriz" },
];

export default function Treinamentos() {
  usePageTitle("Treinamentos — Evita HSE");
  const location = useLocation();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Treinamentos</h1>
        <p className="text-muted-foreground mt-1">Gestão de treinamentos e certificações da equipe.</p>
      </div>

      <nav className="flex gap-1 border-b">
        {tabs.map((t) => {
          const isActive = t.to === "/treinamentos"
            ? location.pathname === "/treinamentos"
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
