import { useState, useMemo } from "react";
import { useInspections, useSaveInspection, useDeleteInspection, useRegisterExecution, useSaveInspectionAction, useAllInspectionActions, useInspectionExecutions } from "@/hooks/useInspections";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getInspectionStatus, getInspectionStatusInfo, getInspectionFrequencyLabel, formatDateBR, RESULT_LABELS, RESULT_COLORS } from "@/lib/inspections";
import { InspectionKpiCards } from "@/components/inspecoes/InspectionKpiCards";
import { InspectionFilters } from "@/components/inspecoes/InspectionFilters";
import { InspectionDrawer } from "@/components/inspecoes/InspectionDrawer";
import { InspectionDetailDrawer } from "@/components/inspecoes/InspectionDetailDrawer";
import { RegisterExecutionModal } from "@/components/inspecoes/RegisterExecutionModal";
import { InspectionActionModal } from "@/components/inspecoes/InspectionActionModal";
import { DeleteInspectionDialog } from "@/components/inspecoes/DeleteInspectionDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, ClipboardCheck } from "lucide-react";
import { startOfWeek, endOfWeek, parseISO, isWithinInterval } from "date-fns";

export default function Inspecoes() {
  usePageTitle("Inspeções");

  const { data: inspections = [], isLoading } = useInspections();
  const { data: allPendingActions = [] } = useAllInspectionActions();
  const saveInspection = useSaveInspection();
  const deleteInspection = useDeleteInspection();
  const registerExecution = useRegisterExecution();
  const saveAction = useSaveInspectionAction();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [kpiFilter, setKpiFilter] = useState("all");

  // Drawers/Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<any>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [executionInspection, setExecutionInspection] = useState<any>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionMode, setActionMode] = useState<"create" | "complete">("create");
  const [actionTarget, setActionTarget] = useState<any>(null);
  const [actionExecutionId, setActionExecutionId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingInspection, setDeletingInspection] = useState<any>(null);

  // Collect all executions for KPI (this week)
  const weekExecs = useMemo(() => {
    // We'll compute from inspections data - simplified for KPI
    return [];
  }, []);

  // Filter
  const filtered = useMemo(() => {
    let list = inspections;

    if (statusFilter !== "all") {
      list = list.filter((i: any) => i.status === statusFilter);
    }

    if (kpiFilter === "expired") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      list = list.filter((i: any) => i.next_due_at && new Date(i.next_due_at) < today);
    }

    if (search) {
      const s = search.toLowerCase();
      list = list.filter((i: any) =>
        i.name.toLowerCase().includes(s) ||
        (i.location || "").toLowerCase().includes(s) ||
        (i.responsible || "").toLowerCase().includes(s)
      );
    }

    return list;
  }, [inspections, statusFilter, kpiFilter, search]);

  // Handlers
  const handleNew = () => { setEditingInspection(null); setDrawerOpen(true); };
  const handleEdit = (insp: any) => { setEditingInspection(insp); setDrawerOpen(true); };
  const handleDetail = (insp: any) => { setSelectedInspection(insp); setDetailDrawerOpen(true); };
  const handleDelete = (insp: any) => { setDeletingInspection(insp); setDeleteDialogOpen(true); };

  const handleSave = (values: any) => {
    saveInspection.mutate(values, { onSuccess: () => setDrawerOpen(false) });
  };

  const handleConfirmDelete = () => {
    if (deletingInspection) {
      deleteInspection.mutate(deletingInspection.id, { onSuccess: () => setDeleteDialogOpen(false) });
    }
  };

  const handleOpenExecution = () => {
    setExecutionInspection(selectedInspection);
    setExecutionModalOpen(true);
  };

  const handleSaveExecution = (values: any) => {
    registerExecution.mutate(values, {
      onSuccess: () => {
        setExecutionModalOpen(false);
        // Refresh detail
        const updatedInsp = { ...selectedInspection, last_done_at: values.executed_at };
        setSelectedInspection(updatedInsp);
      },
    });
  };

  const handleCreateAction = (executionId?: string) => {
    setActionMode("create");
    setActionTarget(null);
    setActionExecutionId(executionId || null);
    setActionModalOpen(true);
  };

  const handleCompleteAction = (action: any) => {
    setActionMode("complete");
    setActionTarget(action);
    setActionExecutionId(null);
    setActionModalOpen(true);
  };

  const handleSaveAction = (values: any) => {
    saveAction.mutate(values, { onSuccess: () => setActionModalOpen(false) });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inspeções de Segurança</h1>
          <p className="text-sm text-muted-foreground">Gestão de inspeções periódicas e avulsas</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />Nova Inspeção
        </Button>
      </div>

      <InspectionKpiCards
        inspections={inspections}
        executions={weekExecs}
        pendingActions={allPendingActions.length}
        onFilter={setKpiFilter}
        activeFilter={kpiFilter}
      />

      <InspectionFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma inspeção encontrada</p>
          <Button variant="outline" className="mt-3" onClick={handleNew}>Criar primeira inspeção</Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inspeção</TableHead>
                <TableHead className="hidden md:table-cell">Local</TableHead>
                <TableHead className="hidden md:table-cell">Frequência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Última execução</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((insp: any) => {
                const statusInfo = getInspectionStatusInfo(insp.next_due_at, insp.alert_days_before);
                const freqLabel = insp.is_periodic
                  ? getInspectionFrequencyLabel(insp.frequency_type, insp.frequency_preset, insp.frequency_days)
                  : "Avulsa";

                return (
                  <TableRow key={insp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleDetail(insp)}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{insp.name}</p>
                        {insp.responsible && <p className="text-xs text-muted-foreground">{insp.responsible}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{insp.location || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">{freqLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      {statusInfo.status ? (
                        <Badge variant="outline" className={`text-xs ${
                          statusInfo.status === "expired" ? "bg-red-100 text-red-700 border-red-200" :
                          statusInfo.status === "warning" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                          "bg-green-100 text-green-700 border-green-200"
                        }`}>
                          {statusInfo.label}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Avulsa</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDateBR(insp.last_done_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDetail(insp); }}>
                            <Eye className="h-4 w-4 mr-2" />Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setExecutionInspection(insp); setExecutionModalOpen(true); }}>
                            <ClipboardCheck className="h-4 w-4 mr-2" />Registrar execução
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(insp); }}>
                            <Pencil className="h-4 w-4 mr-2" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(insp); }} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Drawers & Modals */}
      <InspectionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        inspection={editingInspection}
        onSave={handleSave}
        saving={saveInspection.isPending}
      />

      <InspectionDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        inspection={selectedInspection}
        onRegisterExecution={handleOpenExecution}
        onCreateAction={handleCreateAction}
        onCompleteAction={handleCompleteAction}
      />

      {executionInspection && (
        <RegisterExecutionModal
          open={executionModalOpen}
          onOpenChange={setExecutionModalOpen}
          inspection={executionInspection}
          onSave={handleSaveExecution}
          saving={registerExecution.isPending}
        />
      )}

      {selectedInspection && (
        <InspectionActionModal
          open={actionModalOpen}
          onOpenChange={setActionModalOpen}
          action={actionTarget}
          inspectionId={selectedInspection.id}
          executionId={actionExecutionId}
          onSave={handleSaveAction}
          saving={saveAction.isPending}
          mode={actionMode}
        />
      )}

      <DeleteInspectionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        inspectionName={deletingInspection?.name || ""}
      />
    </div>
  );
}
