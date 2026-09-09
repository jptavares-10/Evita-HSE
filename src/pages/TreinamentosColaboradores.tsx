import { useState, useMemo } from "react";
import { useEmployees, useJobPositions, useTrainingMatrix, useAllRecords, useTrainings } from "@/hooks/useTrainings";
import { computeEmployeeCompliance } from "@/lib/trainings";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Download, Users } from "lucide-react";
import { SectionHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { STATUS_META } from "@/lib/status";
import { EmployeeDrawer } from "@/components/treinamentos/EmployeeDrawer";
import { EmployeeDetailDrawer } from "@/components/treinamentos/EmployeeDetailDrawer";
import { ImportEmployeesModal } from "@/components/treinamentos/ImportEmployeesModal";
import { usePermission } from "@/hooks/usePermission";
import { downloadXlsx } from "@/lib/xlsx-utils";
import { PermissionButton } from "@/components/PermissionButton";
import { ViewerBadge } from "@/components/ViewerBadge";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";

export default function TreinamentosColaboradores() {
  const { company } = useAuth();
  const isExpired = company?.plan === "expired";
  const { canEdit } = usePermission("trainings");
  const isDisabled = isExpired || !canEdit;
  const { data: employees = [] } = useEmployees();
  const { data: positions = [] } = useJobPositions();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();
  const { data: trainings = [] } = useTrainings();

  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterConformity, setFilterConformity] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [detailEmployee, setDetailEmployee] = useState<any>(null);
  const [importOpen, setImportOpen] = useState(false);
  

  const trainingsMap = useMemo(() => {
    const map = new Map<string, { has_expiry: boolean }>();
    trainings.forEach((t: any) => map.set(t.id, { has_expiry: t.has_expiry !== false }));
    return map;
  }, [trainings]);

  const enriched = useMemo(() => {
    return employees.map((emp: any) => {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      const empRecords = allRecords.filter((r: any) => r.employee_id === emp.id).map((r: any) => ({ training_id: r.training_id, expires_at: r.expires_at }));
      const compliance = computeEmployeeCompliance(requiredIds, empRecords, 30, trainingsMap);
      return { ...emp, compliance };
    });
  }, [employees, matrix, allRecords, trainingsMap]);

  const filtered = useMemo(() => {
    return enriched.filter((e: any) => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPosition !== "all" && e.job_position_id !== filterPosition) return false;
      if (filterStatus !== "all" && e.status !== filterStatus) return false;
      if (filterConformity === "ok" && !e.compliance.isCompliant) return false;
      if (filterConformity === "pending" && e.compliance.isCompliant) return false;
      return true;
    });
  }, [enriched, search, filterPosition, filterStatus, filterConformity]);

  const pagination = useTablePagination(filtered, { defaultPageSize: 20 });

  const downloadTemplate = () => {
    downloadXlsx(
      [["Nome", "Cargo", "Setor"], ["João Silva", "Operador", "Produção"]],
      "modelo_colaboradores.xlsx"
    );
  };

  const hasActiveFilters = !!search || filterPosition !== "all" || filterStatus !== "all" || filterConformity !== "all";
  const clearFilters = () => { setSearch(""); setFilterPosition("all"); setFilterStatus("all"); setFilterConformity("all"); };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Colaboradores"
        description="Pessoas monitoradas pela matriz de treinamentos."
        actions={
          <>
            <Button variant="outline" onClick={downloadTemplate}><Download className="h-4 w-4 mr-1" />Modelo XLSX</Button>
            <PermissionButton canEdit={canEdit} disabled={isExpired} variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-1" />Importar
            </PermissionButton>
            <PermissionButton canEdit={canEdit} disabled={isExpired} onClick={() => { setEditEmployee(null); setDrawerOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />Novo colaborador
            </PermissionButton>
          </>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome..."
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      >
        <Select value={filterPosition} onValueChange={setFilterPosition}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Cargo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            {positions.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Cadastro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Ativos e inativos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterConformity} onValueChange={setFilterConformity}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Situação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as situações</SelectItem>
            <SelectItem value="ok">{STATUS_META.ok.label}</SelectItem>
            <SelectItem value="pending">{STATUS_META.expired.label}</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {filtered.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">Nenhum colaborador encontrado</p>
          <PermissionButton canEdit={canEdit} disabled={isExpired} onClick={() => { setEditEmployee(null); setDrawerOpen(true); }}>
            Cadastrar primeiro colaborador
          </PermissionButton>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conformidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paginatedData.map((emp: any) => (
                  <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailEmployee(emp)}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.job_positions?.name || "—"}</TableCell>
                    <TableCell>{emp.job_positions?.sectors?.name || emp.sector || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={emp.status === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}>
                        {emp.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {emp.compliance.required === 0 ? (
                        <span className="text-xs text-muted-foreground">Sem obrigações</span>
                      ) : emp.compliance.isCompliant ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">✅ Em dia</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">⚠️ {emp.compliance.pending} pendência{emp.compliance.pending > 1 ? "s" : ""}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
        </>
      )}

      <EmployeeDrawer open={drawerOpen} onOpenChange={setDrawerOpen} employee={editEmployee} />
      <EmployeeDetailDrawer
        employee={detailEmployee}
        onClose={() => setDetailEmployee(null)}
        onEdit={(emp) => { setDetailEmployee(null); setEditEmployee(emp); setDrawerOpen(true); }}
      />
      <ImportEmployeesModal open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
