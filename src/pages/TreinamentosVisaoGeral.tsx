import { useState, useMemo } from "react";
import { useEmployees, useTrainings, useTrainingMatrix, useAllRecords, useJobPositions, useSectors } from "@/hooks/useTrainings";
import { ModuleOnboarding, OnboardingStep } from "@/components/ModuleOnboarding";
import { GraduationCap, Building2, Briefcase, UserPlus, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { computeEmployeeCompliance, getRecordStatus, formatDateBR } from "@/lib/trainings";
import { TrainingKpiCards } from "@/components/treinamentos/TrainingKpiCards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Download, Upload, ChevronDown, ChevronRight, X, Users, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function TreinamentosVisaoGeral() {
  const { company, profile } = useAuth();
  const { data: employees = [] } = useEmployees();
  const { data: trainings = [] } = useTrainings();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();
  const { data: positions = [] } = useJobPositions();
  const { data: dbSectors = [] } = useSectors();
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Filters
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterTraining, setFilterTraining] = useState<string>("all");
  const [filterPendencyType, setFilterPendencyType] = useState<string>("all");
  const [filterSector, setFilterSector] = useState<string>("all");

  // Modal state
  const [pendencyModal, setPendencyModal] = useState<{ trainingId: string; trainingName: string } | null>(null);
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const activeEmployees = useMemo(() => employees.filter((e: any) => e.status === "active"), [employees]);

  const sectors = useMemo(() => {
    const s = new Set(activeEmployees.map((e: any) => e.sector).filter(Boolean));
    return [...s].sort();
  }, [activeEmployees]);

  // Apply filters to employees
  const filteredEmployees = useMemo(() => {
    return activeEmployees.filter((emp: any) => {
      if (filterPosition !== "all" && emp.job_position_id !== filterPosition) return false;
      if (filterSector !== "all" && emp.sector !== filterSector) return false;
      return true;
    });
  }, [activeEmployees, filterPosition, filterSector]);

  // Stats
  const stats = useMemo(() => {
    let totalObligations = 0;
    let fulfilledObligations = 0;
    let employeesOk = 0;
    let employeesPending = 0;
    let totalPendencies = 0;

    for (const emp of filteredEmployees) {
      const requiredIds = matrix
        .filter((m: any) => m.job_position_id === emp.job_position_id)
        .map((m: any) => m.training_id);
      if (filterTraining !== "all") {
        const filtered = requiredIds.filter((id: string) => id === filterTraining);
        if (filtered.length === 0) continue;
      }
      const empRecords = allRecords.filter((r: any) => r.employee_id === emp.id);
      const targetIds = filterTraining !== "all" ? requiredIds.filter((id: string) => id === filterTraining) : requiredIds;
      const compliance = computeEmployeeCompliance(
        targetIds,
        empRecords.map((r: any) => ({ training_id: r.training_id, expires_at: r.expires_at }))
      );
      totalObligations += compliance.required;
      fulfilledObligations += compliance.fulfilled;
      totalPendencies += compliance.pending;
      if (compliance.isCompliant && compliance.required > 0) employeesOk++;
      else if (compliance.pending > 0) employeesPending++;
    }

    const warningRecords = allRecords.filter((r: any) => {
      if (r.employees?.status !== "active") return false;
      return getRecordStatus(r.expires_at, r.trainings?.alert_days_before ?? 30) === "warning";
    });

    const conformity = totalObligations > 0 ? Math.round((fulfilledObligations / totalObligations) * 100) : 100;

    return { totalActive: filteredEmployees.length, employeesOk, employeesPending, warningCount: warningRecords.length, conformity, totalPendencies };
  }, [filteredEmployees, matrix, allRecords, filterTraining]);

  // Training pendencies with position breakdown
  const trainingPendencies = useMemo(() => {
    const map: Record<string, { id: string; name: string; missing: number; expired: number; positions: Set<string>; employeeIds: Set<string> }> = {};
    for (const t of trainings) {
      map[t.id] = { id: t.id, name: t.name, missing: 0, expired: 0, positions: new Set(), employeeIds: new Set() };
    }
    for (const emp of filteredEmployees) {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      for (const tid of requiredIds) {
        if (!map[tid]) continue;
        if (filterTraining !== "all" && tid !== filterTraining) continue;
        const latest = allRecords
          .filter((r: any) => r.employee_id === emp.id && r.training_id === tid)
          .sort((a: any, b: any) => b.expires_at.localeCompare(a.expires_at))[0];
        if (!latest) {
          if (filterPendencyType === "all" || filterPendencyType === "missing") {
            map[tid].missing++;
            map[tid].positions.add(emp.job_position_id);
            map[tid].employeeIds.add(emp.id);
          }
        } else {
          const st = getRecordStatus(latest.expires_at, trainings.find((t: any) => t.id === tid)?.alert_days_before ?? 30);
          if (st === "expired") {
            if (filterPendencyType === "all" || filterPendencyType === "expired") {
              map[tid].expired++;
              map[tid].positions.add(emp.job_position_id);
              map[tid].employeeIds.add(emp.id);
            }
          }
        }
      }
    }
    return Object.values(map)
      .filter((v) => v.missing + v.expired > 0)
      .sort((a, b) => (b.missing + b.expired) - (a.missing + a.expired));
  }, [trainings, filteredEmployees, matrix, allRecords, filterTraining, filterPendencyType]);

  // Position pendencies
  const positionPendencies = useMemo(() => {
    const map: Record<string, { id: string; name: string; total: number; ok: number; pending: number; trainingBreakdown: Record<string, { name: string; missing: number; expired: number }> }> = {};
    for (const pos of positions) {
      map[pos.id] = { id: pos.id, name: pos.name, total: 0, ok: 0, pending: 0, trainingBreakdown: {} };
    }
    for (const emp of filteredEmployees) {
      if (!emp.job_position_id || !map[emp.job_position_id]) continue;
      const posData = map[emp.job_position_id];
      posData.total++;
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      const targetIds = filterTraining !== "all" ? requiredIds.filter((id: string) => id === filterTraining) : requiredIds;
      const empRecords = allRecords.filter((r: any) => r.employee_id === emp.id);
      const compliance = computeEmployeeCompliance(
        targetIds,
        empRecords.map((r: any) => ({ training_id: r.training_id, expires_at: r.expires_at }))
      );
      if (compliance.isCompliant && compliance.required > 0) posData.ok++;
      else if (compliance.pending > 0) posData.pending++;

      // Training breakdown
      for (const tid of targetIds) {
        const t = trainings.find((t: any) => t.id === tid);
        if (!t) continue;
        if (!posData.trainingBreakdown[tid]) posData.trainingBreakdown[tid] = { name: t.name, missing: 0, expired: 0 };
        const latest = empRecords.filter((r: any) => r.training_id === tid).sort((a: any, b: any) => b.expires_at.localeCompare(a.expires_at))[0];
        if (!latest) posData.trainingBreakdown[tid].missing++;
        else if (getRecordStatus(latest.expires_at, t.alert_days_before ?? 30) === "expired") posData.trainingBreakdown[tid].expired++;
      }
    }
    return Object.values(map).filter((v) => v.total > 0).sort((a, b) => b.pending - a.pending);
  }, [positions, filteredEmployees, matrix, allRecords, trainings, filterTraining]);

  // Modal data — employees with pendency for a specific training
  const pendencyModalData = useMemo(() => {
    if (!pendencyModal) return [];
    const result: Array<{ name: string; position: string; status: string }> = [];
    for (const emp of filteredEmployees) {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      if (!requiredIds.includes(pendencyModal.trainingId)) continue;
      const latest = allRecords
        .filter((r: any) => r.employee_id === emp.id && r.training_id === pendencyModal.trainingId)
        .sort((a: any, b: any) => b.expires_at.localeCompare(a.expires_at))[0];
      if (!latest) {
        result.push({ name: emp.name, position: emp.job_positions?.name || "—", status: "Não realizado" });
      } else {
        const st = getRecordStatus(latest.expires_at, trainings.find((t: any) => t.id === pendencyModal.trainingId)?.alert_days_before ?? 30);
        if (st === "expired") {
          result.push({ name: emp.name, position: emp.job_positions?.name || "—", status: `Vencido desde ${formatDateBR(latest.expires_at)}` });
        }
      }
    }
    return result;
  }, [pendencyModal, filteredEmployees, matrix, allRecords, trainings]);

  // Export pendencies
  const handleExport = () => {
    const rows: string[][] = [["Nome do colaborador", "Cargo", "Setor", "Treinamento", "Status da pendência", "Data de vencimento"]];
    for (const emp of filteredEmployees) {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      const targetIds = filterTraining !== "all" ? requiredIds.filter((id: string) => id === filterTraining) : requiredIds;
      for (const tid of targetIds) {
        const t = trainings.find((t: any) => t.id === tid);
        if (!t) continue;
        const latest = allRecords.filter((r: any) => r.employee_id === emp.id && r.training_id === tid).sort((a: any, b: any) => b.expires_at.localeCompare(a.expires_at))[0];
        if (!latest) {
          if (filterPendencyType === "all" || filterPendencyType === "missing") {
            rows.push([emp.name, emp.job_positions?.name || "", emp.sector || "", t.name, "Não realizado", ""]);
          }
        } else {
          const st = getRecordStatus(latest.expires_at, t.alert_days_before ?? 30);
          if (st === "expired" && (filterPendencyType === "all" || filterPendencyType === "expired")) {
            rows.push([emp.name, emp.job_positions?.name || "", emp.sector || "", t.name, "Vencido", formatDateBR(latest.expires_at)]);
          }
        }
      }
    }
    if (rows.length <= 1) { toast({ title: "Nenhuma pendência para exportar" }); return; }
    const today = format(new Date(), "dd-MM-yyyy");
    downloadXlsx(rows, `pendencias_treinamentos_${today}.xlsx`);
    toast({ title: `${rows.length - 1} pendências exportadas` });
  };

  const downloadImportTemplate = () => {
    downloadXlsx(
      [["Nome do colaborador", "Cargo", "Treinamento", "Data de realização", "Data de vencimento"], ["João Silva", "Operador", "NR-35", "15/03/2026", "15/03/2028"]],
      "modelo_atualizacao_treinamentos.xlsx"
    );
  };

  const handleImport = async () => {
    if (!importFile || !company || !profile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const lines = await parseXlsx(importFile);
      if (lines.length < 2) { setImportResult("Arquivo vazio ou sem dados."); setImporting(false); return; }
      const header = lines[0].map((h) => h.toLowerCase());
      const nameIdx = header.findIndex((h) => h.includes("nome"));
      const cargoIdx = header.findIndex((h) => h.includes("cargo"));
      const treinIdx = header.findIndex((h) => h.includes("treinamento"));
      const doneIdx = header.findIndex((h) => h.includes("realização") || h.includes("realizacao"));
      const expIdx = header.findIndex((h) => h.includes("vencimento"));
      if (nameIdx === -1 || cargoIdx === -1 || treinIdx === -1 || doneIdx === -1 || expIdx === -1) {
        setImportResult("Colunas obrigatórias: Nome do colaborador, Cargo, Treinamento, Data de realização, Data de vencimento"); setImporting(false); return;
      }
      let imported = 0;
      const errors: string[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i];
        const empName = cols[nameIdx];
        const cargoName = cols[cargoIdx];
        const treinName = cols[treinIdx];
        const doneStr = cols[doneIdx];
        const expStr = cols[expIdx];
        if (!empName || !cargoName || !treinName || !doneStr || !expStr) { errors.push(`Linha ${i + 1}: campos vazios`); continue; }
        // Find employee
        const emp = employees.find((e: any) => e.name.toLowerCase() === empName.toLowerCase() && e.job_positions?.name?.toLowerCase() === cargoName.toLowerCase());
        if (!emp) { errors.push(`Linha ${i + 1}: Colaborador '${empName}' com cargo '${cargoName}' não encontrado.`); continue; }
        // Find training
        const t = trainings.find((t: any) => t.name.toLowerCase() === treinName.toLowerCase());
        if (!t) { errors.push(`Linha ${i + 1}: Treinamento '${treinName}' não encontrado. Cadastre-o primeiro.`); continue; }
        // Parse dates DD/MM/YYYY
        const parseDateBR = (s: string) => { const p = s.split("/"); if (p.length !== 3) return null; return `${p[2]}-${p[1]}-${p[0]}`; };
        const doneAt = parseDateBR(doneStr);
        const expiresAt = parseDateBR(expStr);
        if (!doneAt || !expiresAt) { errors.push(`Linha ${i + 1}: formato de data inválido. Use DD/MM/AAAA`); continue; }
        // Check if more recent record exists
        const existing = allRecords.filter((r: any) => r.employee_id === emp.id && r.training_id === t.id).sort((a: any, b: any) => b.expires_at.localeCompare(a.expires_at))[0];
        if (existing && existing.expires_at >= expiresAt) {
          errors.push(`Linha ${i + 1}: Registro mais recente já existe para ${empName} — ${treinName}.`);
          continue;
        }
        const { error } = await supabase.from("employee_training_records").insert({
          company_id: company.id, employee_id: emp.id, training_id: t.id,
          done_at: doneAt, expires_at: expiresAt, registered_by: profile.id,
        });
        if (error) { errors.push(`Linha ${i + 1}: ${error.message}`); continue; }
        imported++;
      }
      let msg = `${imported} registro${imported !== 1 ? "s" : ""} importado${imported !== 1 ? "s" : ""} com sucesso.`;
      if (errors.length > 0) msg += `\n${errors.length} erro${errors.length !== 1 ? "s" : ""} encontrado${errors.length !== 1 ? "s" : ""}.`;
      setImportResult(msg + (errors.length > 0 ? "\n\n" + errors.join("\n") : ""));
      qc.invalidateQueries({ queryKey: ["all-training-records"] });
      qc.invalidateQueries({ queryKey: ["employee-records"] });
      if (imported > 0) toast({ title: `${imported} registros importados` });
    } catch {
      setImportResult("Erro ao processar arquivo.");
    } finally {
      setImporting(false);
    }
  };

  const hasFilters = filterPosition !== "all" || filterTraining !== "all" || filterPendencyType !== "all" || filterSector !== "all";
  const clearFilters = () => { setFilterPosition("all"); setFilterTraining("all"); setFilterPendencyType("all"); setFilterSector("all"); };

  if (employees.length === 0 && trainings.length === 0) {
    return (
      <ModuleOnboarding
        title="Gestão de Treinamentos"
        description="Configure setores, cargos e colaboradores para controlar treinamentos obrigatórios."
        icon={GraduationCap}
        steps={[
          { title: "Criar setores", description: "Organize sua empresa por áreas (ex: Produção, Administrativo)", icon: Building2, actionLabel: "Ir para cargos", action: () => navigate("/treinamentos/cargos"), completed: dbSectors.length > 0 },
          { title: "Criar cargos", description: "Defina os cargos vinculados a cada setor", icon: Briefcase, actionLabel: "Ir para cargos", action: () => navigate("/treinamentos/cargos"), completed: positions.length > 0 },
          { title: "Cadastrar colaboradores", description: "Registre os colaboradores ativos da empresa", icon: UserPlus, actionLabel: "Ir para colaboradores", action: () => navigate("/treinamentos/colaboradores"), completed: employees.length > 0 },
          { title: "Cadastrar primeiro treinamento", description: "Crie um treinamento com validade e alerta", icon: BookOpen, actionLabel: "Ir para catálogo", action: () => navigate("/treinamentos/catalogo"), completed: trainings.length > 0 },
        ] as OnboardingStep[]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <TrainingKpiCards
        totalActive={stats.totalActive}
        employeesOk={stats.employeesOk}
        employeesPending={stats.employeesPending}
        warningCount={stats.warningCount}
        conformity={stats.conformity}
      />

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />Exportar pendências
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
          <Upload className="h-4 w-4 mr-1" />Importar atualização
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-muted/50 rounded-lg p-3">
        <Select value={filterPosition} onValueChange={setFilterPosition}>
          <SelectTrigger className="w-44 h-9 text-xs bg-background"><SelectValue placeholder="Cargo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            {positions.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterTraining} onValueChange={setFilterTraining}>
          <SelectTrigger className="w-44 h-9 text-xs bg-background"><SelectValue placeholder="Treinamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os treinamentos</SelectItem>
            {trainings.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPendencyType} onValueChange={setFilterPendencyType}>
          <SelectTrigger className="w-44 h-9 text-xs bg-background"><SelectValue placeholder="Tipo de pendência" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="missing">Não realizado</SelectItem>
            <SelectItem value="expired">Vencido</SelectItem>
          </SelectContent>
        </Select>
        {sectors.length > 0 && (
          <Select value={filterSector} onValueChange={setFilterSector}>
            <SelectTrigger className="w-44 h-9 text-xs bg-background"><SelectValue placeholder="Setor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os setores</SelectItem>
              {sectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 mr-1" />Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training pendencies */}
        <div className="bg-card border rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pendências por Treinamento</h3>
          {trainingPendencies.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 py-4"><CheckCircle2 className="h-4 w-4" /> Nenhuma pendência</div>
          ) : (
            <TrainingPendenciesTable pendencies={trainingPendencies} positions={positions} onClickTraining={setPendencyModal} />
          )}
        </div>

        {/* Position pendencies */}
        <div className="bg-card border rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pendências por Cargo</h3>
          {positionPendencies.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600 py-4"><CheckCircle2 className="h-4 w-4" /> Nenhuma pendência</div>
          ) : (
            <div className="space-y-1">
              {positionPendencies.map((pos) => {
                const pct = pos.total > 0 ? Math.round((pos.ok / pos.total) * 100) : 100;
                const isExpanded = expandedPosition === pos.id;
                const breakdownItems = Object.values(pos.trainingBreakdown).filter((b) => b.missing + b.expired > 0);
                return (
                  <div key={pos.id} className="border rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedPosition(isExpanded ? null : pos.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{pos.name}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                          <span>{pos.total} colab.</span>
                          <span className="text-green-600">{pos.ok} em dia</span>
                          {pos.pending > 0 && <span className="text-destructive">{pos.pending} pendente{pos.pending > 1 ? "s" : ""}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 w-24">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs font-medium w-8 text-right">{pct}%</span>
                      </div>
                    </button>
                    {isExpanded && breakdownItems.length > 0 && (
                      <div className="border-t bg-muted/30 px-3 py-2 space-y-1">
                        {breakdownItems.map((b) => (
                          <div key={b.name} className="flex items-center justify-between text-xs py-1">
                            <span className="text-muted-foreground">{b.name}</span>
                            <div className="flex gap-2">
                              {b.missing > 0 && <span className="text-muted-foreground">{b.missing} sem registro</span>}
                              {b.expired > 0 && <span className="text-destructive">{b.expired} vencido{b.expired > 1 ? "s" : ""}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pendency modal */}
      <Dialog open={!!pendencyModal} onOpenChange={(v) => !v && setPendencyModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Colaboradores com pendência — {pendencyModal?.trainingName}</DialogTitle>
          </DialogHeader>
          {pendencyModalData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma pendência encontrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendencyModalData.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={d.status === "Não realizado" ? "bg-muted text-muted-foreground" : "bg-red-100 text-red-700 border-red-200"}>
                        {d.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Import modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Importar atualização de treinamentos</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">O arquivo deve conter: Nome do colaborador, Cargo, Treinamento, Data de realização (DD/MM/AAAA), Data de vencimento (DD/MM/AAAA)</p>
            <Button variant="outline" size="sm" onClick={downloadImportTemplate}>
              <Download className="h-4 w-4 mr-1" />Baixar modelo
            </Button>
            <Input type="file" accept=".xlsx,.xls" onChange={(e) => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }} />
            {importResult && <pre className="text-xs bg-muted p-3 rounded max-h-40 overflow-auto whitespace-pre-wrap">{importResult}</pre>}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowImportModal(false)}>Fechar</Button>
            <Button onClick={handleImport} disabled={!importFile || importing}>{importing ? "Importando..." : "Importar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TrainingPendenciesTable({ pendencies, positions, onClickTraining }: { pendencies: any[]; positions: any[]; onClickTraining: (v: { trainingId: string; trainingName: string }) => void }) {
  const pagination = useTablePagination(pendencies);
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Treinamento</TableHead>
            <TableHead className="text-center">Pendências</TableHead>
            <TableHead className="text-right">Afetados</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagination.paginatedData.map((t: any) => {
            const posNames = [...t.positions].map((pid: string) => positions.find((p: any) => p.id === pid)?.name).filter(Boolean);
            return (
              <TableRow key={t.id}>
                <TableCell>
                  <span className="font-medium text-sm">{t.name}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {posNames.slice(0, 3).map((n: string) => (
                      <Badge key={n} variant="outline" className="text-[10px] px-1.5 py-0">{n}</Badge>
                    ))}
                    {posNames.length > 3 && <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{posNames.length - 3}</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="space-y-0.5">
                    {t.missing > 0 && <div className="text-[11px] text-muted-foreground">{t.missing} não realizado{t.missing > 1 ? "s" : ""}</div>}
                    {t.expired > 0 && <div className="text-[11px] text-destructive">{t.expired} vencido{t.expired > 1 ? "s" : ""}</div>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => onClickTraining({ trainingId: t.id, trainingName: t.name })}
                  >
                    <Users className="h-3.5 w-3.5" />{t.employeeIds.size}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <DataTablePagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={pagination.setCurrentPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </>
  );
}
