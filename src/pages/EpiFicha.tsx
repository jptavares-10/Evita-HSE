import { useState, useMemo } from "react";
import { useEpiDeliveries } from "@/hooks/useEpi";
import { useEmployees } from "@/hooks/useTrainings";
import { useSectors, useJobPositions } from "@/hooks/useEpiFicha";
import { formatDateBR } from "@/lib/epi";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ClipboardList, Eye } from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";
import { EpiFichaDrawer } from "@/components/epi/EpiFichaDrawer";

export default function EpiFicha() {
  const { data: deliveries = [], isLoading: loadingDeliveries } = useEpiDeliveries();
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
  const { data: sectors = [] } = useSectors();
  const { data: jobPositions = [] } = useJobPositions();

  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Build employee summary from deliveries
  const employeeSummaries = useMemo(() => {
    const map = new Map<string, { employeeId: string; totalItems: number; epiTypeIds: Set<string>; lastDelivery: string }>();
    deliveries.forEach((d: any) => {
      const eid = d.employee_id;
      if (!eid) return;
      const existing = map.get(eid);
      if (existing) {
        existing.totalItems += d.quantity || 1;
        existing.epiTypeIds.add(d.epi_type_id);
        if (d.delivered_at > existing.lastDelivery) existing.lastDelivery = d.delivered_at;
      } else {
        map.set(eid, {
          employeeId: eid,
          totalItems: d.quantity || 1,
          epiTypeIds: new Set([d.epi_type_id]),
          lastDelivery: d.delivered_at,
        });
      }
    });
    return map;
  }, [deliveries]);

  // Merge with employee data and filter
  const filteredEmployees = useMemo(() => {
    const empMap = new Map<string, any>();
    employees.forEach((e: any) => empMap.set(e.id, e));

    let list = Array.from(employeeSummaries.entries()).map(([id, summary]) => {
      const emp = empMap.get(id);
      return {
        ...summary,
        name: emp?.name || "—",
        sector: emp?.sectors?.name || emp?.sector || "—",
        sectorId: emp?.sector_id,
        jobPosition: emp?.job_positions?.name || "—",
        jobPositionId: emp?.job_position_id,
        status: emp?.status || "active",
        distinctEpis: summary.epiTypeIds.size,
      };
    });

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(s));
    }
    if (sectorFilter !== "all") {
      list = list.filter((e) => e.sectorId === sectorFilter);
    }
    if (positionFilter !== "all") {
      list = list.filter((e) => e.jobPositionId === positionFilter);
    }

    list.sort((a, b) => (b.lastDelivery > a.lastDelivery ? 1 : -1));
    return list;
  }, [employeeSummaries, employees, search, sectorFilter, positionFilter]);

  const pagination = useTablePagination(filteredEmployees);
  const isLoading = loadingDeliveries || loadingEmployees;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por colaborador..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Setor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os setores</SelectItem>
            {sectors.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Cargo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            {jobPositions.map((j: any) => <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {search || sectorFilter !== "all" || positionFilter !== "all"
                ? "Nenhum colaborador encontrado com os filtros aplicados."
                : "Nenhuma entrega registrada ainda. Registre a primeira entrega na aba Entregas."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead className="text-center">EPIs Entregues</TableHead>
                <TableHead>Última Entrega</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedData.map((e: any) => (
                <TableRow key={e.employeeId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="font-medium">{e.name}</span>
                        <span className="block text-xs text-muted-foreground">{e.jobPosition}</span>
                      </div>
                      {e.status === "inactive" && (
                        <Badge variant="secondary" className="text-xs">Inativo</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{e.sector}</TableCell>
                  <TableCell className="text-center">{e.distinctEpis}</TableCell>
                  <TableCell>{formatDateBR(e.lastDelivery)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedEmployeeId(e.employeeId)}>
                      <Eye className="h-4 w-4 mr-1" />Ver ficha
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
        </Card>
      )}

      <EpiFichaDrawer
        employeeId={selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </div>
  );
}
