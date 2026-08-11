import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import { Lock } from "lucide-react";

const tabs = [
  { to: "/licencas", label: "Licenças" },
  { to: "/licencas/condicionantes", label: "Condicionantes" },
];

export function LicensesTabs() {
  const { pathname } = useLocation();
  const { hasModule } = usePlan();
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
      {tabs.map((t) => {
        const locked = t.to === "/licencas/condicionantes" && !hasModule("license_conditionants");
        if (locked) {
          return (
            <span
              key={t.to}
              title="Disponível no plano Enterprise"
              className="flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground/60 cursor-not-allowed"
            >
              {t.label}
              <Lock className="h-3 w-3" />
            </span>
          );
        }
        return (
        <NavLink
          key={t.to}
          to={t.to}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            pathname === t.to ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </NavLink>
        );
      })}
    </div>
  );
}