import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePeriodicServices } from "@/hooks/useServices";
import { useOccurrences } from "@/hooks/useOccurrences";
import { useEmployees, useTrainingMatrix, useAllRecords } from "@/hooks/useTrainings";
import { useMtrs } from "@/hooks/useMTR";
import { useSuppliers } from "@/hooks/useSuppliers";
import { getServiceStatus } from "@/lib/services";
import { getCdfDisplayStatus } from "@/lib/mtr";
import { computeEmployeeCompliance, getRecordStatus } from "@/lib/trainings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LayoutDashboard, ClipboardList, ShieldAlert, GraduationCap, Recycle, Truck,
  Building2, Users, CreditCard, LogOut, ChevronDown, Shield, HeartPulse, Leaf,
  Settings, Eye, BookOpen, Grid3X3, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "evita-sidebar-groups";

function getGroupState(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { seguranca: true, saude: true, meio_ambiente: true };
}

function saveGroupState(state: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  badge?: number;
  active: boolean;
  sub?: boolean;
}

function SidebarItem({ to, icon: Icon, label, badge, active, sub }: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
        sub ? "pl-9 text-xs" : "",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className={cn("flex-shrink-0", sub ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold">
          {badge}
        </Badge>
      )}
    </Link>
  );
}

interface SidebarGroupHeaderProps {
  label: string;
  icon: any;
  iconColor: string;
  open: boolean;
  onToggle: () => void;
  badge?: number;
}

function SidebarGroupHeader({ label, icon: Icon, iconColor, open, onToggle, badge }: SidebarGroupHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
    >
      <Icon className={cn("h-3.5 w-3.5", iconColor)} />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge variant="destructive" className="h-4 min-w-[16px] px-1 text-[9px] font-bold mr-1">
          {badge}
        </Badge>
      )}
      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open ? "" : "-rotate-90")} />
    </button>
  );
}

