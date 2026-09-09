import { useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAsoRecords, useAsoExamTypes } from "@/hooks/useAso";
import { useEmployees } from "@/hooks/useTrainings";
import { computeAsoStatus, getAsoStatusBadge, formatDateBR } from "@/lib/aso";
import { AsoKpiCards } from "@/components/aso/AsoKpiCards";
import { AsoDrawer } from "@/components/aso/AsoDrawer";
import { AsoDetailDrawer } from "@/components/aso/AsoDetailDrawer";
import { ManageExamTypesModal } from "@/components/aso/ManageExamTypesModal";
import { DeleteAsoDialog } from "@/components/aso/DeleteAsoDialog";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/PermissionButton";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { STATUS_META } from "@/lib/status";
import { useStatusFilter } from "@/hooks/useStatusFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Settings, Pencil, Stethoscope, Users, Tags, CalendarClock, Paperclip } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleOnboarding, OnboardingStep } from "@/components/ModuleOnboarding";
import { useNavigate } from "react-router-dom";
import { usePermission } from "@/hooks/usePermission";
import { ViewerBadge } from "@/components/ViewerBadge";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";
export default function Aso() {
  const navigate = useNavigate();
  usePageTitle("ASO — Evita HSE", { description: "Gestão de ASO e exames ocupacionais.", noindex: true });
  const { canEdit } = usePermission("aso");

  const { data: records = [], isLoading } = useAsoRecords();
  const { data: examTypes = [] } = useAsoExamTypes();
  const { data: employees = [] } = useEmployees();
  const activeEmployees = employees.filter((e: any) => e.status === "active");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [typesOpen, setTypesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const statusFilter = useStatusFilter();
  const filterStatus = statusFilter.status ?? "all";
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<any>(null);
  const [deleteRecord, setDeleteRecord] = useState<any>(null);

  // For each active employee, compute latest ASO status
  const employeeAsoMap = useMemo(() => {
    const map: Record<string, { status: string; record: any; latestDate: string | null }> = {};
    for (const emp of activeEmployees) {
      const empRecords = records.filter((r: any) => r.employee_id === emp.id);
      const withExpiry = empRecords.filter((r: any) => r.expires_at).sort((a: any, b: any) => b.exam_date.localeCompare(a.exam_date));
      if (withExpiry.length > 0) {
        const st = computeAsoStatus(withExpiry[0].expires_at);
        map[emp.id] = { status: st, record: withExpiry[0], latestDate: withExpiry[0].expires_at };
      } else if (empRecords.length > 0) {
        map[emp.id] = { status: "no_expiry", record: empRecords[0], latestDate: null };
      } else {
        map[emp.id] = { status: "no_record", record: null, latestDate: null };
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

  // Build enriched employee list with ASO status
  const enrichedEmployees = useMemo(() => {
    return activeEmployees.map((emp: any) => {
      const aso = employeeAsoMap[emp.id] || { status: "no_record", record: null, latestDate: null };
      return { ...emp, asoStatus: aso.status, asoRecord: aso.record, asoExpiry: aso.latestDate };
    });
  }, [activeEmployees, employeeAsoMap]);

  const filtered = useMemo(() => {
    return enrichedEmployees.filter((e: any) => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus === "ok" && e.asoStatus !== "ok" && e.asoStatus !== "no_expiry") return false;
      if (filterStatus === "warning" && e.asoStatus !== "warning") return false;
      if (filterStatus === "expired" && e.asoStatus !== "expired" && e.asoStatus !== "no_record") return false;
      return true;
    });
  }, [enrichedEmployees, search, filterStatus]);

  const pagination = useTablePagination(filtered);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok": return <StatusBadge status="ok" />;
      case "no_expiry": return <StatusBadge status="ok" label="Sem validade" />;
      case "warning": return <StatusBadge status="warning" label="Vencendo" />;
      case "expired": return <StatusBadge status="expired" label="Vencido" />;
      case "no_record": return <StatusBadge status="missing" label="Sem ASO" />;
      default: return null;
    }
  };

  if (activeEmployees.length === 0 && records.length === 0) {
    return (
      <ModuleOnboarding
        title="Exames Ocupacionais (ASO)"
        description="Quem está apto, para qual função e até quando — respondido em uma tela, com o ASO anexado."
        icon={Stethoscope}
        note="O PCMSO exige ASO admissional, periódico, de retorno ao trabalho, de mudança de risco e demissional. Trabalhar com exame vencido expõe a empresa em fiscalização e em ação trabalhista — aqui o vencimento é calculado e avisado antes de acontecer."
        steps={[
          { title: "1. Cadastrar os colaboradores", description: "O ASO é sempre vinculado a uma pessoa: sem colaborador, não há exame.", hint: "Já tem a lista em planilha? Use a importação em Colaboradores para subir todos de uma vez.", icon: Users, actionLabel: "Ir para colaboradores", action: () => navigate("/treinamentos/colaboradores"), completed: activeEmployees.length > 0 },
          { title: "2. Revisar os tipos de exame", description: "Admissional, periódico, retorno ao trabalho, mudança de risco e demissional já vêm criados.", hint: "Ajuste a validade em meses de cada tipo conforme o seu PCMSO — é ela que define o vencimento automático.", icon: Tags, actionLabel: "Configurar", action: () => setTypesOpen(true), completed: examTypes.some((t: any) => !t.is_default) },
          { title: "3. Registrar o primeiro ASO", description: "Escolha o colaborador, o tipo de exame, a data de realização e o médico examinador.", hint: "O vencimento é calculado a partir da data do exame e da validade do tipo — você não precisa digitar a data futura.", icon: Plus, actionLabel: "Registrar", action: () => { setEditRecord(null); setSelectedEmployee(null); setDrawerOpen(true); }, completed: false },
          { title: "4. Anexar o documento do ASO", description: "Suba o PDF ou a foto do atestado assinado pelo médico do trabalho.", hint: "O anexo é o que vale como prova. Sem ele o registro serve de controle interno, mas não de evidência.", icon: Paperclip, actionLabel: "Registrar", action: () => { setEditRecord(null); setSelectedEmployee(null); setDrawerOpen(true); }, completed: false },
          { title: "5. Acompanhar os vencimentos", description: "Os indicadores no topo mostram aptos, a vencer e vencidos; o histórico por colaborador fica na ficha dele.", optional: true, icon: CalendarClock, actionLabel: "Registrar", action: () => { setEditRecord(null); setSelectedEmployee(null); setDrawerOpen(true); }, completed: false },
        ] as OnboardingStep[]}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Exames Ocupacionais (ASO)"
        description="Controle de ASOs e vencimentos dos colaboradores."
        actions={
          <>
            {!canEdit && <ViewerBadge />}
            <Button variant="outline" size="sm" onClick={() => setTypesOpen(true)} disabled={!canEdit}>
              <Settings className="h-4 w-4 mr-1" /> Tipos de exame
            </Button>
            <PermissionButton
              canEdit={canEdit}
              size="sm"
              onClick={() => { setEditRecord(null); setSelectedEmployee(null); setDrawerOpen(true); }}
            >
              <Plus className="h-4 w-4 mr-1" /> Novo ASO
            </PermissionButton>
          </>
        }
      />

      <AsoKpiCards
        totalEmployees={kpis.total}
        upToDate={kpis.ok}
        expiringSoon={kpis.warning}
        expired={kpis.expired}
        conformity={kpis.conformity}
        activeStatus={statusFilter.status}
        onSelectStatus={statusFilter.toggle}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar colaborador..."
        hasActiveFilters={!!search || statusFilter.status !== null}
        onClear={() => { setSearch(""); statusFilter.clear(); }}
      >
        <Select value={statusFilter.selectValue} onValueChange={statusFilter.onSelectChange}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Situação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as situações</SelectItem>
            <SelectItem value="ok">{STATUS_META.ok.label}</SelectItem>
            <SelectItem value="warning">{STATUS_META.warning.label}</SelectItem>
            <SelectItem value="expired">{STATUS_META.expired.label}</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {/* Employee-centric Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Último ASO</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : pagination.paginatedData.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum colaborador encontrado.</TableCell></TableRow>
            ) : (
              pagination.paginatedData.map((emp: any) => (
                <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setDetailEmployee(emp); setDetailOpen(true); }}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.job_positions?.name || "—"}</TableCell>
                  <TableCell>{emp.asoRecord ? formatDateBR(emp.asoRecord.exam_date) : "—"}</TableCell>
                  <TableCell>{emp.asoExpiry ? formatDateBR(emp.asoExpiry) : "—"}</TableCell>
                  <TableCell>{getStatusBadge(emp.asoStatus)}</TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); setEditRecord(emp.asoRecord); setDrawerOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        {emp.asoRecord ? "Editar" : "Registrar"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={pagination.setCurrentPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <AsoDrawer open={drawerOpen} onOpenChange={setDrawerOpen} editRecord={editRecord} preselectedEmployeeId={selectedEmployee?.id || detailEmployee?.id} />
      <AsoDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        employee={detailEmployee}
        onEdit={(record) => {
          setEditRecord(record);
          setSelectedEmployee(detailEmployee);
          setDrawerOpen(true);
        }}
        onDelete={(record) => setDeleteRecord(record)}
      />
      <DeleteAsoDialog
        open={!!deleteRecord}
        onOpenChange={(v) => { if (!v) setDeleteRecord(null); }}
        recordId={deleteRecord?.id}
      />
      <ManageExamTypesModal open={typesOpen} onOpenChange={setTypesOpen} />
    </div>
  );
}
