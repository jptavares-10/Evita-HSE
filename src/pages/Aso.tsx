import { useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAsoRecords, useAsoExamTypes } from "@/hooks/useAso";
import { useEmployees } from "@/hooks/useTrainings";
import { computeAsoStatus, getAsoStatusBadge, getResultBadge, formatDateBR } from "@/lib/aso";
import { AsoKpiCards } from "@/components/aso/AsoKpiCards";
import { AsoDrawer } from "@/components/aso/AsoDrawer";
import { ManageExamTypesModal } from "@/components/aso/ManageExamTypesModal";
import { DeleteAsoDialog } from "@/components/aso/DeleteAsoDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Settings, Pencil, Trash2, FileDown } from "lucide-react";
import { useSignedUrl } from "@/hooks/useSignedUrl";

export default function Aso() {
  usePageTitle("ASO — Evita HSE");

  const { data: records = [], isLoading } = useAsoRecords();
  const { data: examTypes = [] } = useAsoExamTypes();
  const { data: employees = [] } = useEmployees();
  const activeEmployees = employees.filter((e: any) => e.status === "active");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [typesOpen, setTypesOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // For each active employee, compute latest ASO status (latest periodic or any with expiry)
  const employeeAsoMap = useMemo(() => {
    const map: Record<string, { status: string; record: any }> = {};
    for (const emp of activeEmployees) {
      const empRecords = records.filter((r: any) => r.employee_id === emp.id);
      // Find latest record with expiry
      const withExpiry = empRecords.filter((r: any) => r.expires_at).sort((a: any, b: any) => b.exam_date.localeCompare(a.exam_date));
      if (withExpiry.length > 0) {
        const st = computeAsoStatus(withExpiry[0].expires_at);
        map[emp.id] = { status: st, record: withExpiry[0] };
      } else if (empRecords.length > 0) {
        map[emp.id] = { status: "no_expiry", record: empRecords[0] };
      } else {
        map[emp.id] = { status: "no_record", record: null };
      }
    }
    return map;
  }, [activeEmployees, records]);

  const kpis = useMemo(() => {
    const total = activeEmployees.length;
    let ok = 0, warning = 0, expired = 0;
    Object.values(employeeAsoMap).forEach(({ status }) => {
      if (status === "ok" || status === "no_expiry") ok++;
      else if (status === "warning") warning++;
      else if (status === "expired" || status === "no_record") expired++;
    });
    const conformity = total > 0 ? Math.round((ok / total) * 100) : 0;
    return { total, ok, warning, expired, conformity };
  }, [activeEmployees, employeeAsoMap]);

  const filtered = useMemo(() => {
    return records.filter((r: any) => {
      const empName = r.employees?.name || "";
      const typeName = r.aso_exam_types?.name || "";
      if (search && !empName.toLowerCase().includes(search.toLowerCase()) && !typeName.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType !== "all" && r.exam_type_id !== filterType) return false;
      if (filterStatus !== "all") {
        const st = computeAsoStatus(r.expires_at);
        if (filterStatus !== st) return false;
      }
      return true;
    });
  }, [records, search, filterType, filterStatus]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exames Ocupacionais (ASO)</h1>
          <p className="text-muted-foreground mt-1">Controle de ASOs e vencimentos dos colaboradores.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setTypesOpen(true)}>
            <Settings className="h-4 w-4 mr-1" /> Tipos de Exame
          </Button>
          <Button size="sm" onClick={() => { setEditRecord(null); setDrawerOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novo ASO
          </Button>
        </div>
      </div>

      <AsoKpiCards
        totalEmployees={kpis.total}
        upToDate={kpis.ok}
        expiringSoon={kpis.warning}
        expired={kpis.expired}
        conformity={kpis.conformity}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar colaborador ou tipo..." className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {examTypes.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ok">Em dia</SelectItem>
            <SelectItem value="warning">Vencendo</SelectItem>
            <SelectItem value="expired">Vencido</SelectItem>
            <SelectItem value="no_expiry">Sem validade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum ASO registrado.</TableCell></TableRow>
            ) : (
              filtered.map((r: any) => {
                const st = computeAsoStatus(r.expires_at);
                const stBadge = getAsoStatusBadge(st);
                const resBadge = getResultBadge(r.result);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.employees?.name || "—"}</TableCell>
                    <TableCell>{r.aso_exam_types?.name || "—"}</TableCell>
                    <TableCell>{formatDateBR(r.exam_date)}</TableCell>
                    <TableCell>{formatDateBR(r.expires_at)}</TableCell>
                    <TableCell><Badge variant="outline" className={resBadge.className}>{resBadge.label}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={stBadge.className}>{stBadge.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {r.file_url && <DownloadButton fileUrl={r.file_url} />}
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditRecord(r); setDrawerOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AsoDrawer open={drawerOpen} onOpenChange={setDrawerOpen} editRecord={editRecord} />
      <ManageExamTypesModal open={typesOpen} onOpenChange={setTypesOpen} />
      <DeleteAsoDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} recordId={deleteId} />
    </div>
  );
}

function DownloadButton({ fileUrl }: { fileUrl: string }) {
  const signedUrl = useSignedUrl("aso-files", fileUrl);
  return (
    <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
      <a href={signedUrl || "#"} target="_blank" rel="noopener noreferrer">
        <FileDown className="h-3.5 w-3.5" />
      </a>
    </Button>
  );
}
