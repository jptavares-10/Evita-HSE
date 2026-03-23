import {
  Home,
  ClipboardList,
  GraduationCap,
  Recycle,
  Truck,
  Building2,
  Users,
  CreditCard,
  LogOut,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePeriodicServices } from "@/hooks/useServices";
import { getServiceStatus } from "@/lib/services";

const mainNav = [
  { title: "Dashboard", to: "/dashboard", icon: Home },
  { title: "Serviços Periódicos", to: "/servicos", icon: ClipboardList },
];

const moduleNav = [
  { title: "Treinamentos", icon: GraduationCap, disabled: true },
  { title: "Gestão de MTR", icon: Recycle, disabled: true },
  { title: "Fornecedores", icon: Truck, disabled: true },
];

const settingsNav = [
  { title: "Minha Empresa", to: "/empresa", icon: Building2 },
  { title: "Usuários", to: "/usuarios", icon: Users },
  { title: "Plano", to: "/planos", icon: CreditCard },
];

export function AppSidebar() {
  const { profile, company, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U";

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 min-h-screen",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
        {company?.logo_url ? (
          <img src={company.logo_url} alt="Logo" className="h-8 w-8 rounded object-cover" />
        ) : (
          <Shield className="h-6 w-6 text-sidebar-primary flex-shrink-0" />
        )}
        {!collapsed && (
          <span className="font-semibold text-base text-sidebar-foreground tracking-tight">
            Evita HSE
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-4 space-y-6 overflow-y-auto">
        <div className="space-y-1 px-2">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </div>

        {/* Modules */}
        <div className="px-2">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              Módulos
            </p>
          )}
          <div className="space-y-1">
            {moduleNav.map((item) => (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-muted cursor-not-allowed opacity-50"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span>{item.title}</span>
                        <span className="ml-auto text-[10px] bg-sidebar-accent text-sidebar-muted px-1.5 py-0.5 rounded">
                          Em breve
                        </span>
                      </>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Em breve</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="px-2">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              Configurações
            </p>
          )}
          <div className="space-y-1">
            {settingsNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <NavLink to="/perfil">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </NavLink>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name}</p>
              <p className="text-xs text-sidebar-muted truncate">{profile?.email}</p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className="p-1.5 rounded hover:bg-sidebar-accent transition-colors text-sidebar-muted hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sair</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
