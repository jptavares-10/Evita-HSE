import { useAuth } from "@/contexts/AuthContext";
import { ClipboardList, GraduationCap, Recycle, Truck, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Users, ShieldAlert, CreditCard, Calendar, ScrollText, Activity, Stethoscope, ClipboardCheck } from "lucide-react";
import { usePeriodicServices } from "@/hooks/useServices";
import { getServiceStatus, getStatusInfo, formatDateBR } from "@/lib/services";
import { useEmployees, useTrainingMatrix, useAllRecords } from "@/hooks/useTrainings";
import { computeEmployeeCompliance, getRecordStatus } from "@/lib/trainings";
import { useMtrs } from "@/hooks/useMTR";
import { getCdfDisplayStatus, getDaysRemainingLabel, formatDateBR as formatDateMtr } from "@/lib/mtr";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useOccurrences, useAllCorrectiveActions } from "@/hooks/useOccurrences";
import { useEnvironmentalLicenses } from "@/hooks/useLicenses";
import { computeLicenseStatus, getDaysRemainingInfo, formatDateBR as formatDateLic } from "@/lib/licenses";
import { getTypeInfo, getSeverityInfo, formatDateTimeBR } from "@/lib/occurrences";
import { useAsoRecords } from "@/hooks/useAso";
import { useInspectionBadgeCount, useInspectionExecutions } from "@/hooks/useInspections";
import { getExecutionDisplayStatus } from "@/lib/inspections";
import { computeAsoStatus } from "@/lib/aso";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/usePageTitle";

