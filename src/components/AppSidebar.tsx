import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePeriodicServices } from "@/hooks/useServices";
import { useInspectionBadgeCount } from "@/hooks/useInspections";
import { useOccurrences } from "@/hooks/useOccurrences";
import { useEnvironmentalLicenses } from "@/hooks/useLicenses";
import { computeLicenseStatus } from "@/lib/licenses";
import { useEpiTypes, useEpiStock } from "@/hooks/useEpi";
import { computeCaStatus, computeStockStatus } from "@/lib/epi";
import { useAsoRecords, useAsoExamTypes } from "@/hooks/useAso";
import { computeAsoStatus } from "@/lib/aso";
import { useEmployees, useTrainingMatrix, useAllRecords } from "@/hooks/useTrainings";
import { useMtrs } from "@/hooks/useMTR";
import { useSuppliers } from "@/hooks/useSuppliers";
import { getServiceStatus } from "@/lib/services";
import { getCdfDisplayStatus } from "@/lib/mtr";
import { computeEmployeeCompliance } from "@/lib/trainings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard, ClipboardList, ShieldAlert, GraduationCap, Recycle, Truck,
  Building2, Users, CreditCard, LogOut, ChevronDown, ChevronLeft, ChevronRight,
  Shield, HeartPulse, Leaf, Eye, BookOpen, Grid3X3, Briefcase, ScrollText, FileText, HardHat, Stethoscope, ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUP_STORAGE_KEY = "evita-sidebar-groups";
const COLLAPSED_STORAGE_KEY = "evita-sidebar-collapsed";

function getGroupState(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(GROUP_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { seguranca: true, saude: true, meio_ambiente: true };
}

function saveGroupState(state: Record<string, boolean>) {
  localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(state));
}

function getCollapsedState(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
  } catch {}
  return false;
}

// ── Sidebar Item ──

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  badge?: number;
  active: boolean;
  sub?: boolean;
  collapsed?: boolean;
}

function SidebarItem({ to, icon: Icon, label, badge, active, sub, collapsed }: SidebarItemProps) {
  const content = (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 rounded-md transition-colors relative",
        collapsed ? "justify-center px-2 py-2.5" : sub ? "pl-9 pr-3 py-1.5 text-xs" : "px-3 py-2 text-sm",
        active
          ? "bg-[#1D4ED8] text-white font-medium"
          : "text-[#D1D5DB] hover:bg-[#1F2937] hover:text-white"
      )}
    >
      <Icon className={cn("flex-shrink-0", sub ? "h-3.5 w-3.5" : "h-4 w-4")} />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "bg-red-500 text-white rounded-full font-bold flex items-center justify-center",
          collapsed
            ? "absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[9px]"
            : "h-5 min-w-[20px] px-1.5 text-[10px]"
        )}>
          {badge}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {label}
          {badge !== undefined && badge > 0 && ` (${badge})`}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// ── Group Header ──

interface SidebarGroupHeaderProps {
  label: string;
  icon: any;
  iconColor: string;
  open: boolean;
  onToggle: () => void;
  badge?: number;
  collapsed?: boolean;
}

function SidebarGroupHeader({ label, icon: Icon, iconColor, open, onToggle, badge, collapsed }: SidebarGroupHeaderProps) {
  if (collapsed) {
    return (
      <div className="flex justify-center py-2 relative">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button onClick={onToggle} className="p-1.5 rounded hover:bg-[#1F2937] transition-colors relative">
              <Icon className={cn("h-4 w-4", iconColor)} />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 min-w-[16px] px-1 text-[9px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
    >
      <Icon className={cn("h-3.5 w-3.5", iconColor)} />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white rounded-full h-4 min-w-[16px] px-1 text-[9px] font-bold flex items-center justify-center mr-1">
          {badge}
        </span>
      )}
      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open ? "" : "-rotate-90")} />
    </button>
  );
}

// ── Main Sidebar ──

