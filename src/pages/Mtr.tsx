import { useState, useMemo } from "react";
import { useMtrs } from "@/hooks/useMTR";
import { useAuth } from "@/contexts/AuthContext";
import { getCdfDisplayStatus, getCdfStatusInfo, getDaysRemainingLabel, formatDateBR } from "@/lib/mtr";
import { MtrKpiCards } from "@/components/mtr/MtrKpiCards";
import { MtrFilters } from "@/components/mtr/MtrFilters";
import { MtrDrawer } from "@/components/mtr/MtrDrawer";
import { MtrDetailDrawer } from "@/components/mtr/MtrDetailDrawer";
import { RegisterCdfModal } from "@/components/mtr/RegisterCdfModal";
import { DeleteMtrDialog } from "@/components/mtr/DeleteMtrDialog";
import { ManageWasteCategoriesModal } from "@/components/mtr/ManageWasteCategoriesModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, FileCheck, Pencil, Trash2, Recycle, Plus, BarChart3, Tags } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { TableSkeleton } from "@/components/TableSkeleton";
import { ModuleOnboarding, OnboardingStep } from "@/components/ModuleOnboarding";
import { usePermission } from "@/hooks/usePermission";
import { ViewerBadge } from "@/components/ViewerBadge";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";

export default function Mtr() {
  usePageTitle("Gestão de MTR — Evita HSE");
  const { company } = useAuth();
  const { data: mtrs = [], isLoading } = useMtrs();
  const isExpired = company?.plan === "expired";
  const { canEdit } = usePermission("mtr");
  const isDisabled = isExpired || !canEdit;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transporterFilter, setTransporterFilter] = useState("");
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMtr, setEditMtr] = useState<any>(null);
  const [detailMtr, setDetailMtr] = useState<any>(null);
  const [cdfMtr, setCdfMtr] = useState<any>(null);
  const [deleteMtr, setDeleteMtr] = useState<any>(null);

  const filteredMtrs = useMemo(() => {
    let list = mtrs.map((m: any) => ({
      ...m,
      _displayStatus: getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at),
    }));

    if (search) list = list.filter((m: any) => m.mtr_number.toLowerCase().includes(search.toLowerCase()));

    const effectiveStatus = kpiFilter || (statusFilter !== "all" ? statusFilter : null);
    if (effectiveStatus) {
      if (effectiveStatus === "pending") {
        list = list.filter((m: any) => m._displayStatus === "pending" || m._displayStatus === "warning");
      } else {
        list = list.filter((m: any) => m._displayStatus === effectiveStatus);
      }
    }

    if (transporterFilter) list = list.filter((m: any) => m.transporter?.toLowerCase().includes(transporterFilter.toLowerCase()));

    return list;
  }, [mtrs, search, statusFilter, transporterFilter, kpiFilter]);

  const pagination = useTablePagination(filteredMtrs);

  function handleNewMtr() {
    setEditMtr(null);
    setDrawerOpen(true);
  }

  function handleEdit(mtr: any) {
    setEditMtr(mtr);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de MTR</h1>
          <p className="text-muted-foreground text-sm">Manifesto de Transporte de Resíduos</p>
        </div>
        <div className="flex items-center gap-2">
          {!canEdit && <ViewerBadge />}
          <Link to="/mtr/analise">
            <Button variant="outline" size="sm"><BarChart3 className="h-4 w-4 mr-1" />Ver análise</Button>
          </Link>
        </div>
      </div>

      <MtrKpiCards mtrs={mtrs} activeFilter={kpiFilter} onFilter={setKpiFilter} />

      <MtrFilters
        search={search} onSearchChange={setSearch}
        statusFilter={statusFilter} onStatusChange={setStatusFilter}
        transporterFilter={transporterFilter} onTransporterChange={setTransporterFilter}
        categories={[]} categoryFilter={[]} onCategoryChange={() => {}}
        onManageCategories={() => setCatModalOpen(true)}
        onNewMtr={handleNewMtr}
        isExpired={isDisabled}
      />

      {isLoading ? (
        <TableSkeleton columns={7} />
      ) : mtrs.length === 0 ? (
        <ModuleOnboarding
          title="Gestão de MTR"
          description="Configure o controle de Manifestos de Transporte de Resíduos e CDFs."
          icon={Recycle}
          steps={[
            { title: "Cadastrar categorias de resíduo", description: "Defina os tipos de resíduos que sua empresa gera", icon: Tags, actionLabel: "Criar categorias", action: () => setCatModalOpen(true), completed: false },
            { title: "Registrar primeiro MTR", description: "Cadastre um manifesto com prazo e transportadora", icon: Plus, actionLabel: "Criar MTR", action: handleNewMtr, completed: false },
          ] as OnboardingStep[]}
        />
      ) : filteredMtrs.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Recycle className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">Nenhum MTR encontrado com os filtros aplicados.</p>
        </div>
      ) : (
        <>
          <div className="bg-card border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Emissão</TableHead>
                  <TableHead>Transportadora</TableHead>
                  <TableHead>Categorias</TableHead>
                  <TableHead>Prazo CDF</TableHead>
                  <TableHead>Dias restantes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paginatedData.map((mtr: any) => {
                  const statusInfo = getCdfStatusInfo(mtr.cdf_status, mtr.alert_at, mtr.cdf_deadline_at);
                  const daysLabel = getDaysRemainingLabel(mtr.cdf_status, mtr.cdf_deadline_at);
                  return (
                    <TableRow key={mtr.id}>
                      <TableCell>
                        <button onClick={() => setDetailMtr(mtr)} className="text-primary hover:underline font-medium">{mtr.mtr_number}</button>
                      </TableCell>
                      <TableCell>{formatDateBR(mtr.issued_at)}</TableCell>
                      <TableCell>{mtr.transporter || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(mtr.mtr_waste_items || []).map((wi: any) => (
                            <Badge key={wi.id} style={{ backgroundColor: wi.waste_categories?.color + "20", color: wi.waste_categories?.color, borderColor: wi.waste_categories?.color }} className="text-[10px]">
                              {wi.waste_categories?.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateBR(mtr.cdf_deadline_at)}</TableCell>
                      <TableCell><span className={statusInfo.color + " text-sm font-medium"}>{daysLabel}</span></TableCell>
                      <TableCell><Badge className={statusInfo.badgeClass + " text-[10px]"}>{statusInfo.label}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => setDetailMtr(mtr)} className="p-1.5 rounded hover:bg-muted"><Eye className="h-4 w-4" /></button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                          {canEdit && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => setCdfMtr(mtr)} disabled={mtr.cdf_status === "received" || isExpired} className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
                                    <FileCheck className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>{mtr.cdf_status === "received" ? "CDF já registrado" : isExpired ? "Plano expirado" : "Registrar CDF"}</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => handleEdit(mtr)} disabled={isExpired} className="p-1.5 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>{isExpired ? "Plano expirado" : "Editar"}</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => setDeleteMtr(mtr)} disabled={isExpired} className="p-1.5 rounded hover:bg-muted text-destructive disabled:opacity-40 disabled:cursor-not-allowed">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>{isExpired ? "Plano expirado" : "Excluir"}</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

      <MtrDrawer open={drawerOpen} onOpenChange={setDrawerOpen} editMtr={editMtr} />
      <MtrDetailDrawer open={!!detailMtr} onOpenChange={(v) => !v && setDetailMtr(null)} mtr={detailMtr} onEdit={() => { handleEdit(detailMtr); setDetailMtr(null); }} />
      <RegisterCdfModal open={!!cdfMtr} onOpenChange={(v) => !v && setCdfMtr(null)} mtr={cdfMtr} />
      <DeleteMtrDialog open={!!deleteMtr} onOpenChange={(v) => !v && setDeleteMtr(null)} mtr={deleteMtr} />
      <ManageWasteCategoriesModal open={catModalOpen} onOpenChange={setCatModalOpen} />
    </div>
  );
}
