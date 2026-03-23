import { useAuth } from "@/contexts/AuthContext";
import { ClipboardList, GraduationCap, Truck, AlertTriangle, CheckCircle2, XCircle, ArrowRight, TrendingUp, Recycle, Users, ShieldAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePeriodicServices } from "@/hooks/useServices";
import { getServiceStatus, getStatusInfo, formatDateBR } from "@/lib/services";
import { useEmployees, useTrainingMatrix, useAllRecords } from "@/hooks/useTrainings";
import { computeEmployeeCompliance, getRecordStatus } from "@/lib/trainings";
import { useMtrs } from "@/hooks/useMTR";
import { getCdfDisplayStatus, getDaysRemainingLabel, formatDateBR as formatDateMtr } from "@/lib/mtr";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useOccurrences, useAllCorrectiveActions } from "@/hooks/useOccurrences";
import { getTypeInfo, getSeverityInfo, formatDateTimeBR } from "@/lib/occurrences";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: services = [] } = usePeriodicServices();
  const { data: employees = [] } = useEmployees();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();
  const { data: mtrList = [] } = useMtrs();
  const { data: supplierList = [] } = useSuppliers();

  const activeSuppliers = supplierList.filter((s: any) => s.status === "active").length;

  const urgentServices = useMemo(() => {
    return services
      .map((s: any) => ({ ...s, _status: getServiceStatus(s.next_due_at, s.alert_days_before), _statusInfo: getStatusInfo(s.next_due_at, s.alert_days_before) }))
      .filter((s: any) => s._status === "expired" || s._status === "warning")
      .sort((a: any, b: any) => a.next_due_at.localeCompare(b.next_due_at))
      .slice(0, 5);
  }, [services]);

  const trainingStats = useMemo(() => {
    const activeEmps = employees.filter((e: any) => e.status === "active");
    let totalObligations = 0;
    let fulfilledObligations = 0;
    let pendingEmployees = 0;

    for (const emp of activeEmps) {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      const empRecords = allRecords.filter((r: any) => r.employee_id === emp.id).map((r: any) => ({ training_id: r.training_id, expires_at: r.expires_at }));
      const c = computeEmployeeCompliance(requiredIds, empRecords);
      totalObligations += c.required;
      fulfilledObligations += c.fulfilled;
      if (c.pending > 0) pendingEmployees++;
    }

    const conformity = totalObligations > 0 ? Math.round((fulfilledObligations / totalObligations) * 100) : 100;
    return { conformity, pendingEmployees, hasData: activeEmps.length > 0 };
  }, [employees, matrix, allRecords]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {profile?.full_name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao painel de gestão de HSE.</p>
      </div>

      {/* Attention section */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Atenção necessária</h2>
        {urgentServices.length === 0 ? (
          <div className="flex items-center gap-3 text-sm text-green-600"><CheckCircle2 className="h-5 w-5" /><span>Todos os serviços estão em dia</span></div>
        ) : (
          <div className="space-y-2">
            {urgentServices.map((s: any) => (
              <Link key={s.id} to="/servicos" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors">
                {s._status === "expired" ? <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                <span className="flex-1 text-sm font-medium">{s.name}</span>
                <Badge variant="outline" className={s._statusInfo.color + " text-xs"}>{s._statusInfo.label}</Badge>
                <span className="text-xs text-muted-foreground tabular-nums">{formatDateBR(s.next_due_at)}</span>
              </Link>
            ))}
            <Link to="/servicos" className="flex items-center gap-1 text-sm text-primary hover:underline mt-2 pl-3">Ver todos <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        )}
      </div>

      {/* Training conformity card */}
      {trainingStats.hasData && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Conformidade de Treinamentos</h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-3xl font-bold tabular-nums">{trainingStats.conformity}%</p>
                <p className="text-xs text-muted-foreground">Conformidade geral</p>
              </div>
            </div>
            {trainingStats.pendingEmployees > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">{trainingStats.pendingEmployees} colaborador{trainingStats.pendingEmployees > 1 ? "es" : ""} com pendências</span>
              </div>
            )}
            <Link to="/treinamentos" className="ml-auto text-sm text-primary hover:underline flex items-center gap-1">Ver detalhes <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      )}

      {/* MTR alerts card */}
      {(() => {
        const urgentMtrs = mtrList
          .map((m: any) => ({ ...m, _st: getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at) }))
          .filter((m: any) => m._st === "warning" || m._st === "overdue")
          .sort((a: any, b: any) => a.cdf_deadline_at.localeCompare(b.cdf_deadline_at))
          .slice(0, 3);
        if (urgentMtrs.length === 0) return null;
        return (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">MTRs com CDF Pendente</h2>
            <div className="space-y-2">
              {urgentMtrs.map((m: any) => (
                <Link key={m.id} to="/mtr" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors">
                  {m._st === "overdue" ? <XCircle className="h-4 w-4 text-destructive flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                  <span className="flex-1 text-sm font-medium">MTR {m.mtr_number}</span>
                  <span className="text-xs text-muted-foreground">{formatDateMtr(m.cdf_deadline_at)}</span>
                  <span className={`text-xs font-medium ${m._st === "overdue" ? "text-destructive" : "text-yellow-600"}`}>{getDaysRemainingLabel(m.cdf_status, m.cdf_deadline_at)}</span>
                </Link>
              ))}
              <Link to="/mtr" className="flex items-center gap-1 text-sm text-primary hover:underline mt-2 pl-3">Ver todos <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        );
      })()}

      {/* Suppliers card */}
      {activeSuppliers > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Fornecedores</h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-3xl font-bold tabular-nums">{activeSuppliers}</p>
                <p className="text-xs text-muted-foreground">Fornecedores ativos</p>
              </div>
            </div>
            <Link to="/fornecedores" className="ml-auto text-sm text-primary hover:underline flex items-center gap-1">Gerenciar fornecedores <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      )}
    </div>
  );
}