function DashboardCard({ icon: Icon, iconColor, title, items, link, linkLabel }: {
  icon: any; iconColor: string; title: string; items: { label: string; value: number | string; color?: string }[]; link: string; linkLabel: string;
}) {
  return (
    <div className="bg-card border rounded-lg p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 flex-1">
        {items.map((item) => (
          <div key={item.label} className="text-center min-w-[60px]">
            <p className={`text-xl font-bold tabular-nums ${item.color || ""}`}>{item.value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
      <Link to={link} className="flex items-center gap-1 text-xs text-primary hover:underline mt-4 pt-3 border-t">
        {linkLabel} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export default function Dashboard() {
  usePageTitle("Dashboard — Evita HSE");
  const { profile, company } = useAuth();
  const { data: services = [], isLoading: loadingServices } = usePeriodicServices();
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();
  const { data: mtrList = [], isLoading: loadingMtr } = useMtrs();
  const { data: supplierList = [], isLoading: loadingSuppliers } = useSuppliers();
  const { data: occurrenceList = [], isLoading: loadingOccurrences } = useOccurrences();
  const { data: allCorrectiveActions = [] } = useAllCorrectiveActions();
  const { data: licenseList = [], isLoading: loadingLicenses } = useEnvironmentalLicenses();
  const { data: asoRecords = [] } = useAsoRecords();

  const { data: inspExecs = [] } = useInspectionExecutions();

  const isLoading = loadingServices || loadingEmployees || loadingMtr || loadingSuppliers || loadingOccurrences || loadingLicenses;

  // Services stats
  const serviceStats = useMemo(() => {
    let ok = 0, warning = 0, expired = 0;
    services.filter((s: any) => s.status !== "inactive").forEach((s: any) => {
      const st = getServiceStatus(s.next_due_at, s.alert_days_before);
      if (st === "expired") expired++;
      else if (st === "warning") warning++;
      else ok++;
    });
    return { ok, warning, expired };
  }, [services]);

  // Training stats
  const trainingStats = useMemo(() => {
    const activeEmps = employees.filter((e: any) => e.status === "active");
    let totalObl = 0, fulfilled = 0, pendingEmps = 0, warningCount = 0;
    for (const emp of activeEmps) {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      const empRecords = allRecords.filter((r: any) => r.employee_id === emp.id);
      const c = computeEmployeeCompliance(requiredIds, empRecords);
      totalObl += c.required;
      fulfilled += c.fulfilled;
      if (c.pending > 0) pendingEmps++;
    }
    // count warnings
    allRecords.forEach((r: any) => {
      const st = getRecordStatus(r.expires_at, r.trainings?.alert_days_before ?? 30);
      if (st === "warning") warningCount++;
    });
    const conformity = totalObl > 0 ? Math.round((fulfilled / totalObl) * 100) : 100;
    return { conformity, pendingEmps, warningCount };
  }, [employees, matrix, allRecords]);

  // MTR stats
  const mtrStats = useMemo(() => {
    let pending = 0, warning = 0, overdue = 0;
    mtrList.forEach((m: any) => {
      const st = getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at);
      if (st === "overdue") overdue++;
      else if (st === "warning") warning++;
      else if (st === "pending") pending++;
    });
    return { pending: pending + warning, warning, overdue };
  }, [mtrList]);

  // Supplier stats
  const activeSuppliers = supplierList.filter((s: any) => s.status === "active").length;

  // Occurrence stats
  const openOccs = occurrenceList.filter((o: any) => o.status === "open" || o.status === "in_progress").length;
  const pendingActions = allCorrectiveActions.filter((a: any) => a.status !== "completed").length;

  // TF/TG indicators
  const tfTgStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearOccs = occurrenceList.filter((o: any) => new Date(o.occurred_at).getFullYear() === currentYear);
    const incidentsWithLeave = yearOccs.filter((o: any) => o.type === "incident" && o.with_leave);
    const totalLostDays = yearOccs.reduce((sum: number, o: any) => sum + (o.lost_days ?? 0), 0);

    const activeCount = employees.filter((e: any) => e.status === "active").length;
    const hht = activeCount * 200 * 12; // estimated HHT

    const tf = hht > 0 ? (incidentsWithLeave.length * 1_000_000) / hht : 0;
    const tg = hht > 0 ? (totalLostDays * 1_000_000) / hht : 0;

    return { tf: tf.toFixed(1), tg: tg.toFixed(1), hht, activeCount };
  }, [occurrenceList, employees]);

  // License stats
  const licenseStats = useMemo(() => {
    let active = 0, alertCount = 0;
    licenseList.forEach((l: any) => {
      const st = computeLicenseStatus(l.has_expiry, l.expires_at, l.alert_days_before, l.status);
      if (st === "active" || st === "permanent") active++;
      if (st === "expiring" || st === "expired") alertCount++;
    });
    return { active, alertCount };
  }, [licenseList]);

  // ASO stats
  const asoStats = useMemo(() => {
    const activeEmps = employees.filter((e: any) => e.status === "active");
    const total = activeEmps.length;
    let ok = 0, warning = 0, expired = 0;
    for (const emp of activeEmps) {
      const empRecords = asoRecords.filter((r: any) => r.employee_id === emp.id);
      const withExpiry = empRecords.filter((r: any) => r.expires_at).sort((a: any, b: any) => b.exam_date.localeCompare(a.exam_date));
      if (withExpiry.length > 0) {
        const st = computeAsoStatus(withExpiry[0].expires_at);
        if (st === "ok") ok++;
        else if (st === "warning") warning++;
        else if (st === "expired") expired++;
      } else if (empRecords.length > 0) {
        ok++; // no expiry = ok
      } else {
        expired++; // no record
      }
    }
    const conformity = total > 0 ? Math.round((ok / total) * 100) : 0;
    return { ok, warning, expired, conformity };
  }, [employees, asoRecords]);

  // Inspection stats
  const inspectionStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let pendingToday = 0, inProgress = 0, overdue = 0, completedWeek = 0;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    inspExecs.forEach((e: any) => {
      const displayStatus = getExecutionDisplayStatus(e.status, e.due_date);
      if (displayStatus === "overdue") overdue++;
      else if (displayStatus === "in_progress") inProgress++;
      else if (displayStatus === "pending") {
        const due = new Date(e.due_date);
        due.setHours(0, 0, 0, 0);
        if (due.getTime() === today.getTime()) pendingToday++;
      }
      if ((e.status === "completed" || e.status === "completed_with_issues") && e.completed_at) {
        const completedDate = new Date(e.completed_at);
        if (completedDate >= startOfWeek) completedWeek++;
      }
    });
    return { pendingToday, inProgress, overdue, completedWeek };
  }, [inspExecs]);

  // Plan info
  const planLabel = company?.plan === "trial" ? "Trial" : company?.plan === "basic" ? "Basic" : company?.plan === "pro" ? "Pro" : company?.plan ?? "—";
  const trialDaysLeft = company?.trial_ends_at ? Math.max(0, differenceInDays(parseISO(company.trial_ends_at), new Date())) : null;

  // Urgent items
  const urgentItems = useMemo(() => {
    const items: { icon: any; iconColor: string; text: string; badge: string; badgeColor: string; link: string; priority: number }[] = [];

    // Expired services
    services.filter((s: any) => s.status !== "inactive").forEach((s: any) => {
      const st = getServiceStatus(s.next_due_at, s.alert_days_before);
      if (st === "expired") items.push({ icon: ClipboardList, iconColor: "text-destructive", text: s.name, badge: "Vencido", badgeColor: "bg-destructive/10 text-destructive", link: "/servicos", priority: 0 });
    });
    // MTR overdue
    mtrList.forEach((m: any) => {
      const st = getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at);
      if (st === "overdue") items.push({ icon: Recycle, iconColor: "text-destructive", text: `MTR ${m.mtr_number}`, badge: "CDF vencido", badgeColor: "bg-destructive/10 text-destructive", link: "/mtr", priority: 1 });
    });
    // Critical occurrences
    occurrenceList.forEach((o: any) => {
      if ((o.status === "open" || o.status === "in_progress") && o.severity === "critical") {
        items.push({ icon: ShieldAlert, iconColor: "text-destructive", text: o.location, badge: "Crítica", badgeColor: "bg-destructive/10 text-destructive", link: "/incidentes", priority: 2 });
      }
    });
    // MTR warning
    mtrList.forEach((m: any) => {
      const st = getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at);
      if (st === "warning") items.push({ icon: Recycle, iconColor: "text-yellow-600", text: `MTR ${m.mtr_number}`, badge: "CDF em alerta", badgeColor: "bg-yellow-100 text-yellow-700", link: "/mtr", priority: 4 });
    });
    // Warning services
    services.forEach((s: any) => {
      const st = getServiceStatus(s.next_due_at, s.alert_days_before);
      if (st === "warning") items.push({ icon: ClipboardList, iconColor: "text-yellow-600", text: s.name, badge: "Vencendo", badgeColor: "bg-yellow-100 text-yellow-700", link: "/servicos", priority: 5 });
    });
    // Expired/expiring licenses
    licenseList.forEach((l: any) => {
      const st = computeLicenseStatus(l.has_expiry, l.expires_at, l.alert_days_before, l.status);
      if (st === "expired") items.push({ icon: ScrollText, iconColor: "text-destructive", text: `${l.license_number} — ${l.title}`, badge: "Vencida", badgeColor: "bg-destructive/10 text-destructive", link: "/licencas", priority: 1.5 });
      else if (st === "expiring") items.push({ icon: ScrollText, iconColor: "text-yellow-600", text: `${l.license_number} — ${l.title}`, badge: "Vencendo", badgeColor: "bg-yellow-100 text-yellow-700", link: "/licencas", priority: 3.5 });
    });
    // ASO expired
    const activeEmps = employees.filter((e: any) => e.status === "active");
    for (const emp of activeEmps) {
      const empRecords = asoRecords.filter((r: any) => r.employee_id === emp.id);
      const withExpiry = empRecords.filter((r: any) => r.expires_at).sort((a: any, b: any) => b.exam_date.localeCompare(a.exam_date));
      if (withExpiry.length > 0) {
        const st = computeAsoStatus(withExpiry[0].expires_at);
        if (st === "expired") items.push({ icon: Stethoscope, iconColor: "text-destructive", text: `ASO — ${emp.name}`, badge: "Vencido", badgeColor: "bg-destructive/10 text-destructive", link: "/aso", priority: 1.5 });
        else if (st === "warning") items.push({ icon: Stethoscope, iconColor: "text-yellow-600", text: `ASO — ${emp.name}`, badge: "Vencendo", badgeColor: "bg-yellow-100 text-yellow-700", link: "/aso", priority: 3.5 });
      } else if (empRecords.length === 0) {
        // no record at all — could add but might be noisy, skip for now
      }
    }

    return items.sort((a, b) => a.priority - b.priority).slice(0, 8);
  }, [services, mtrList, occurrenceList, licenseList, employees, asoRecords]);

  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Olá, {profile?.full_name?.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Aqui está o resumo da sua gestão hoje.</p>
        <p className="text-xs text-muted-foreground mt-0.5">{todayCapitalized}</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          icon={ClipboardList} iconColor="text-primary" title="Serviços Periódicos"
          items={[
            { label: "Em dia", value: serviceStats.ok, color: "text-green-600" },
            { label: "Vencendo", value: serviceStats.warning, color: "text-yellow-600" },
            { label: "Vencidos", value: serviceStats.expired, color: "text-destructive" },
          ]}
          link="/servicos" linkLabel="Ver todos"
        />
        <DashboardCard
          icon={GraduationCap} iconColor="text-primary" title="Treinamentos"
          items={[
            { label: "Conformidade", value: `${trainingStats.conformity}%` },
            { label: "Com pendências", value: trainingStats.pendingEmps, color: trainingStats.pendingEmps > 0 ? "text-destructive" : "" },
            { label: "Vencendo", value: trainingStats.warningCount, color: trainingStats.warningCount > 0 ? "text-yellow-600" : "" },
          ]}
          link="/treinamentos" linkLabel="Ver detalhes"
        />
        <DashboardCard
          icon={Recycle} iconColor="text-primary" title="MTR"
          items={[
            { label: "CDFs pendentes", value: mtrStats.pending },
            { label: "Em alerta", value: mtrStats.warning, color: mtrStats.warning > 0 ? "text-yellow-600" : "" },
            { label: "Vencidos", value: mtrStats.overdue, color: mtrStats.overdue > 0 ? "text-destructive" : "" },
          ]}
          link="/mtr" linkLabel="Ver todos"
        />
        <DashboardCard
          icon={ScrollText} iconColor="text-primary" title="Licenças Ambientais"
          items={[
            { label: "Vigentes", value: licenseStats.active },
            { label: "Vencendo/Vencidas", value: licenseStats.alertCount, color: licenseStats.alertCount > 0 ? "text-destructive" : "" },
          ]}
          link="/licencas" linkLabel="Ver todas"
        />
        <DashboardCard
          icon={Truck} iconColor="text-primary" title="Fornecedores"
          items={[
            { label: "Ativos", value: activeSuppliers },
          ]}
          link="/fornecedores" linkLabel="Gerenciar"
        />
        <DashboardCard
          icon={ShieldAlert} iconColor="text-destructive" title="IC & NC"
          items={[
            { label: "Abertas", value: openOccs, color: openOccs > 0 ? "text-destructive" : "" },
            { label: "Ações pendentes", value: pendingActions, color: pendingActions > 0 ? "text-yellow-600" : "" },
          ]}
          link="/incidentes" linkLabel="Ver ocorrências"
        />
        <DashboardCard
          icon={ClipboardCheck} iconColor="text-primary" title="Inspeções"
          items={[
            { label: "Pendentes hoje", value: inspectionStats.pendingToday, color: inspectionStats.pendingToday > 0 ? "text-yellow-600" : "" },
            { label: "Em andamento", value: inspectionStats.inProgress, color: "text-blue-600" },
            { label: "Vencidas", value: inspectionStats.overdue, color: inspectionStats.overdue > 0 ? "text-destructive" : "" },
            { label: "Concluídas (semana)", value: inspectionStats.completedWeek, color: "text-green-600" },
          ]}
          link="/inspecoes" linkLabel="Ver execuções"
        />
        <DashboardCard
          icon={Stethoscope} iconColor="text-primary" title="ASO / Exames"
          items={[
            { label: "Em dia", value: asoStats.ok, color: "text-green-600" },
            { label: "Vencendo", value: asoStats.warning, color: asoStats.warning > 0 ? "text-yellow-600" : "" },
            { label: "Vencidos", value: asoStats.expired, color: asoStats.expired > 0 ? "text-destructive" : "" },
            { label: "Conformidade", value: `${asoStats.conformity}%` },
          ]}
          link="/aso" linkLabel="Ver ASOs"
        />
        <DashboardCard
          icon={Activity} iconColor="text-primary" title="Indicadores HSE"
          items={[
            { label: "TF (freq.)", value: tfTgStats.tf },
            { label: "TG (grav.)", value: tfTgStats.tg },
            { label: "Colab. ativos", value: tfTgStats.activeCount },
          ]}
          link="/incidentes" linkLabel="Ver ocorrências"
        />
        <div className="bg-card border rounded-lg p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Seu plano</h3>
          </div>
          <div className="flex-1 space-y-2">
            <Badge variant="outline" className="text-xs">{planLabel}</Badge>
            {company?.plan === "trial" && trialDaysLeft !== null && (
              <p className="text-sm">{trialDaysLeft} dias restantes</p>
            )}
          </div>
          <Link to="/planos" className="flex items-center gap-1 text-xs text-primary hover:underline mt-4 pt-3 border-t">
            Conhecer planos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Urgent section */}
      {urgentItems.length > 0 ? (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Requer atenção</h2>
          <div className="space-y-2">
            {urgentItems.map((item, idx) => (
              <Link key={idx} to={item.link} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors">
                <item.icon className={`h-4 w-4 flex-shrink-0 ${item.iconColor}`} />
                <span className="flex-1 text-sm font-medium truncate">{item.text}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 text-sm text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span>✅ Tudo em ordem! Nenhuma pendência crítica no momento.</span>
          </div>
        </div>
      )}
    </div>
  );
}
