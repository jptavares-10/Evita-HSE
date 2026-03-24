import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePeriodicServices, useServiceCategories, useDeleteService } from "@/hooks/useServices";
import { getServiceStatus, getStatusInfo, formatDateBR, getFrequencyLabel } from "@/lib/services";
import { KpiCards } from "@/components/servicos/KpiCards";
import { ServiceFilters } from "@/components/servicos/ServiceFilters";
import { ServiceEmptyState } from "@/components/servicos/ServiceEmptyState";
import { ServiceDrawer } from "@/components/servicos/ServiceDrawer";
import { ServiceDetailDrawer } from "@/components/servicos/ServiceDetailDrawer";
import { RegisterCompletionModal } from "@/components/servicos/RegisterCompletionModal";
import { DeleteServiceDialog } from "@/components/servicos/DeleteServiceDialog";
import { ManageCategoriesModal } from "@/components/servicos/ManageCategoriesModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertTriangle, XCircle, RotateCw, Pencil, Trash2, Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Servicos() {
  usePageTitle("Serviços Periódicos — Evita HSE");
  const { company } = useAuth();
  const { data: services = [], isLoading } = usePeriodicServices();
  const { data: categories = [] } = useServiceCategories();
  const deleteService = useDeleteService();
  const isExpired = company?.plan === "expired";

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("next_due_at");
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // Modals/drawers
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [detailService, setDetailService] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [completionService, setCompletionService] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  // Status counts
  const enrichedServices = useMemo(() => {
    return services.map((s: any) => ({
      ...s,
      _status: getServiceStatus(s.next_due_at, s.alert_days_before),
      _statusInfo: getStatusInfo(s.next_due_at, s.alert_days_before),
    }));
  }, [services]);

  const counts = useMemo(() => {
    const c = { ok: 0, warning: 0, expired: 0 };
    enrichedServices.forEach((s: any) => { c[s._status as keyof typeof c]++; });
    return c;
  }, [enrichedServices]);

  // Active status filter (KPI cards override status select)
  const activeStatus = kpiFilter || (statusFilter !== "all" ? statusFilter : null);

  const filtered = useMemo(() => {
    let result = enrichedServices;
    if (search) result = result.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== "all") result = result.filter((s: any) => s.category_id === categoryFilter);
    if (activeStatus) result = result.filter((s: any) => s._status === activeStatus);

    result = [...result].sort((a: any, b: any) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "category") return (a.service_categories?.name || "").localeCompare(b.service_categories?.name || "");
      return a.next_due_at.localeCompare(b.next_due_at);
    });
    return result;
  }, [enrichedServices, search, categoryFilter, activeStatus, sortBy]);

  const handleKpiClick = (status: string | null) => {
    setKpiFilter(status);
    if (status) setStatusFilter("all");
  };

  const openEdit = (service: any) => {
    setEditingService(service);
    setDrawerOpen(true);
    setDetailOpen(false);
  };

  const openNew = () => {
    setEditingService(null);
    setDrawerOpen(true);
  };

  const statusIcon = (status: string) => {
    if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Serviços Periódicos</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie seus serviços, vencimentos e histórico.</p>
      </div>

      <KpiCards
        total={enrichedServices.length}
        ok={counts.ok}
        warning={counts.warning}
        expired={counts.expired}
        activeFilter={kpiFilter}
        onFilterClick={handleKpiClick}
      />

      <ServiceFilters
        search={search} onSearchChange={setSearch}
        categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter} onStatusChange={(v) => { setStatusFilter(v); setKpiFilter(null); }}
        sortBy={sortBy} onSortChange={setSortBy}
        categories={categories as any}
        onManageCategories={() => setCategoriesModalOpen(true)}
        onNewService={openNew}
        isExpired={!!isExpired}
      />

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : enrichedServices.length === 0 ? (
        <ServiceEmptyState onCreateFirst={openNew} isExpired={!!isExpired} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum serviço encontrado com os filtros aplicados.</div>
      ) : (
        <div className="bg-card border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Última realização</TableHead>
                <TableHead>Próxima data</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <button onClick={() => { setDetailService(s); setDetailOpen(true); }} className="text-left font-medium text-primary hover:underline">
                      {s.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    {s.service_categories && (
                      <Badge variant="outline" className="gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.service_categories.color }} />
                        {s.service_categories.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{getFrequencyLabel(s.frequency_type, s.frequency_preset, s.frequency_days)}</TableCell>
                  <TableCell className="text-sm tabular-nums">{formatDateBR(s.last_done_at)}</TableCell>
                  <TableCell className="text-sm tabular-nums">{formatDateBR(s.next_due_at)}</TableCell>
                  <TableCell className="text-sm">{s.supplier || "—"}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      {statusIcon(s._status)}
                      <span className={s._statusInfo.color}>{s._statusInfo.label}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!isExpired} onClick={() => setCompletionService(s)}>
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{isExpired ? "Seu plano expirou. Faça upgrade para continuar." : "Registrar realização"}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!isExpired} onClick={() => openEdit(s)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{isExpired ? "Seu plano expirou. Faça upgrade para continuar." : "Editar"}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={!!isExpired} onClick={() => setDeleteTarget(s)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{isExpired ? "Seu plano expirou. Faça upgrade para continuar." : "Excluir"}</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ServiceDrawer open={drawerOpen} onOpenChange={setDrawerOpen} editingService={editingService} />
      <ServiceDetailDrawer open={detailOpen} onOpenChange={setDetailOpen} service={detailService} onEdit={() => openEdit(detailService)} />
      <RegisterCompletionModal open={!!completionService} onOpenChange={(v) => !v && setCompletionService(null)} service={completionService} />
      <DeleteServiceDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        serviceName={deleteTarget?.name || ""}
        onConfirm={async () => { await deleteService.mutateAsync(deleteTarget.id); setDeleteTarget(null); }}
        loading={deleteService.isPending}
      />
      <ManageCategoriesModal open={categoriesModalOpen} onOpenChange={setCategoriesModalOpen} categories={categories as any} />
    </div>
  );
}
