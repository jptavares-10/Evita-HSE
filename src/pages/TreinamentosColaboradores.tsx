import { useState, useMemo } from "react";
import { useEmployees, useJobPositions, useTrainingMatrix, useAllRecords } from "@/hooks/useTrainings";
import { computeEmployeeCompliance } from "@/lib/trainings";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Search, Upload, Download, Users } from "lucide-react";
import { EmployeeDrawer } from "@/components/treinamentos/EmployeeDrawer";
import { EmployeeDetailDrawer } from "@/components/treinamentos/EmployeeDetailDrawer";
import { ImportEmployeesModal } from "@/components/treinamentos/ImportEmployeesModal";

export default function TreinamentosColaboradores() {
  const { company } = useAuth();
  const isExpired = company?.plan === "expired";
  const { data: employees = [] } = useEmployees();
  const { data: positions = [] } = useJobPositions();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();

  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterConformity, setFilterConformity] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [detailEmployee, setDetailEmployee] = useState<any>(null);
  const [importOpen, setImportOpen] = useState(false);

  const enriched = useMemo(() => {
    return employees.map((emp: any) => {
      const requiredIds = matrix.filter((m: any) => m.job_position_id === emp.job_position_id).map((m: any) => m.training_id);
      const empRecords = allRecords.filter((r: any) => r.employee_id === emp.id).map((r: any) => ({ training_id: r.training_id, expires_at: r.expires_at }));
      const compliance = computeEmployeeCompliance(requiredIds, empRecords);
      return { ...emp, compliance };
    });
  }, [employees, matrix, allRecords]);

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

  const downloadTemplate = () => {
    const csv = "Nome,Cargo,Setor\nJoão Silva,Operador,Produção\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "modelo_colaboradores.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const ActionButton = ({ children, onClick, ...props }: any) => {
    if (isExpired) {
      return (
        <Tooltip>
          <TooltipTrigger asChild><span><Button disabled {...props}>{children}</Button></span></TooltipTrigger>
          <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>
        </Tooltip>
      );
    }
    return <Button onClick={onClick} {...props}>{children}</Button>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterPosition} onValueChange={setFilterPosition}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Cargo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            {positions.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterConformity} onValueChange={setFilterConformity}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Conformidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ok">Em dia</SelectItem>
            <SelectItem value="pending">Com pendências</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="h-4 w-4 mr-1" />Modelo CSV</Button>
        <ActionButton variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4 mr-1" />Importar</ActionButton>
        <ActionButton onClick={() => { setEditEmployee(null); setDrawerOpen(true); }}><Plus className="h-4 w-4 mr-1" />Novo colaborador</ActionButton>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">Nenhum colaborador encontrado</p>
          <ActionButton onClick={() => { setEditEmployee(null); setDrawerOpen(true); }}>Cadastrar primeiro colaborador</ActionButton>
        </div>
      ) : (
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
              {filtered.map((emp: any) => (
                <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailEmployee(emp)}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.job_positions?.name || "—"}</TableCell>
                  <TableCell>{emp.sectors?.name || "—"}</TableCell>
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
