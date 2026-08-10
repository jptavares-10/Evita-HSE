import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePermission } from "@/hooks/usePermission";
import { useEnvironmentalLicenses } from "@/hooks/useLicenses";
import {
  useConditionants, useDeleteConditionant, useCompanyMembers, type ConditionantRow,
} from "@/hooks/useConditionants";
import {
  CRITICALITIES, EFFECTIVE_STATUS_META, daysRemainingLabel, deadlineTypeLabel, formatDateBR,
  type EffectiveStatus,
} from "@/lib/conditionants";
import { ConditionantKpiCards } from "@/components/licencas/condicionantes/ConditionantKpiCards";
import { ConditionantFilters } from "@/components/licencas/condicionantes/ConditionantFilters";
import { ConditionantDrawer } from "@/components/licencas/condicionantes/ConditionantDrawer";
import { ConditionantDetailDrawer } from "@/components/licencas/condicionantes/ConditionantDetailDrawer";
import { RegisterComplianceModal } from "@/components/licencas/condicionantes/RegisterComplianceModal";
import { DeleteConditionantDialog } from "@/components/licencas/condicionantes/DeleteConditionantDialog";
import { LicensesTabs } from "@/components/licencas/LicensesTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, CheckCircle2, Pencil, Trash2, Paperclip } from "lucide-react";
import { ViewerBadge } from "@/components/ViewerBadge";
import { PageSkeleton } from "@/components/TableSkeleton";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";
import { downloadXlsx } from "@/lib/xlsx-utils";

