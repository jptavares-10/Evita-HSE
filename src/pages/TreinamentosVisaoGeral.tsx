import { useMemo } from "react";
import { useEmployees, useTrainings, useTrainingMatrix, useAllRecords } from "@/hooks/useTrainings";
import { computeEmployeeCompliance, getRecordStatus, formatDateBR } from "@/lib/trainings";
import { TrainingKpiCards } from "@/components/treinamentos/TrainingKpiCards";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function TreinamentosVisaoGeral() {
  const { data: employees = [] } = useEmployees();
  const { data: trainings = [] } = useTrainings();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();

  const activeEmployees = useMemo(() => employees.filter((e: any) => e.status === "active"), [employees]);

  const stats = useMemo(() => {
    let totalObligations = 0;
    let fulfilledObligations = 0;
    let employeesOk = 0;
    let employeesPending = 0;

    for (const emp of activeEmployees) {
      const requiredIds = matrix
        .filter((m: any) => m.job_position_id === emp.job_position_id)
        .map((m: any) => m.training_id);
      const empRecords = allRecords.filter((r: any) => r.employee_id === emp.id);
      const compliance = computeEmployeeCompliance(
        requiredIds,
        empRecords.map((r: any) => ({ training_id: r.training_id, expires_at: r.expires_at }))
      );
      totalObligations += compliance.required;
      fulfilledObligations += compliance.fulfilled;
      if (compliance.isCompliant && compliance.required > 0) employeesOk++;
      else if (compliance.pending > 0) employeesPending++;
    }

    const warningRecords = allRecords.filter((r: any) => {
      if (r.employees?.status !== "active") return false;
      return getRecordStatus(r.expires_at, r.trainings?.alert_days_before ?? 30) === "warning";
    });

    const conformity = totalObligations > 0 ? Math.round((fulfilledObligations / totalObligations) * 100) : 100;

    return { totalActive: activeEmployees.length, employeesOk, employeesPending, warningCount: warningRecords.length, conformity };
  }, [activeEmployees, matrix, allRecords]);

  // Training pendencies
  const trainingPendencies = useMemo(() => {
    const map: Record<string, { name: string; missing: number; expired: number }> = {};
    for (const t of trainings) {
      map[t.id] = { name: t.name, missing: 0, expired: 0 };
    }
    for (const emp of activeEmployees) {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      for (const tid of requiredIds) {
        if (!map[tid]) continue;
        const latest = allRecords
          .filter((r: any) => r.employee_id === emp.id && r.training_id === tid)
          .sort((a: any, b: any) => b.expires_at.localeCompare(a.expires_at))[0];
        if (!latest) { map[tid].missing++; }
        else {
          const st = getRecordStatus(latest.expires_at, trainings.find((t: any) => t.id === tid)?.alert_days_before ?? 30);
          if (st === "expired") map[tid].expired++;
        }
      }
    }
    return Object.values(map).filter((v) => v.missing + v.expired > 0).sort((a, b) => (b.missing + b.expired) - (a.missing + a.expired)).slice(0, 10);
  }, [trainings, activeEmployees, matrix, allRecords]);

  // Warning alerts
  const warningAlerts = useMemo(() => {
    return allRecords
      .filter((r: any) => r.employees?.status === "active" && getRecordStatus(r.expires_at, r.trainings?.alert_days_before ?? 30) === "warning")
      .sort((a: any, b: any) => a.expires_at.localeCompare(b.expires_at))
      .slice(0, 10);
  }, [allRecords]);

  return (
    <div className="space-y-6">
      <TrainingKpiCards
        totalActive={stats.totalActive}
        employeesOk={stats.employeesOk}
        employeesPending={stats.employeesPending}
        warningCount={stats.warningCount}
        conformity={stats.conformity}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training pendencies */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Treinamentos com mais pendências</h3>
          {trainingPendencies.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> Nenhuma pendência</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Treinamento</TableHead><TableHead className="text-right">Pendências</TableHead></TableRow></TableHeader>
              <TableBody>
                {trainingPendencies.map((t) => (
                  <TableRow key={t.name}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-right">
                      {t.expired > 0 && <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 mr-1">{t.expired} vencido{t.expired > 1 ? "s" : ""}</Badge>}
                      {t.missing > 0 && <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">{t.missing} sem registro</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Warning alerts */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Alertas — Vencendo em breve</h3>
          {warningAlerts.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> Nenhum certificado próximo do vencimento</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Colaborador</TableHead><TableHead>Treinamento</TableHead><TableHead>Vence em</TableHead></TableRow></TableHeader>
              <TableBody>
                {warningAlerts.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.employees?.name}</TableCell>
                    <TableCell>{r.trainings?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />{formatDateBR(r.expires_at)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
