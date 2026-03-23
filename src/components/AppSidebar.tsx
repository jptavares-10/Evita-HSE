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
  ChevronDown,
  Shield,
  LayoutGrid,
  BookOpen,
  UserCheck,
  Grid3X3,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePeriodicServices } from "@/hooks/useServices";
import { getServiceStatus } from "@/lib/services";
import { useEmployees, useTrainingMatrix, useAllRecords } from "@/hooks/useTrainings";
import { getRecordStatus } from "@/lib/trainings";
import { useMtrs } from "@/hooks/useMTR";
import { getCdfDisplayStatus } from "@/lib/mtr";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useOccurrences } from "@/hooks/useOccurrences";

const mainNav = [
  { title: "Dashboard", to: "/dashboard", icon: Home },
  { title: "Serviços Periódicos", to: "/servicos", icon: ClipboardList },
  { title: "Gestão de MTR", to: "/mtr", icon: Recycle },
  { title: "Fornecedores", to: "/fornecedores", icon: Truck },
  { title: "Incidentes", to: "/incidentes", icon: AlertTriangle },
];

const trainingSubNav = [
  { title: "Visão Geral", to: "/treinamentos", icon: LayoutGrid },
  { title: "Colaboradores", to: "/treinamentos/colaboradores", icon: UserCheck },
  { title: "Treinamentos", to: "/treinamentos/catalogo", icon: BookOpen },
  { title: "Cargos", to: "/treinamentos/cargos", icon: Briefcase },
  { title: "Matriz", to: "/treinamentos/matriz", icon: Grid3X3 },
];

const moduleNav: { title: string; icon: any; disabled: boolean }[] = [];

const settingsNav = [
  { title: "Minha Empresa", to: "/empresa", icon: Building2 },
  { title: "Usuários", to: "/usuarios", icon: Users },
  { title: "Plano", to: "/planos", icon: CreditCard },
];

export function AppSidebar() {
  const { profile, company, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [trainingsExpanded, setTrainingsExpanded] = useState(false);

  // Service alerts
  const { data: services = [] } = usePeriodicServices();
  const serviceAlertCount = services.filter((s: any) => {
    const st = getServiceStatus(s.next_due_at, s.alert_days_before);
    return st === "warning" || st === "expired";
  }).length;

  // Training alerts
  const { data: employees = [] } = useEmployees();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();

  const trainingAlertCount = useMemo(() => {
    const activeEmps = employees.filter((e: any) => e.status === "active");
    let count = 0;
    for (const emp of activeEmps) {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      for (const tid of requiredIds) {
        const latest = allRecords
          .filter((r: any) => r.employee_id === emp.id && r.training_id === tid)
          .sort((a: any, b: any) => b.expires_at.localeCompare(a.expires_at))[0];
        if (!latest) { count++; continue; }
        const st = getRecordStatus(latest.expires_at, latest.trainings?.alert_days_before ?? 30);
        if (st === "expired" || st === "missing") count++;
      }
    }
    return count;
  }, [employees, matrix, allRecords]);

  // MTR alerts
  const { data: mtrList = [] } = useMtrs();
  const mtrAlertCount = mtrList.filter((m: any) => {
    const st = getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at);
    return st === "warning" || st === "overdue";
  }).length;

  // Supplier alerts (active suppliers with no documents — we use a simple heuristic)
  const { data: supplierList = [] } = useSuppliers();
  const supplierAlertCount = 0;

  // Incident alerts
  const { data: occurrenceList = [] } = useOccurrences();
  const incidentAlertCount = occurrenceList.filter((o: any) => o.status === "open" || o.status === "in_progress").length;

  const isTrainingsActive = location.pathname.startsWith("/treinamentos");

  // Auto-expand when on trainings route
  if (isTrainingsActive && !trainingsExpanded && !collapsed) {
    setTrainingsExpanded(true);
  }

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U";

  return (
    <aside className={cn("flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 min-h-screen", collapsed ? "w-16" : "w-64")}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
        {company?.logo_url ? (
          <img src={company.logo_url} alt="Logo" className="h-8 w-8 rounded object-cover" />
        ) : (
          <Shield className="h-6 w-6 text-sidebar-primary flex-shrink-0" />
        )}
        {!collapsed && <span className="font-semibold text-base text-sidebar-foreground tracking-tight">Evita HSE</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded hover:bg-sidebar-accent transition-colors">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-4 space-y-6 overflow-y-auto">
        <div className="space-y-1 px-2">
          {mainNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cn("relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors", isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="flex-1">{item.title}</span>}
              {!collapsed && item.to === "/servicos" && serviceAlertCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">{serviceAlertCount}</span>
              )}
              {collapsed && item.to === "/servicos" && serviceAlertCount > 0 && (
                <span className="absolute top-0 right-0 bg-destructive rounded-full h-2.5 w-2.5" />
              )}
              {!collapsed && item.to === "/mtr" && mtrAlertCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">{mtrAlertCount}</span>
              )}
              {collapsed && item.to === "/mtr" && mtrAlertCount > 0 && (
                <span className="absolute top-0 right-0 bg-destructive rounded-full h-2.5 w-2.5" />
              )}
              {!collapsed && item.to === "/incidentes" && incidentAlertCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">{incidentAlertCount}</span>
              )}
              {collapsed && item.to === "/incidentes" && incidentAlertCount > 0 && (
                <span className="absolute top-0 right-0 bg-destructive rounded-full h-2.5 w-2.5" />
              )}
            </NavLink>
          ))}

          {/* Trainings with sub-items */}
          <div>
            <button
              onClick={() => collapsed ? undefined : setTrainingsExpanded(!trainingsExpanded)}
              className={cn("relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full text-left",
                isTrainingsActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">Treinamentos</span>
                  {trainingAlertCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">{trainingAlertCount}</span>
                  )}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", trainingsExpanded && "rotate-180")} />
                </>
              )}
              {collapsed && trainingAlertCount > 0 && (
                <span className="absolute top-0 right-0 bg-destructive rounded-full h-2.5 w-2.5" />
              )}
            </button>
            {!collapsed && trainingsExpanded && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                {trainingSubNav.map((sub) => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    end={sub.to === "/treinamentos"}
                    className={({ isActive }) => cn("flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
                      isActive ? "text-sidebar-primary font-medium bg-sidebar-accent/60" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                    )}
                  >
                    <sub.icon className="h-3.5 w-3.5" />
                    <span>{sub.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modules - hidden when empty */}
        {moduleNav.length > 0 && (
        <div className="px-2">
          {!collapsed && <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">Módulos</p>}
          <div className="space-y-1">
            {moduleNav.map((item) => (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-muted cursor-not-allowed opacity-50">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span>{item.title}</span>
                        <span className="ml-auto text-[10px] bg-sidebar-accent text-sidebar-muted px-1.5 py-0.5 rounded">Em breve</span>
                      </>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Em breve</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        )}

        {/* Settings */}
        <div className="px-2">
          {!collapsed && <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">Configurações</p>}
          <div className="space-y-1">
            {settingsNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors", isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
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
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs">{initials}</AvatarFallback>
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
              <button onClick={signOut} className="p-1.5 rounded hover:bg-sidebar-accent transition-colors text-sidebar-muted hover:text-sidebar-foreground">
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
