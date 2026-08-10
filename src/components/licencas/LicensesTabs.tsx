import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/licencas", label: "Licenças" },
  { to: "/licencas/condicionantes", label: "Condicionantes" },
];

export function LicensesTabs() {
  const { pathname } = useLocation();
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
      {tabs.map((t) => (
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
      ))}
    </div>
  );
}