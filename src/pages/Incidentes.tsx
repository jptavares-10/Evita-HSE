import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOccurrences, useAllCorrectiveActions, useCloseOccurrence } from "@/hooks/useOccurrences";
import { OccurrenceKpiCards } from "@/components/incidentes/OccurrenceKpiCards";
import { OccurrenceDrawer } from "@/components/incidentes/OccurrenceDrawer";
import { OccurrenceDetailDrawer } from "@/components/incidentes/OccurrenceDetailDrawer";
import { DeleteOccurrenceDialog } from "@/components/incidentes/DeleteOccurrenceDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Search, Eye, Pencil, XCircle, Trash2, AlertTriangle } from "lucide-react";
import { getTypeInfo, getSeverityInfo, getStatusInfo, formatDateTimeBR, OCCURRENCE_TYPES, SEVERITY_LEVELS, STATUS_OPTIONS } from "@/lib/occurrences";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Incidentes() {
  usePageTitle("IC & NC — Evita HSE");
  const { company } = useAuth();
  const planExpired = company?.plan === "expired";
  const { data: occurrences = [], isLoading } = useOccurrences();
  const { data: allActions = [] } = useAllCorrectiveActions();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedOcc, setSelectedOcc] = useState<any>(null);
  const [editingOcc, setEditingOcc] = useState<any>(null);

  const closeOcc = useCloseOccurrence();

  const filtered = useMemo(() => {
    return occurrences.filter((o: any) => {
      if (search && !o.description.toLowerCase().includes(search.toLowerCase()) && !o.location.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && o.type !== typeFilter) return false;
      if (severityFilter !== "all" && o.severity !== severityFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (dateFrom && o.occurred_at < dateFrom) return false;
      if (dateTo && o.occurred_at > dateTo + "T23:59:59") return false;
      return true;
    });
  }, [occurrences, search, typeFilter, severityFilter, statusFilter, dateFrom, dateTo]);

  // Calculate actions per occurrence
  const actionsByOcc = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    for (const a of allActions) {
      if (!map[a.occurrence_id]) map[a.occurrence_id] = { total: 0, completed: 0 };
      map[a.occurrence_id].total++;
      if (a.status === "completed") map[a.occurrence_id].completed++;
    }
    return map;
  }, [allActions]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">IC & NC — Incidentes e Não Conformidades</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie ocorrências e ações corretivas</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button onClick={() => { setEditingOcc(null); setDrawerOpen(true); }} disabled={planExpired}>
                <Plus className="h-4 w-4 mr-2" />Registrar ocorrência
              </Button>
            </span>
          </TooltipTrigger>
          {planExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
        </Tooltip>
      </div>

      <OccurrenceKpiCards occurrences={occurrences} actions={allActions} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por descrição ou local..." className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {OCCURRENCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Gravidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {SEVERITY_LEVELS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[140px]" placeholder="De" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[140px]" placeholder="Até" />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {occurrences.length === 0 ? "Nenhuma ocorrência registrada. Isso é uma boa notícia! 🎉" : "Nenhuma ocorrência encontrada com os filtros aplicados."}
          </p>
          {occurrences.length === 0 && (
            <Button onClick={() => { setEditingOcc(null); setDrawerOpen(true); }} disabled={planExpired}>Registrar primeira ocorrência</Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="max-w-[200px]">Descrição</TableHead>
                <TableHead>Gravidade</TableHead>
                <TableHead>Ações</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((occ: any) => {
                const ti = getTypeInfo(occ.type);
                const si = getSeverityInfo(occ.severity);
                const sti = getStatusInfo(occ.status);
                const acts = actionsByOcc[occ.id];
                return (
                  <TableRow key={occ.id}>
                    <TableCell><Badge className={ti.color + " text-[10px]"}>{ti.label}</Badge></TableCell>
                    <TableCell className="text-sm tabular-nums whitespace-nowrap">{formatDateTimeBR(occ.occurred_at)}</TableCell>
                    <TableCell className="text-sm">{occ.location}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{occ.description}</TableCell>
                    <TableCell><Badge className={si.color + " text-[10px]"}>{si.label}</Badge></TableCell>
                    <TableCell>
                      {acts ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${(acts.completed / acts.total) * 100}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">{acts.completed}/{acts.total}</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell><Badge className={sti.color + " text-[10px]"}>{sti.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedOcc(occ); setDetailOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingOcc(occ); setDrawerOpen(true); }} disabled={planExpired}><Pencil className="h-3.5 w-3.5" /></Button>
                        {occ.status !== "closed" && (
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => closeOcc.mutate(occ.id)} disabled={planExpired}><XCircle className="h-3.5 w-3.5" /></Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { setSelectedOcc(occ); setDeleteOpen(true); }} disabled={planExpired || occ.status === "closed"}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <OccurrenceDrawer open={drawerOpen} onOpenChange={setDrawerOpen} occurrence={editingOcc} planExpired={planExpired} />
      <OccurrenceDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        occurrence={selectedOcc}
        onEdit={() => { setDetailOpen(false); setEditingOcc(selectedOcc); setDrawerOpen(true); }}
        planExpired={planExpired}
      />
      <DeleteOccurrenceDialog open={deleteOpen} onOpenChange={setDeleteOpen} occurrence={selectedOcc} />
    </div>
  );
}
