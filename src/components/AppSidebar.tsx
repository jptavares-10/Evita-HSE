import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { supabase } from "@/integrations/supabase/client";
import { usePeriodicServices } from "@/hooks/useServices";
import { useMyPendingReviewCount } from "@/hooks/useDocumentReviews";
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
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  LayoutDashboard, ClipboardList, ShieldAlert, GraduationCap, Recycle, Truck,
  Building2, Users, CreditCard, LogOut, ChevronDown, ChevronLeft, ChevronRight,
  Shield, HeartPulse, Leaf, Eye, BookOpen, Grid3X3, Briefcase, ScrollText, FileText, HardHat, Stethoscope, ClipboardCheck,
  Lock, Inbox, CalendarDays, QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { SignedAvatarImage } from "@/components/ui/signed-avatar-image";
import { EvitaLogo, EvitaWordmark } from "@/components/landing/EvitaBrand";

const GROUP_STORAGE_KEY = "evita-sidebar-groups";
const COLLAPSED_STORAGE_KEY = "evita-sidebar-collapsed";

// Module key mapping for sidebar items
const ROUTE_MODULE_MAP: Record<string, string> = {
  "/servicos": "periodic_services",
  "/incidentes": "ic_nc",
  "/incidentes/licoes-aprendidas": "ic_nc",
  "/inspecoes": "inspections",
  "/epi": "epi",
  "/documentos": "document_library",
  "/treinamentos": "trainings",
  "/aso": "aso",
  "/mtr": "mtr",
  "/licencas": "environmental_licenses",
  "/fornecedores": "suppliers",
};

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
  locked?: boolean;
  onLockedClick?: () => void;
}