export function AppSidebar() {
  const { profile, company } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [groups, setGroups] = useState(getGroupState);
  const [treinoExpanded, setTreinoExpanded] = useState(path.startsWith("/treinamentos"));

  useEffect(() => saveGroupState(groups), [groups]);

  const toggleGroup = (key: string) => {
    setGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Badge data
  const { data: services = [] } = usePeriodicServices();
  const { data: occurrences = [] } = useOccurrences();
  const { data: employees = [] } = useEmployees();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();
  const { data: mtrList = [] } = useMtrs();
  const { data: supplierList = [] } = useSuppliers();

  const serviceBadge = useMemo(() => {
    let count = 0;
    services.forEach((s: any) => {
      const st = getServiceStatus(s.next_due_at, s.alert_days_before);
      if (st === "warning" || st === "expired") count++;
    });
    return count;
  }, [services]);

  const incidentBadge = useMemo(() => {
    return occurrences.filter((o: any) => o.status === "open" || o.status === "in_progress").length;
  }, [occurrences]);

  const trainingBadge = useMemo(() => {
    let count = 0;
    const activeEmps = employees.filter((e: any) => e.status === "active");
    for (const emp of activeEmps) {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      const empRecords = allRecords.filter((r: any) => r.employee_id === emp.id);
      const c = computeEmployeeCompliance(requiredIds, empRecords);
      count += c.missing + c.expired;
    }
    return count;
  }, [employees, matrix, allRecords]);

  const mtrBadge = useMemo(() => {
    let count = 0;
    mtrList.forEach((m: any) => {
      const st = getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at);
      if (st === "warning" || st === "overdue") count++;
    });
    return count;
  }, [mtrList]);

  const segurancaBadge = serviceBadge + incidentBadge;
  const saudeBadge = trainingBadge;
  const meioAmbienteBadge = mtrBadge;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "?";

  return (
    <aside className="w-64 bg-card border-r flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b">
        <Link to="/dashboard" className="flex items-center gap-2">
          {company?.logo_url ? (
            <img src={company.logo_url} alt="Logo" className="h-8 w-8 rounded object-contain" />
          ) : (
            <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">E</div>
          )}
          <span className="font-bold text-lg">Evita HSE</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {/* Dashboard */}
        <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={path === "/dashboard"} />

        <div className="h-2" />

        {/* SEGURANÇA */}
        <Collapsible open={groups.seguranca ?? true} onOpenChange={() => toggleGroup("seguranca")}>
          <SidebarGroupHeader
            label="Segurança"
            icon={Shield}
            iconColor="text-red-500"
            open={groups.seguranca ?? true}
            onToggle={() => toggleGroup("seguranca")}
            badge={segurancaBadge}
          />
          <CollapsibleContent className="space-y-0.5">
            <SidebarItem to="/servicos" icon={ClipboardList} label="Serviços Periódicos" badge={serviceBadge} active={path === "/servicos"} />
            <SidebarItem to="/incidentes" icon={ShieldAlert} label="IC & NC" badge={incidentBadge} active={path === "/incidentes"} />
          </CollapsibleContent>
        </Collapsible>

        {/* SAÚDE */}
        <Collapsible open={groups.saude ?? true} onOpenChange={() => toggleGroup("saude")}>
          <SidebarGroupHeader
            label="Saúde"
            icon={HeartPulse}
            iconColor="text-yellow-500"
            open={groups.saude ?? true}
            onToggle={() => toggleGroup("saude")}
            badge={saudeBadge}
          />
          <CollapsibleContent className="space-y-0.5">
            <Collapsible open={treinoExpanded} onOpenChange={setTreinoExpanded}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm w-full transition-colors",
                    path.startsWith("/treinamentos")
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <GraduationCap className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left truncate">Treinamentos</span>
                  {trainingBadge > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold mr-1">
                      {trainingBadge}
                    </Badge>
                  )}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", treinoExpanded ? "" : "-rotate-90")} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5">
                <SidebarItem to="/treinamentos" icon={Eye} label="Visão Geral" active={path === "/treinamentos"} sub />
                <SidebarItem to="/treinamentos/colaboradores" icon={Users} label="Colaboradores" active={path === "/treinamentos/colaboradores"} sub />
                <SidebarItem to="/treinamentos/catalogo" icon={BookOpen} label="Treinamentos" active={path === "/treinamentos/catalogo"} sub />
                <SidebarItem to="/treinamentos/cargos" icon={Briefcase} label="Cargos" active={path === "/treinamentos/cargos"} sub />
                <SidebarItem to="/treinamentos/matriz" icon={Grid3X3} label="Matriz" active={path === "/treinamentos/matriz"} sub />
              </CollapsibleContent>
            </Collapsible>
          </CollapsibleContent>
        </Collapsible>

        {/* MEIO AMBIENTE */}
        <Collapsible open={groups.meio_ambiente ?? true} onOpenChange={() => toggleGroup("meio_ambiente")}>
          <SidebarGroupHeader
            label="Meio Ambiente"
            icon={Leaf}
            iconColor="text-green-500"
            open={groups.meio_ambiente ?? true}
            onToggle={() => toggleGroup("meio_ambiente")}
            badge={meioAmbienteBadge}
          />
          <CollapsibleContent className="space-y-0.5">
            <SidebarItem to="/mtr" icon={Recycle} label="Gestão de MTR" badge={mtrBadge} active={path.startsWith("/mtr")} />
            <SidebarItem to="/fornecedores" icon={Truck} label="Fornecedores" active={path.startsWith("/fornecedores")} />
          </CollapsibleContent>
        </Collapsible>

        <div className="h-2" />

        {/* CONFIGURAÇÕES */}
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Settings className="h-3.5 w-3.5" />
          Configurações
        </div>
        <SidebarItem to="/empresa" icon={Building2} label="Minha Empresa" active={path === "/empresa"} />
        <SidebarItem to="/usuarios" icon={Users} label="Usuários" active={path === "/usuarios"} />
        <SidebarItem to="/planos" icon={CreditCard} label="Plano" active={path === "/planos"} />
      </nav>

      {/* Footer - User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3">
          <Link to="/perfil">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name || "Usuário"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
