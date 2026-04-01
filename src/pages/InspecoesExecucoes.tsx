import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInspectionExecutions, useInspectionModels, useAutoGenerateExecutions } from "@/hooks/useInspections";
import { getExecutionDisplayStatus, STATUS_CONFIG, formatDateBR, getFrequencyLabel } from "@/lib/inspections";
import { InspectionKpiCards } from "@/components/inspecoes/InspectionKpiCards";
import { NewExecutionModal } from "@/components/inspecoes/NewExecutionModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Plus, Search, ClipboardCheck } from "lucide-react";
import { startOfWeek, endOfWeek, parseISO, isWithinInterval, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TableSkeleton } from "@/components/TableSkeleton";

export default function InspecoesExecucoes() {
  const { company } = useAuth();
  const { data: executions = [], isLoading } = useInspectionExecutions();
  const { data: models = [] } = useInspectionModels();
  const navigate = useNavigate();
  const isExpired = company?.plan === "expired";
  useAutoGenerateExecutions();

  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const [newExecOpen, setNewExecOpen] = useState(false);

  const enriched = useMemo(() => executions.map((e: any) => ({
    ...e,
    _displayStatus: getExecutionDisplayStatus(e.status, e.due_date),
  })), [executions]);

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const kpis = useMemo(() => {
    let pendingToday = 0, inProgress = 0, overdue = 0, completedWeek = 0;
    enriched.forEach((e: any) => {
      if (e._displayStatus === "overdue") overdue++;
      if (e._displayStatus === "in_progress") inProgress++;
      if (e._displayStatus === "pending" && e.due_date === today) pendingToday++;
      if ((e._displayStatus === "completed" || e._displayStatus === "completed_with_issues")) {
        try {
          const d = parseISO(e.due_date);
          if (isWithinInterval(d, { start: weekStart, end: weekEnd })) completedWeek++;
        } catch {}
      }
    });
    return { pendingToday, inProgress, overdue, completedWeek };
  }, [enriched, today]);

  const filtered = useMemo(() => {
    let result = enriched;

    // Date range filter
    if (dateFrom) result = result.filter((e: any) => e.due_date >= dateFrom);
    if (dateTo) result = result.filter((e: any) => e.due_date <= dateTo);

    if (search) result = result.filter((e: any) => e.reference?.toLowerCase().includes(search.toLowerCase()));
    if (modelFilter !== "all") result = result.filter((e: any) => e.model_id === modelFilter);

    // KPI filter overrides status
    const activeStatus = kpiFilter || (statusFilter !== "all" ? statusFilter : null);
    if (activeStatus) {
      if (activeStatus === "pending_today") result = result.filter((e: any) => e._displayStatus === "pending" && e.due_date === today);
      else if (activeStatus === "in_progress") result = result.filter((e: any) => e._displayStatus === "in_progress");
      else if (activeStatus === "overdue") result = result.filter((e: any) => e._displayStatus === "overdue");
      else if (activeStatus === "completed_week") result = result.filter((e: any) => (e._displayStatus === "completed" || e._displayStatus === "completed_with_issues") && (() => { try { return isWithinInterval(parseISO(e.due_date), { start: weekStart, end: weekEnd }); } catch { return false; } })());
      else result = result.filter((e: any) => e._displayStatus === activeStatus);
    }

    return result.sort((a: any, b: any) => a.due_date.localeCompare(b.due_date));
  }, [enriched, search, modelFilter, statusFilter, kpiFilter, dateFrom, dateTo, today]);

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
  };

  const profiles = useMemo(() => {
    const map = new Map();
    models.forEach((m: any) => {
      if (m.default_responsible) map.set(m.default_responsible_id, m.default_responsible);
    });
    return Array.from(map.values());
  }, [models]);

  return (
    <div className="space-y-6">
      <InspectionKpiCards
        pendingToday={kpis.pendingToday}
        inProgress={kpis.inProgress}
        overdue={kpis.overdue}
        completedThisWeek={kpis.completedWeek}
        activeFilter={kpiFilter}
        onFilterClick={(f) => { setKpiFilter(f); if (f) setStatusFilter("all"); }}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar inspeção..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[140px]" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[140px]" />
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={clearDateFilter}>Limpar</Button>
          )}
        </div>
        <Select value={modelFilter} onValueChange={setModelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os modelos</SelectItem>
            {models.map((m: any) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setKpiFilter(null); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="overdue">Vencida</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="completed_with_issues">Concluída c/ pendências</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setNewExecOpen(true)} disabled={!!isExpired}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nova execução manual
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton columns={7} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhuma inspeção programada para este período.</p>
          {(dateFrom || dateTo) && (
            <Button variant="link" onClick={clearDateFilter}>Ver todos os períodos</Button>
          )}
        </div>
      ) : (
        <div className="bg-card border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da inspeção</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Data prevista</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((exec: any) => {
                const cfg = STATUS_CONFIG[exec._displayStatus as keyof typeof STATUS_CONFIG];
                const model = exec.inspection_models;
                return (
                  <TableRow key={exec.id}>
                    <TableCell>
                      <button onClick={() => navigate(`/inspecoes/${exec.id}`)} className="text-left font-medium text-primary hover:underline">
                        {exec.reference || model?.name || "—"}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm">{model?.sectors?.name || "—"}</TableCell>
                    <TableCell className="text-sm tabular-nums">{formatDateBR(exec.due_date)}</TableCell>
                    <TableCell className="text-sm">{model?.default_responsible?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${cfg?.bgColor} ${cfg?.color}`}>{cfg?.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/inspecoes/${exec.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver detalhes</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <NewExecutionModal
        open={newExecOpen}
        onOpenChange={setNewExecOpen}
        onCreated={(id) => navigate(`/inspecoes/${id}`)}
        profiles={profiles}
      />
    </div>
  );
}
