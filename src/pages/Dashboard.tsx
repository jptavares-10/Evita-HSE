import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, ArrowRight, ArrowUpRight, Inbox } from "lucide-react";
import { usePeriodicServices } from "@/hooks/useServices";
import { getServiceStatus } from "@/lib/services";
import { useEmployees, useTrainingMatrix, useAllRecords } from "@/hooks/useTrainings";
import { computeEmployeeCompliance, getRecordStatus } from "@/lib/trainings";
import { useMtrs } from "@/hooks/useMTR";
import { getCdfDisplayStatus } from "@/lib/mtr";
import { useOccurrences, useAllCorrectiveActions } from "@/hooks/useOccurrences";
import { useEnvironmentalLicenses } from "@/hooks/useLicenses";
import { computeLicenseStatus } from "@/lib/licenses";
import { useAsoRecords } from "@/hooks/useAso";
import { useInspectionExecutions } from "@/hooks/useInspections";
import { getExecutionDisplayStatus } from "@/lib/inspections";
import { useMyPendingReviewCount } from "@/hooks/useDocumentReviews";
import { computeAsoStatus } from "@/lib/aso";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Dashboard() {
  usePageTitle("Dashboard — Evita HSE", { description: "Visão geral de indicadores HSE e alertas.", noindex: true });
  const { profile } = useAuth();
  const { data: services = [], isLoading: loadingServices } = usePeriodicServices();
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();
  const { data: mtrList = [], isLoading: loadingMtr } = useMtrs();
  const { data: occurrenceList = [], isLoading: loadingOccurrences } = useOccurrences();
  const { data: allCorrectiveActions = [] } = useAllCorrectiveActions();
  const { data: licenseList = [], isLoading: loadingLicenses } = useEnvironmentalLicenses();
  const { data: asoRecords = [] } = useAsoRecords();
  const { data: inspExecs = [] } = useInspectionExecutions();

  const isLoading = loadingServices || loadingEmployees || loadingMtr || loadingOccurrences || loadingLicenses;

  // Services stats
  const serviceStats = useMemo(() => {
    let ok = 0, warning = 0, expired = 0;
    services.filter((s: any) => s.status !== "inactive").forEach((s: any) => {
      const st = getServiceStatus(s.next_due_at, s.alert_days_before);
      if (st === "expired") expired++;
      else if (st === "warning") warning++;
      else ok++;
    });
    const total = ok + warning + expired;
    const conformity = total > 0 ? Math.round((ok / total) * 100) : 100;
    return { ok, warning, expired, conformity };
  }, [services]);

  // Training stats
  const trainingStats = useMemo(() => {
    const activeEmps = employees.filter((e: any) => e.status === "active");
    let totalObl = 0, fulfilled = 0, pendingEmps = 0;
    for (const emp of activeEmps) {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      const empRecords = allRecords.filter((r: any) => r.employee_id === emp.id);
      const c = computeEmployeeCompliance(requiredIds, empRecords);
      totalObl += c.required;
      fulfilled += c.fulfilled;
      if (c.pending > 0) pendingEmps++;
    }
    const conformity = totalObl > 0 ? Math.round((fulfilled / totalObl) * 100) : 100;
    return { conformity, pendingEmps };
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
    return { pending, warning, overdue };
  }, [mtrList]);

  // Occurrence stats
  const openOccs = occurrenceList.filter((o: any) => o.status === "open" || o.status === "in_progress").length;
  const pendingActions = allCorrectiveActions.filter((a: any) => a.status !== "completed").length;

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
        ok++;
      } else {
        expired++;
      }
    }
    const conformity = total > 0 ? Math.round((ok / total) * 100) : 100;
    return { ok, warning, expired, conformity };
  }, [employees, asoRecords]);

  // Inspection stats (week)
  const inspectionStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let pending = 0, overdue = 0, completedWeek = 0;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    inspExecs.forEach((e: any) => {
      const displayStatus = getExecutionDisplayStatus(e.status, e.due_date);
      if (displayStatus === "overdue") overdue++;
      else if (displayStatus === "pending" || displayStatus === "in_progress") pending++;
      if ((e.status === "completed" || e.status === "completed_with_issues") && e.completed_at) {
        const completedDate = new Date(e.completed_at);
        if (completedDate >= startOfWeek) completedWeek++;
      }
    });
    return { pending, overdue, completedWeek };
  }, [inspExecs]);

  // Active employees count
  const activeEmployeeCount = employees.filter((e: any) => e.status === "active").length;

  // Global KPI: total expired items across all modules
  const globalExpired = useMemo(() => {
    let count = 0;
    // services expired
    services.filter((s: any) => s.status !== "inactive").forEach((s: any) => {
      if (getServiceStatus(s.next_due_at, s.alert_days_before) === "expired") count++;
    });
    // mtr overdue
    mtrList.forEach((m: any) => {
      if (getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at) === "overdue") count++;
    });
    // licenses expired
    licenseList.forEach((l: any) => {
      if (computeLicenseStatus(l.has_expiry, l.expires_at, l.alert_days_before, l.status) === "expired") count++;
    });
    // aso expired
    count += asoStats.expired;
    // inspection overdue
    count += inspectionStats.overdue;
    // training expired records
    allRecords.forEach((r: any) => {
      if (getRecordStatus(r.expires_at, r.trainings?.alert_days_before ?? 30) === "expired") count++;
    });
    return count;
  }, [services, mtrList, licenseList, asoStats.expired, inspectionStats.overdue, allRecords]);

  // Global KPI: total warning items (next 30 days)
  const globalWarning = useMemo(() => {
    let count = 0;
    services.filter((s: any) => s.status !== "inactive").forEach((s: any) => {
      if (getServiceStatus(s.next_due_at, s.alert_days_before) === "warning") count++;
    });
    mtrList.forEach((m: any) => {
      if (getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at) === "warning") count++;
    });
    licenseList.forEach((l: any) => {
      if (computeLicenseStatus(l.has_expiry, l.expires_at, l.alert_days_before, l.status) === "expiring") count++;
    });
    count += asoStats.warning;
    allRecords.forEach((r: any) => {
      if (getRecordStatus(r.expires_at, r.trainings?.alert_days_before ?? 30) === "warning") count++;
    });
    return count;
  }, [services, mtrList, licenseList, asoStats.warning, allRecords]);

  // Global conformity (weighted average of services, trainings, aso)
  const globalConformity = useMemo(() => {
    const weights = [
      { val: serviceStats.conformity, w: 1 },
      { val: trainingStats.conformity, w: 1 },
      { val: asoStats.conformity, w: 1 },
    ];
    const totalW = weights.reduce((s, x) => s + x.w, 0);
    return Math.round(weights.reduce((s, x) => s + x.val * x.w, 0) / totalW);
  }, [serviceStats.conformity, trainingStats.conformity, asoStats.conformity]);

  // Urgent items for sidebar (critical banner + sidebar card)
  const urgentItems = useMemo(() => {
    const items: { text: string; module: string; type: "expired" | "warning"; link: string; daysAway?: number }[] = [];

    services.filter((s: any) => s.status !== "inactive").forEach((s: any) => {
      const st = getServiceStatus(s.next_due_at, s.alert_days_before);
      if (st === "expired") items.push({ text: s.name, module: "Serviços", type: "expired", link: "/servicos", daysAway: -1 });
      else if (st === "warning") {
        const days = differenceInDays(parseISO(s.next_due_at), new Date());
        items.push({ text: s.name, module: "Serviços", type: "warning", link: "/servicos", daysAway: days });
      }
    });
    mtrList.forEach((m: any) => {
      const st = getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at);
      if (st === "overdue") items.push({ text: `MTR ${m.mtr_number}`, module: "MTR", type: "expired", link: "/mtr", daysAway: -1 });
      else if (st === "warning") {
        const days = differenceInDays(parseISO(m.cdf_deadline_at), new Date());
        items.push({ text: `MTR ${m.mtr_number}`, module: "MTR", type: "warning", link: "/mtr", daysAway: days });
      }
    });
    licenseList.forEach((l: any) => {
      const st = computeLicenseStatus(l.has_expiry, l.expires_at, l.alert_days_before, l.status);
      if (st === "expired") items.push({ text: l.title, module: "Licenças", type: "expired", link: "/licencas", daysAway: -1 });
      else if (st === "expiring") {
        const days = l.expires_at ? differenceInDays(parseISO(l.expires_at), new Date()) : 30;
        items.push({ text: l.title, module: "Licenças", type: "warning", link: "/licencas", daysAway: days });
      }
    });
    const activeEmps = employees.filter((e: any) => e.status === "active");
    for (const emp of activeEmps) {
      const empRecords = asoRecords.filter((r: any) => r.employee_id === emp.id);
      const withExpiry = empRecords.filter((r: any) => r.expires_at).sort((a: any, b: any) => b.exam_date.localeCompare(a.exam_date));
      if (withExpiry.length > 0) {
        const st = computeAsoStatus(withExpiry[0].expires_at);
        if (st === "expired") items.push({ text: emp.name, module: "ASO", type: "expired", link: "/aso", daysAway: -1 });
        else if (st === "warning") {
          const days = differenceInDays(parseISO(withExpiry[0].expires_at), new Date());
          items.push({ text: emp.name, module: "ASO", type: "warning", link: "/aso", daysAway: days });
        }
      }
    }
    inspExecs.forEach((e: any) => {
      const displayStatus = getExecutionDisplayStatus(e.status, e.due_date);
      if (displayStatus === "overdue") items.push({ text: e.reference || "Inspeção", module: "Inspeções", type: "expired", link: "/inspecoes", daysAway: -1 });
    });

    return items.sort((a, b) => {
      if (a.type === "expired" && b.type !== "expired") return -1;
      if (a.type !== "expired" && b.type === "expired") return 1;
      return (a.daysAway ?? 0) - (b.daysAway ?? 0);
    });
  }, [services, mtrList, licenseList, employees, asoRecords, inspExecs]);

  // Critical items for banner (expired or warning ≤ 7 days)
  const criticalItems = useMemo(() => {
    return urgentItems.filter(i => i.type === "expired" || (i.type === "warning" && (i.daysAway ?? 99) <= 7));
  }, [urgentItems]);

  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const conformityColor = (v: number) => v >= 80 ? "text-green-600" : v >= 50 ? "text-yellow-600" : "text-destructive";
  const conformityBg = (v: number) => v >= 80 ? "[&>div]:bg-green-500" : v >= 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-destructive";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* SECTION 1 — Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-semibold tracking-tight text-foreground">
            Olá, {profile?.full_name?.split(" ")[0] ?? "bem-vindo"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {todayCapitalized} · Aqui está o resumo da sua operação.
          </p>
        </div>
        {globalExpired + globalWarning === 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Tudo em dia
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            {globalExpired + globalWarning} pendência{globalExpired + globalWarning === 1 ? "" : "s"} em aberto
          </span>
        )}
      </div>

      {/* SECTION 2 — Critical Alert Banner */}
      {criticalItems.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
            </span>
            <span className="text-[13px] font-semibold text-destructive">
              {criticalItems.length} {criticalItems.length === 1 ? "item requer" : "itens requerem"} atenção imediata
            </span>
          </div>
          <p className="text-xs text-destructive/85 mt-1 ml-5">
            {criticalItems.slice(0, 4).map(i => i.text).join(" · ")}
            {criticalItems.length > 4 && ` e mais ${criticalItems.length - 4}...`}
          </p>
        </div>
      )}

      {/* SECTION 3 — KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Conformidade geral" value={`${globalConformity}%`} colorClass={conformityColor(globalConformity)} />
        <KpiCard label="Colaboradores ativos" value={activeEmployeeCount} link="/treinamentos/colaboradores" />
        <KpiCard label="Itens vencidos" value={globalExpired} colorClass={globalExpired > 0 ? "text-destructive" : "text-success"} />
        <KpiCard label="Vencendo em 30 dias" value={globalWarning} colorClass={globalWarning > 0 ? "text-warning" : "text-success"} />
      </div>

      {/* SECTION 4 — Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3">
        {/* Left: Modules */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground mb-2">
            Módulos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ModuleCard
              dotColor="bg-primary"
              title="Serviços Periódicos"
              link="/servicos"
              linkLabel="Ver todos"
              stats={[
                { label: "Em dia", value: serviceStats.ok, color: "text-green-600" },
                { label: "Vencendo", value: serviceStats.warning, color: "text-yellow-600" },
                { label: "Vencidos", value: serviceStats.expired, color: "text-destructive" },
              ]}
            />
            <ModuleCard
              dotColor="bg-amber-500"
              title="Treinamentos"
              link="/treinamentos"
              linkLabel="Ver detalhes"
              stats={[
                { label: "Conformidade", value: `${trainingStats.conformity}%` },
                { label: "Com pendências", value: trainingStats.pendingEmps, color: trainingStats.pendingEmps > 0 ? "text-destructive" : undefined },
              ]}
            />
            <ModuleCard
              dotColor="bg-teal-500"
              title="Gestão de MTR"
              link="/mtr"
              linkLabel="Ver todos"
              stats={[
                { label: "CDFs pendentes", value: mtrStats.pending },
                { label: "Em alerta", value: mtrStats.warning, color: mtrStats.warning > 0 ? "text-yellow-600" : undefined },
                { label: "Vencidos", value: mtrStats.overdue, color: mtrStats.overdue > 0 ? "text-destructive" : undefined },
              ]}
            />
            <ModuleCard
              dotColor="bg-purple-500"
              title="ASO / Exames"
              link="/aso"
              linkLabel="Ver ASOs"
              stats={[
                { label: "Em dia", value: asoStats.ok, color: "text-green-600" },
                { label: "Vencendo", value: asoStats.warning, color: asoStats.warning > 0 ? "text-yellow-600" : undefined },
                { label: "Vencidos", value: asoStats.expired, color: asoStats.expired > 0 ? "text-destructive" : undefined },
              ]}
            />
            <ModuleCard
              dotColor="bg-green-500"
              title="Licenças Ambientais"
              link="/licencas"
              linkLabel="Ver todas"
              stats={[
                { label: "Vigentes", value: licenseStats.active },
                { label: "Vencendo/Vencidas", value: licenseStats.alertCount, color: licenseStats.alertCount > 0 ? "text-destructive" : undefined },
              ]}
            />
            <ModuleCard
              dotColor="bg-destructive"
              title="IC & NC"
              link="/incidentes"
              linkLabel="Ver ocorrências"
              stats={[
                { label: "Abertas", value: openOccs, color: openOccs > 0 ? "text-destructive" : undefined },
                { label: "Ações pendentes", value: pendingActions, color: pendingActions > 0 ? "text-yellow-600" : undefined },
              ]}
            />
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-3">
          {/* Urgent items */}
          <div className="lp-card rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Pendências urgentes</p>
            {urgentItems.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-green-600 py-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Nenhuma pendência urgente</span>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentItems.slice(0, 3).map((item, idx) => (
                  <Link key={idx} to={item.link} className="flex items-center gap-2 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">{item.text}</p>
                      <p className="text-[11px] text-muted-foreground">{item.module}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      item.type === "expired"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {item.type === "expired" ? "Vencido" : "Vencendo"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Document reviews pending */}
          <ReviewDashboardCard />

          {/* Conformity by module */}
          <div className="lp-card rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Conformidade por módulo</p>
            <div className="space-y-3">
              <ConformityRow label="Treinamentos" value={trainingStats.conformity} conformityBg={conformityBg} />
              <ConformityRow label="ASO / Exames" value={asoStats.conformity} conformityBg={conformityBg} />
              <ConformityRow label="Serviços" value={serviceStats.conformity} conformityBg={conformityBg} />
            </div>
          </div>

          {/* Inspections this week */}
          <div className="lp-card rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Inspeções — semana atual</p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums">{inspectionStats.pending}</p>
                <p className="text-[10px] text-muted-foreground">Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-green-600">{inspectionStats.completedWeek}</p>
                <p className="text-[10px] text-muted-foreground">Concluídas</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold tabular-nums ${inspectionStats.overdue > 0 ? "text-destructive" : ""}`}>{inspectionStats.overdue}</p>
                <p className="text-[10px] text-muted-foreground">Vencidas</p>
              </div>
            </div>
            <Link to="/inspecoes" className="flex items-center gap-1 text-xs text-primary hover:underline mt-3 pt-2.5 border-t">
              Ver execuções <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function KpiCard({ label, value, colorClass, link }: { label: string; value: string | number; colorClass?: string; link?: string }) {
  const inner = (
    <>
      <p className={`text-2xl font-display font-semibold tabular-nums ${colorClass || "text-foreground"}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    </>
  );
  const cls = "lp-card lp-interactive rounded-xl px-4 py-3.5 block";
  if (link) {
    return <Link to={link} className={cls}>{inner}</Link>;
  }
  return <div className="lp-card rounded-xl px-4 py-3.5">{inner}</div>;
}

function ModuleCard({ dotColor, title, link, stats }: {
  dotColor: string;
  title: string;
  link: string;
  linkLabel?: string;
  stats: { label: string; value: string | number; color?: string; filter?: string }[];
}) {
  return (
    <Link
      to={link}
      className="lp-card lp-interactive rounded-xl px-4 py-4 flex flex-col group"
      aria-label={`Abrir ${title}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          <span className="text-[13px] font-semibold text-foreground">{title}</span>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {stats.map(s => (
          <div key={s.label}>
            <p className={`text-xl font-display font-semibold tabular-nums ${s.color || "text-foreground"}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </Link>
  );
}

function ConformityRow({ label, value, conformityBg }: { label: string; value: number; conformityBg: (v: number) => string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-foreground">{label}</span>
        <span className="text-xs font-medium tabular-nums">{value}%</span>
      </div>
      <Progress value={value} className={`h-1 ${conformityBg(value)}`} />
    </div>
  );
}

function ReviewDashboardCard() {
  const count = useMyPendingReviewCount();
  if (count === 0) return null;
  return (
    <div className="lp-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Inbox className="h-4 w-4 text-blue-600" />
        <p className="text-xs font-medium text-muted-foreground">Documentos para revisar</p>
      </div>
      <p className="text-lg font-bold tabular-nums">{count}</p>
      <Link to="/revisoes" className="flex items-center gap-1 text-xs text-primary hover:underline mt-2 pt-2 border-t">
        Ver pendências <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