export function AppSidebar() {
  const { profile, company } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [collapsed, setCollapsed] = useState(getCollapsedState);
  const [groups, setGroups] = useState(getGroupState);
  const [treinoExpanded, setTreinoExpanded] = useState(path.startsWith("/treinamentos"));
  const [inspecoesExpanded, setInspecoesExpanded] = useState(path.startsWith("/inspecoes"));

  useEffect(() => saveGroupState(groups), [groups]);
  useEffect(() => {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const toggleGroup = (key: string) => {
    setGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Badge data ──
  const { data: services = [] } = usePeriodicServices();
  const { data: occurrences = [] } = useOccurrences();
  const { data: employees = [] } = useEmployees();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();
  const { data: mtrList = [] } = useMtrs();
  const { data: supplierList = [] } = useSuppliers();
  const { data: licenseList = [] } = useEnvironmentalLicenses();
  const { data: epiTypeList = [] } = useEpiTypes();
  const { data: epiStockMap = {} } = useEpiStock();
  const { data: asoRecords = [] } = useAsoRecords();
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
      count += c.pending;
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

  const licenseBadge = useMemo(() => {
    let count = 0;
    licenseList.forEach((l: any) => {
      const st = computeLicenseStatus(l.has_expiry, l.expires_at, l.alert_days_before, l.status);
      if (st === "expiring" || st === "expired") count++;
    });
    return count;
  }, [licenseList]);

  const epiBadge = useMemo(() => {
    let count = 0;
    epiTypeList.forEach((e: any) => {
      const cs = computeCaStatus(e.ca_expires_at, e.ca_alert_days_before);
      if (cs === "warning" || cs === "expired") count++;
      const currentStock = epiStockMap[e.id] ?? 0;
      const ss = computeStockStatus(currentStock, e.minimum_stock);
      if (ss === "low" || ss === "out") count++;
    });
    return count;
  }, [epiTypeList, epiStockMap]);

  const asoBadge = useMemo(() => {
    let count = 0;
    // Group by employee, find latest with expiry
    const byEmployee: Record<string, any[]> = {};
    asoRecords.forEach((r: any) => {
      if (!byEmployee[r.employee_id]) byEmployee[r.employee_id] = [];
      byEmployee[r.employee_id].push(r);
    });
    Object.values(byEmployee).forEach((recs) => {
      const withExpiry = recs.filter((r) => r.expires_at).sort((a, b) => b.exam_date.localeCompare(a.exam_date));
      if (withExpiry.length > 0) {
        const st = computeAsoStatus(withExpiry[0].expires_at);
        if (st === "warning" || st === "expired") count++;
      }
    });
    return count;
  }, [asoRecords]);

  const segurancaBadge = serviceBadge + incidentBadge + epiBadge;
  const saudeBadge = trainingBadge + asoBadge;
  const meioAmbienteBadge = mtrBadge + licenseBadge;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "?";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "bg-[#111827] flex flex-col min-h-screen sticky top-0 z-50 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* ── Header: Logo + Collapse toggle ── */}
        <div className="flex items-center border-b border-[#1F2937] px-3 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 flex-1 min-w-0">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="Logo" className="h-8 w-8 rounded object-contain flex-shrink-0" />
            ) : (
              <div className="h-8 w-8 rounded bg-[#1D4ED8] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">E</div>
            )}
            {!collapsed && <span className="font-bold text-lg text-white truncate">Evita HSE</span>}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-[#6B7280] hover:text-white transition-colors p-1 rounded hover:bg-[#1F2937] flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {/* Dashboard */}
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={path === "/dashboard"} collapsed={collapsed} />

          <div className="h-1" />
          <div className="border-t border-[#1F2937] my-1" />

          {/* ── SEGURANÇA ── */}
          <SidebarGroupHeader
            label="Segurança"
            icon={Shield}
            iconColor="text-red-400"
            open={groups.seguranca ?? true}
            onToggle={() => toggleGroup("seguranca")}
            badge={segurancaBadge}
            collapsed={collapsed}
          />
          {(groups.seguranca ?? true) && (
            <div className={cn("space-y-0.5", !collapsed && "relative ml-4 pl-2 border-l border-[#1F2937]")}>
              <SidebarItem to="/servicos" icon={ClipboardList} label="Serviços Periódicos" badge={serviceBadge} active={path === "/servicos"} collapsed={collapsed} />
              <SidebarItem to="/incidentes" icon={ShieldAlert} label="IC & NC" badge={incidentBadge} active={path === "/incidentes"} collapsed={collapsed} />
              <SidebarItem to="/epi" icon={HardHat} label="EPIs" badge={epiBadge} active={path.startsWith("/epi")} collapsed={collapsed} />
              <SidebarItem to="/documentos" icon={FileText} label="Biblioteca de Docs" active={path === "/documentos"} collapsed={collapsed} />
            </div>
          )}

          <div className="border-t border-[#1F2937] my-1" />

          {/* ── SAÚDE ── */}
          <SidebarGroupHeader
            label="Saúde"
            icon={HeartPulse}
            iconColor="text-yellow-400"
            open={groups.saude ?? true}
            onToggle={() => toggleGroup("saude")}
            badge={saudeBadge}
            collapsed={collapsed}
          />
          {(groups.saude ?? true) && (
            <div className={cn("space-y-0.5", !collapsed && "relative ml-4 pl-2 border-l border-[#1F2937]")}>
              {collapsed ? (
                <SidebarItem to="/treinamentos" icon={GraduationCap} label="Treinamentos" badge={trainingBadge} active={path.startsWith("/treinamentos")} collapsed={collapsed} />
              ) : (
                <>
                  <button
                    onClick={() => setTreinoExpanded((v) => !v)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm w-full transition-colors",
                      path.startsWith("/treinamentos")
                        ? "bg-[#1D4ED8] text-white font-medium"
                        : "text-[#D1D5DB] hover:bg-[#1F2937] hover:text-white"
                    )}
                  >
                    <GraduationCap className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">Treinamentos</span>
                    {trainingBadge > 0 && (
                      <span className="bg-red-500 text-white rounded-full h-5 min-w-[20px] px-1.5 text-[10px] font-bold flex items-center justify-center mr-1">
                        {trainingBadge}
                      </span>
                    )}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", treinoExpanded ? "" : "-rotate-90")} />
                  </button>
                  {treinoExpanded && (
                    <div className="space-y-0.5 ml-2 pl-2 border-l border-[#1F2937]">
                      <SidebarItem to="/treinamentos" icon={Eye} label="Visão Geral" active={path === "/treinamentos"} sub />
                      <SidebarItem to="/treinamentos/colaboradores" icon={Users} label="Colaboradores" active={path === "/treinamentos/colaboradores"} sub />
                      <SidebarItem to="/treinamentos/catalogo" icon={BookOpen} label="Treinamentos" active={path === "/treinamentos/catalogo"} sub />
                      <SidebarItem to="/treinamentos/cargos" icon={Briefcase} label="Cargos" active={path === "/treinamentos/cargos"} sub />
                      <SidebarItem to="/treinamentos/matriz" icon={Grid3X3} label="Matriz" active={path === "/treinamentos/matriz"} sub />
                    </div>
                  )}
                </>
              )}
              <SidebarItem to="/aso" icon={Stethoscope} label="ASO / Exames" badge={asoBadge} active={path === "/aso"} collapsed={collapsed} />
            </div>
          )}

          <div className="border-t border-[#1F2937] my-1" />

          {/* ── MEIO AMBIENTE ── */}
          <SidebarGroupHeader
            label="Meio Ambiente"
            icon={Leaf}
            iconColor="text-green-400"
            open={groups.meio_ambiente ?? true}
            onToggle={() => toggleGroup("meio_ambiente")}
            badge={meioAmbienteBadge}
            collapsed={collapsed}
          />
          {(groups.meio_ambiente ?? true) && (
            <div className={cn("space-y-0.5", !collapsed && "relative ml-4 pl-2 border-l border-[#1F2937]")}>
              <SidebarItem to="/mtr" icon={Recycle} label="Gestão de MTR" badge={mtrBadge} active={path.startsWith("/mtr")} collapsed={collapsed} />
              <SidebarItem to="/licencas" icon={ScrollText} label="Licenças Ambientais" badge={licenseBadge} active={path === "/licencas"} collapsed={collapsed} />
              <SidebarItem to="/fornecedores" icon={Truck} label="Fornecedores" active={path.startsWith("/fornecedores")} collapsed={collapsed} />
            </div>
          )}

          <div className="border-t border-[#1F2937] my-1" />

          {/* ── CONFIGURAÇÕES ── */}
          {!collapsed && (
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Configurações
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center py-2">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="h-px w-6 bg-[#374151]" />
                </TooltipTrigger>
                <TooltipContent side="right">Configurações</TooltipContent>
              </Tooltip>
            </div>
          )}
          <SidebarItem to="/empresa" icon={Building2} label="Minha Empresa" active={path === "/empresa"} collapsed={collapsed} />
          <SidebarItem to="/usuarios" icon={Users} label="Usuários" active={path === "/usuarios"} collapsed={collapsed} />
          <SidebarItem to="/planos" icon={CreditCard} label="Plano" active={path === "/planos"} collapsed={collapsed} />
        </nav>

        {/* ── Footer: User ── */}
        <div className="bg-[#0F172A] border-t border-[#1F2937] p-3">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link to="/perfil">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-[#1D4ED8] text-white">{initials}</AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{profile?.full_name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Link to="/perfil">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-[#1D4ED8] text-white">{initials}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{profile?.full_name || "Usuário"}</p>
                  <p className="text-[10px] text-[#6B7280] truncate">{profile?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[#6B7280] hover:text-white transition-colors p-1.5 rounded hover:bg-[#1F2937] flex-shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