export default function LicencasCondicionantes() {
  usePageTitle("Condicionantes de Licença — Evita HSE", {
    description: "Acompanhamento de condicionantes ambientais, prazos e evidências.",
    noindex: true,
  });

  const { company } = useAuth();
  const { canEdit } = usePermission("environmental_licenses");
  const isExpired = company?.plan === "expired";
  const isDisabled = !!isExpired || !canEdit;

  const { data: conditionants = [], isLoading } = useConditionants();
  const { data: licenses = [] } = useEnvironmentalLicenses();
  const { data: members = [] } = useCompanyMembers();
  const deleteConditionant = useDeleteConditionant();

  const [search, setSearch] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [criticalityFilter, setCriticalityFilter] = useState("all");
  const [responsibleFilter, setResponsibleFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ConditionantRow | null>(null);
  const [detail, setDetail] = useState<ConditionantRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [complianceTarget, setComplianceTarget] = useState<ConditionantRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConditionantRow | null>(null);

  const counts = useMemo(() => {
    const c: Record<EffectiveStatus, number> = {
      on_track: 0, expiring: 0, overdue: 0, fulfilled: 0, continuous: 0, not_applicable: 0,
    };
    conditionants.forEach((x) => { c[x._status]++; });
    return c;
  }, [conditionants]);

  const conformity = useMemo(() => {
    const relevant = conditionants.filter((x) => x._status !== "not_applicable");
    if (relevant.length === 0) return 100;
    const compliant = relevant.filter((x) => x._status === "fulfilled" || x._status === "on_track" || x._status === "continuous").length;
    return Math.round((compliant / relevant.length) * 100);
  }, [conditionants]);

  const activeStatus = kpiFilter || (statusFilter !== "all" ? statusFilter : null);

  const filtered = useMemo(() => {
    let result = conditionants;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.description.toLowerCase().includes(q) ||
        (c.item_code || "").toLowerCase().includes(q) ||
        (c.environmental_licenses?.license_number || "").toLowerCase().includes(q));
    }
    if (licenseFilter !== "all") result = result.filter((c) => c.license_id === licenseFilter);
    if (activeStatus) result = result.filter((c) => c._status === activeStatus);
    if (criticalityFilter !== "all") result = result.filter((c) => c.criticality === criticalityFilter);
    if (responsibleFilter === "none") result = result.filter((c) => !c.responsible_id);
    else if (responsibleFilter !== "all") result = result.filter((c) => c.responsible_id === responsibleFilter);
    if (deadlineFilter !== "all") result = result.filter((c) => c.deadline_type === deadlineFilter);

    const rank: Record<EffectiveStatus, number> = { overdue: 0, expiring: 1, on_track: 2, continuous: 3, fulfilled: 4, not_applicable: 5 };
    return [...result].sort((a, b) => {
      if (rank[a._status] !== rank[b._status]) return rank[a._status] - rank[b._status];
      if (!a._resolved_due && !b._resolved_due) return 0;
      if (!a._resolved_due) return 1;
      if (!b._resolved_due) return -1;
      return a._resolved_due.localeCompare(b._resolved_due);
    });
  }, [conditionants, search, licenseFilter, activeStatus, criticalityFilter, responsibleFilter, deadlineFilter]);

  const pagination = useTablePagination(filtered);

  const handleExport = () => {
    const rows: string[][] = [
      ["Licença", "Item", "Exigência", "Tipo de prazo", "Vencimento", "Responsável", "Criticidade", "Situação", "Cumprimentos"],
      ...filtered.map((c) => [
        c.environmental_licenses?.license_number || "",
        c.item_code || "",
        c.description,
        deadlineTypeLabel(c.deadline_type, c.recurrence, c.days_before_license_expiry),
        c.deadline_type === "continuous" ? "Contínua" : formatDateBR(c._resolved_due),
        c.responsible?.full_name || "",
        CRITICALITIES.find((x) => x.value === c.criticality)?.label || c.criticality,
        EFFECTIVE_STATUS_META[c._status].label,
        String(c._compliance_count),
      ]),
    ];
    downloadXlsx(rows, "condicionantes-licencas");
  };

  const openNew = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (c: ConditionantRow) => { setEditing(c); setDrawerOpen(true); setDetailOpen(false); };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Licenças Ambientais</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe as condicionantes de cada licença, prazos e evidências de cumprimento.
          </p>
        </div>
        {!canEdit && <ViewerBadge />}
      </div>

      <LicensesTabs />

      <ConditionantKpiCards
        counts={counts}
        total={conditionants.length}
        conformity={conformity}
        activeFilter={kpiFilter}
        onFilterClick={(s) => { setKpiFilter(s); if (s) setStatusFilter("all"); }}
      />

      <ConditionantFilters
        search={search} onSearchChange={setSearch}
        licenseFilter={licenseFilter} onLicenseChange={setLicenseFilter}
        statusFilter={statusFilter} onStatusChange={(v) => { setStatusFilter(v); setKpiFilter(null); }}
        criticalityFilter={criticalityFilter} onCriticalityChange={setCriticalityFilter}
        responsibleFilter={responsibleFilter} onResponsibleChange={setResponsibleFilter}
        deadlineFilter={deadlineFilter} onDeadlineChange={setDeadlineFilter}
        licenses={licenses as any}
        members={members as any}
        onNew={openNew}
        onExport={handleExport}
        isDisabled={isDisabled}
        canEdit={canEdit}
      />

      {isLoading ? (
        <PageSkeleton columns={8} />
      ) : conditionants.length === 0 ? (
        <div className="lp-card rounded-xl px-6 py-16 text-center">
          <p className="font-medium">Nenhuma condicionante cadastrada</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {licenses.length === 0
              ? "Cadastre primeiro uma licença ambiental para depois vincular suas condicionantes."
              : "Cadastre as exigências impostas pelo órgão ambiental para acompanhar prazos e guardar evidências."}
          </p>
          {licenses.length > 0 && canEdit && (
            <Button className="mt-4" onClick={openNew} disabled={isDisabled}>Nova condicionante</Button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Nenhuma condicionante encontrada com os filtros aplicados.</div>
      ) : (
        <>
          <div className="lp-card overflow-x-auto rounded-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Licença</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Exigência</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Criticidade</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paginatedData.map((c: ConditionantRow) => {
                  const meta = EFFECTIVE_STATUS_META[c._status];
                  const crit = CRITICALITIES.find((x) => x.value === c.criticality);
                  const days = daysRemainingLabel(c._resolved_due, c.alert_days_before);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm font-medium">{c.environmental_licenses?.license_number || "—"}</TableCell>
                      <TableCell className="text-sm tabular-nums">{c.item_code || "—"}</TableCell>
                      <TableCell className="max-w-[280px]">
                        <button
                          onClick={() => { setDetail(c); setDetailOpen(true); }}
                          className="line-clamp-2 text-left text-sm text-primary hover:underline"
                        >
                          {c.description}
                        </button>
                        {c._compliance_count > 0 && (
                          <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Paperclip className="h-3 w-3" /> {c._compliance_count} cumprimento(s)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {deadlineTypeLabel(c.deadline_type, c.recurrence, c.days_before_license_expiry)}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {c.deadline_type === "continuous" ? (
                          <span className="text-muted-foreground">Contínua</span>
                        ) : (
                          <div>
                            <div>{formatDateBR(c._resolved_due)}</div>
                            <div className={`text-[11px] font-medium ${days.color}`}>{days.label}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{c.responsible?.full_name || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell>
                        {crit && <Badge variant="outline" className={`text-[10px] ${crit.className}`}>{crit.label}</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${meta.className}`}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetail(c); setDetailOpen(true); }}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                          {canEdit && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDisabled} onClick={() => setComplianceTarget(c)}>
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Registrar cumprimento</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDisabled} onClick={() => openEdit(c)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={isDisabled} onClick={() => setDeleteTarget(c)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Excluir</TooltipContent>
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

      <ConditionantDrawer open={drawerOpen} onOpenChange={setDrawerOpen} editing={editing} licenses={licenses as any} />
      <ConditionantDetailDrawer
        open={detailOpen} onOpenChange={setDetailOpen} conditionant={detail}
        onEdit={() => detail && openEdit(detail)}
        onRegister={() => { setComplianceTarget(detail); setDetailOpen(false); }}
        isDisabled={isDisabled}
      />
      <RegisterComplianceModal conditionant={complianceTarget} onClose={() => setComplianceTarget(null)} />
      <DeleteConditionantDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        description={deleteTarget?.description || ""}
        complianceCount={deleteTarget?._compliance_count || 0}
        loading={deleteConditionant.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteConditionant.mutateAsync({ id: deleteTarget.id, company_id: deleteTarget.company_id });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}