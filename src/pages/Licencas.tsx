import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironmentalLicenses, useLicenseTypes, useDeleteLicense } from "@/hooks/useLicenses";
import { computeLicenseStatus, getStatusBadgeInfo, getSphereBadgeInfo, getDaysRemainingInfo, formatDateBR } from "@/lib/licenses";
import { LicenseKpiCards } from "@/components/licencas/LicenseKpiCards";
import { LicenseFilters } from "@/components/licencas/LicenseFilters";
import { LicenseDrawer } from "@/components/licencas/LicenseDrawer";
import { LicenseDetailDrawer } from "@/components/licencas/LicenseDetailDrawer";
import { RegisterRenewalModal } from "@/components/licencas/RegisterRenewalModal";
import { DeleteLicenseDialog } from "@/components/licencas/DeleteLicenseDialog";
import { ManageLicenseTypesModal } from "@/components/licencas/ManageLicenseTypesModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, RotateCw, Pencil, Trash2, FileText, Plus } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Licencas() {
  usePageTitle("Licenças Ambientais — Evita HSE");
  const { company } = useAuth();
  const { data: licenses = [], isLoading } = useEnvironmentalLicenses();
  const { data: types = [] } = useLicenseTypes();
  const deleteLicense = useDeleteLicense();
  const isExpired = company?.plan === "expired";

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sphereFilter, setSphereFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // Modals/drawers
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any>(null);
  const [detailLicense, setDetailLicense] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [renewalLicense, setRenewalLicense] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [typesModalOpen, setTypesModalOpen] = useState(false);

  // Enrich with computed status
  const enriched = useMemo(() => {
    return licenses.map((l: any) => ({
      ...l,
      _status: computeLicenseStatus(l.has_expiry, l.expires_at, l.alert_days_before, l.status),
    }));
  }, [licenses]);

  const counts = useMemo(() => {
    const c = { active: 0, expiring: 0, expired: 0, in_renewal: 0, permanent: 0 };
    enriched.forEach((l: any) => { c[l._status as keyof typeof c]++; });
    return c;
  }, [enriched]);

  const activeStatus = kpiFilter || (statusFilter !== "all" ? statusFilter : null);

  const filtered = useMemo(() => {
    let result = enriched;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l: any) =>
        l.license_number.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q) ||
        l.issuing_body.toLowerCase().includes(q)
      );
    }
    if (typeFilter === "none") result = result.filter((l: any) => !l.license_type_id);
    else if (typeFilter !== "all") result = result.filter((l: any) => l.license_type_id === typeFilter);
    if (sphereFilter !== "all") result = result.filter((l: any) => l.sphere === sphereFilter);
    if (activeStatus) result = result.filter((l: any) => l._status === activeStatus);

    // Sort: expiring first, permanents last
    return [...result].sort((a: any, b: any) => {
      if (a._status === "permanent" && b._status !== "permanent") return 1;
      if (b._status === "permanent" && a._status !== "permanent") return -1;
      if (!a.expires_at && !b.expires_at) return 0;
      if (!a.expires_at) return 1;
      if (!b.expires_at) return -1;
      return a.expires_at.localeCompare(b.expires_at);
    });
  }, [enriched, search, typeFilter, sphereFilter, activeStatus]);

  const handleKpiClick = (status: string | null) => {
    setKpiFilter(status);
    if (status) setStatusFilter("all");
  };

  const openEdit = (license: any) => {
    setEditingLicense(license);
    setDrawerOpen(true);
    setDetailOpen(false);
  };

  const openNew = () => {
    setEditingLicense(null);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Licenças Ambientais</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie suas licenças, vencimentos e renovações.</p>
      </div>

      <LicenseKpiCards
        total={enriched.length}
        active={counts.active}
        expiring={counts.expiring}
        expired={counts.expired}
        permanent={counts.permanent}
        activeFilter={kpiFilter}
        onFilterClick={handleKpiClick}
      />

      <LicenseFilters
        search={search} onSearchChange={setSearch}
        typeFilter={typeFilter} onTypeChange={setTypeFilter}
        sphereFilter={sphereFilter} onSphereChange={setSphereFilter}
        statusFilter={statusFilter} onStatusChange={(v) => { setStatusFilter(v); setKpiFilter(null); }}
        types={types as any}
        onManageTypes={() => setTypesModalOpen(true)}
        onNewLicense={openNew}
        isExpired={!!isExpired}
      />

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : enriched.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">Nenhuma licença ambiental cadastrada.</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button onClick={openNew} disabled={!!isExpired}>
                  <Plus className="h-4 w-4 mr-1" />Cadastrar primeira licença
                </Button>
              </div>
            </TooltipTrigger>
            {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
          </Tooltip>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhuma licença encontrada com os filtros aplicados.</div>
      ) : (
        <div className="bg-card border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Órgão emissor</TableHead>
                <TableHead>Esfera</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Dias restantes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l: any) => {
                const statusInfo = getStatusBadgeInfo(l._status);
                const sphereInfo = getSphereBadgeInfo(l.sphere);
                const daysInfo = getDaysRemainingInfo(l.has_expiry, l.expires_at, l.alert_days_before, l.status);
                const isPermanent = l._status === "permanent";
                return (
                  <TableRow key={l.id}>
                    <TableCell>
                      <button onClick={() => { setDetailLicense(l); setDetailOpen(true); }} className="text-left font-medium text-primary hover:underline">
                        {l.license_number}
                      </button>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{l.title}</TableCell>
                    <TableCell>
                      {l.license_types ? (
                        <Badge variant="outline" className="text-xs">{l.license_types.name}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{l.issuing_body}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${sphereInfo.className}`}>{sphereInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {l.has_expiry ? formatDateBR(l.expires_at) : "Permanente"}
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${daysInfo.color}`}>{daysInfo.label}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusInfo.className}`}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetailLicense(l); setDetailOpen(true); }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalhes</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPermanent || !!isExpired} onClick={() => setRenewalLicense(l)}>
                                <RotateCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isExpired ? "Seu plano expirou." : isPermanent ? "Licença permanente" : "Registrar renovação"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!isExpired} onClick={() => openEdit(l)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{isExpired ? "Seu plano expirou." : "Editar"}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={!!isExpired} onClick={() => setDeleteTarget(l)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{isExpired ? "Seu plano expirou." : "Excluir"}</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <LicenseDrawer open={drawerOpen} onOpenChange={setDrawerOpen} editingLicense={editingLicense} />
      <LicenseDetailDrawer
        open={detailOpen} onOpenChange={setDetailOpen} license={detailLicense}
        onEdit={() => openEdit(detailLicense)}
        onRenew={() => { setRenewalLicense(detailLicense); setDetailOpen(false); }}
        isExpired={!!isExpired}
      />
      <RegisterRenewalModal open={!!renewalLicense} onOpenChange={(v) => !v && setRenewalLicense(null)} license={renewalLicense} />
      <DeleteLicenseDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        licenseNumber={deleteTarget?.license_number || ""}
        licenseTitle={deleteTarget?.title || ""}
        onConfirm={async () => { await deleteLicense.mutateAsync({ id: deleteTarget.id, company_id: deleteTarget.company_id }); setDeleteTarget(null); }}
        loading={deleteLicense.isPending}
      />
      <ManageLicenseTypesModal open={typesModalOpen} onOpenChange={setTypesModalOpen} types={types as any} />
    </div>
  );
}