function SidebarItem({ to, icon: Icon, label, badge, active, sub, collapsed, locked, onLockedClick }: SidebarItemProps) {
  if (locked) {
    const content = (
      <button
        onClick={onLockedClick}
        className={cn(
          "flex items-center gap-2.5 rounded-md transition-colors relative w-full",
          collapsed ? "justify-center px-2 py-2.5" : sub ? "pl-9 pr-3 py-1.5 text-xs" : "px-3 py-2 text-sm",
          "text-muted-foreground hover:bg-accent cursor-pointer"
        )}
      >
        <Icon className={cn("flex-shrink-0 opacity-50", sub ? "h-3.5 w-3.5" : "h-4 w-4")} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate opacity-50">{label}</span>
            <Lock className="h-3 w-3 opacity-60 flex-shrink-0" />
          </>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            🔒 {label}
          </TooltipContent>
        </Tooltip>
      );
    }
    return content;
  }

  const content = (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 rounded-md transition-colors relative",
        collapsed ? "justify-center px-2 py-2.5" : sub ? "pl-9 pr-3 py-1.5 text-xs" : "px-3 py-2 text-sm",
        active
          ? "bg-accent text-accent-foreground font-semibold ring-1 ring-primary/20"
          : "text-foreground/80 hover:bg-accent hover:text-foreground"
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
            <button onClick={onToggle} className="p-1.5 rounded hover:bg-accent transition-colors relative">
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
      className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
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
  const { hasModule, isExpired } = usePlan();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [collapsed, setCollapsed] = useState(getCollapsedState);
  const [groups, setGroups] = useState(getGroupState);
  const [treinoExpanded, setTreinoExpanded] = useState(path.startsWith("/treinamentos"));
  const [inspecoesExpanded, setInspecoesExpanded] = useState(path.startsWith("/inspecoes"));
  const [upgradeModule, setUpgradeModule] = useState<string | null>(null);

  useEffect(() => saveGroupState(groups), [groups]);
  useEffect(() => {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const toggleGroup = (key: string) => {
    setGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLocked = (route: string): boolean => {
    if (isExpired) return true;
    const moduleKey = ROUTE_MODULE_MAP[route];
    if (!moduleKey) return false;
    return !hasModule(moduleKey);
  };

  const handleLockedClick = (route: string) => {
    const moduleKey = ROUTE_MODULE_MAP[route];
    if (moduleKey) setUpgradeModule(moduleKey);
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
    services.filter((s: any) => s.status !== "inactive").forEach((s: any) => {
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

  const { data: inspectionBadge = 0 } = useInspectionBadgeCount();
  const reviewBadge = useMyPendingReviewCount();
  const segurancaBadge = serviceBadge + incidentBadge + epiBadge + inspectionBadge;
  const saudeBadge = trainingBadge + asoBadge;
  const meioAmbienteBadge = mtrBadge + licenseBadge;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const companyLogoUrl = useSignedUrl("company-logos", company?.logo_url);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "?";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "bg-card flex flex-col h-screen sticky top-0 z-50 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* ── Header: Logo + Collapse toggle ── */}
        <div className="flex items-center border-b border-border px-3 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 flex-1 min-w-0 group" aria-label="Evita HSE — Dashboard">
            {companyLogoUrl ? (
              <img src={companyLogoUrl} alt={`Logo${company?.name ? " da " + company.name : ""}`} className="h-8 w-8 rounded object-contain flex-shrink-0" />
            ) : (
              <EvitaLogo className="h-8 w-8 flex-shrink-0 transition-transform group-hover:rotate-[-4deg]" />
            )}
            {!collapsed && <span className="truncate"><EvitaWordmark size="md" /></span>}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-accent flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin-light">
          {/* Dashboard */}
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={path === "/dashboard"} collapsed={collapsed} />
          <SidebarItem to="/calendario" icon={CalendarDays} label="Calendário" active={path === "/calendario"} collapsed={collapsed} />
          <SidebarItem to="/revisoes" icon={Inbox} label="Revisões" badge={reviewBadge} active={path === "/revisoes"} collapsed={collapsed} />

          <div className="h-1" />
          <div className="border-t border-border my-1" />

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
            <div className={cn("space-y-0.5", !collapsed && "relative ml-4 pl-2 border-l border-border")}>
              <SidebarItem to="/servicos" icon={ClipboardList} label="Serviços Periódicos" badge={serviceBadge} active={path === "/servicos"} collapsed={collapsed} locked={isLocked("/servicos")} onLockedClick={() => handleLockedClick("/servicos")} />
              <SidebarItem to="/incidentes" icon={ShieldAlert} label="IC & NC" badge={incidentBadge} active={path.startsWith("/incidentes")} collapsed={collapsed} locked={isLocked("/incidentes")} onLockedClick={() => handleLockedClick("/incidentes")} />
              {collapsed ? (
                <SidebarItem to="/inspecoes" icon={ClipboardCheck} label="Inspeções" badge={inspectionBadge} active={path.startsWith("/inspecoes")} collapsed={collapsed} locked={isLocked("/inspecoes")} onLockedClick={() => handleLockedClick("/inspecoes")} />
              ) : isLocked("/inspecoes") ? (
                <SidebarItem to="/inspecoes" icon={ClipboardCheck} label="Inspeções" active={false} collapsed={collapsed} locked onLockedClick={() => handleLockedClick("/inspecoes")} />
              ) : (
                <>
                  <button
                    onClick={() => setInspecoesExpanded((v) => !v)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm w-full transition-colors",
                      path.startsWith("/inspecoes")
                        ? "bg-accent text-accent-foreground font-semibold ring-1 ring-primary/20"
                        : "text-foreground/80 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <ClipboardCheck className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">Inspeções</span>
                    {inspectionBadge > 0 && (
                      <span className="bg-red-500 text-white rounded-full h-5 min-w-[20px] px-1.5 text-[10px] font-bold flex items-center justify-center mr-1">
                        {inspectionBadge}
                      </span>
                    )}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", inspecoesExpanded ? "" : "-rotate-90")} />
                  </button>
                  {inspecoesExpanded && (
                    <div className="space-y-0.5 ml-2 pl-2 border-l border-border">
                      <SidebarItem to="/inspecoes" icon={Eye} label="Execuções" active={path === "/inspecoes"} sub />
                      <SidebarItem to="/inspecoes/ativos" icon={QrCode} label="Ativos & QR" active={path === "/inspecoes/ativos"} sub />
                      <SidebarItem to="/inspecoes/modelos" icon={BookOpen} label="Modelos" active={path === "/inspecoes/modelos"} sub />
                    </div>
                  )}
                </>
              )}
              <SidebarItem to="/epi" icon={HardHat} label="EPIs" badge={epiBadge} active={path.startsWith("/epi")} collapsed={collapsed} locked={isLocked("/epi")} onLockedClick={() => handleLockedClick("/epi")} />
              <SidebarItem to="/documentos" icon={FileText} label="Biblioteca de Docs" active={path === "/documentos"} collapsed={collapsed} locked={isLocked("/documentos")} onLockedClick={() => handleLockedClick("/documentos")} />
            </div>
          )}

          <div className="border-t border-border my-1" />

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
            <div className={cn("space-y-0.5", !collapsed && "relative ml-4 pl-2 border-l border-border")}>
              {collapsed ? (
                <SidebarItem to="/treinamentos" icon={GraduationCap} label="Treinamentos" badge={trainingBadge} active={path.startsWith("/treinamentos")} collapsed={collapsed} locked={isLocked("/treinamentos")} onLockedClick={() => handleLockedClick("/treinamentos")} />
              ) : isLocked("/treinamentos") ? (
                <SidebarItem to="/treinamentos" icon={GraduationCap} label="Treinamentos" active={false} collapsed={collapsed} locked onLockedClick={() => handleLockedClick("/treinamentos")} />
              ) : (
                <>
                  <button
                    onClick={() => setTreinoExpanded((v) => !v)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm w-full transition-colors",
                      path.startsWith("/treinamentos")
                        ? "bg-accent text-accent-foreground font-semibold ring-1 ring-primary/20"
                        : "text-foreground/80 hover:bg-accent hover:text-foreground"
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
                    <div className="space-y-0.5 ml-2 pl-2 border-l border-border">
                      <SidebarItem to="/treinamentos" icon={Eye} label="Visão Geral" active={path === "/treinamentos"} sub />
                      <SidebarItem to="/treinamentos/colaboradores" icon={Users} label="Colaboradores" active={path === "/treinamentos/colaboradores"} sub />
                      <SidebarItem to="/treinamentos/catalogo" icon={BookOpen} label="Treinamentos" active={path === "/treinamentos/catalogo"} sub />
                      <SidebarItem to="/treinamentos/cargos" icon={Briefcase} label="Cargos" active={path === "/treinamentos/cargos"} sub />
                      <SidebarItem to="/treinamentos/matriz" icon={Grid3X3} label="Matriz" active={path === "/treinamentos/matriz"} sub />
                    </div>
                  )}
                </>
              )}
              <SidebarItem to="/aso" icon={Stethoscope} label="ASO / Exames" badge={asoBadge} active={path === "/aso"} collapsed={collapsed} locked={isLocked("/aso")} onLockedClick={() => handleLockedClick("/aso")} />
            </div>
          )}

          <div className="border-t border-border my-1" />

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
            <div className={cn("space-y-0.5", !collapsed && "relative ml-4 pl-2 border-l border-border")}>
              <SidebarItem to="/mtr" icon={Recycle} label="Gestão de MTR" badge={mtrBadge} active={path.startsWith("/mtr")} collapsed={collapsed} locked={isLocked("/mtr")} onLockedClick={() => handleLockedClick("/mtr")} />
              <SidebarItem to="/licencas" icon={ScrollText} label="Licenças Ambientais" badge={licenseBadge} active={path.startsWith("/licencas")} collapsed={collapsed} locked={isLocked("/licencas")} onLockedClick={() => handleLockedClick("/licencas")} />
              <SidebarItem to="/fornecedores" icon={Truck} label="Fornecedores" active={path.startsWith("/fornecedores")} collapsed={collapsed} locked={isLocked("/fornecedores")} onLockedClick={() => handleLockedClick("/fornecedores")} />
            </div>
          )}

          <div className="border-t border-border my-1" />

          {/* ── CONFIGURAÇÕES ── */}
          {!collapsed && (
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Configurações
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center py-2">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="h-px w-6 bg-border" />
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
        <div className="bg-muted/40 border-t border-border p-3">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link to="/perfil">
                    <Avatar className="h-9 w-9">
                      <SignedAvatarImage path={profile?.avatar_url} alt="" />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
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
                    <SignedAvatarImage path={profile?.avatar_url} alt="" />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || "Usuário"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded hover:bg-accent flex-shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <UpgradeModal
        module={upgradeModule}
        open={!!upgradeModule}
        onClose={() => setUpgradeModule(null)}
      />
    </TooltipProvider>
  );
}
