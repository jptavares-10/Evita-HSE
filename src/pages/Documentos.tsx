import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments, useDocumentTypes, useDeleteDocument } from "@/hooks/useDocuments";
import { getDocStatusBadgeInfo, formatDateBR, getRevisionCycleStatus, getRevisionCycleBadgeInfo } from "@/lib/documents";
import { DocumentKpiCards } from "@/components/documentos/DocumentKpiCards";
import { DocumentFilters } from "@/components/documentos/DocumentFilters";
import { DocumentDrawer } from "@/components/documentos/DocumentDrawer";
import { DocumentDetailDrawer } from "@/components/documentos/DocumentDetailDrawer";
import { NewRevisionModal } from "@/components/documentos/NewRevisionModal";
import { DeleteDocumentDialog } from "@/components/documentos/DeleteDocumentDialog";
import { ManageDocumentTypesModal } from "@/components/documentos/ManageDocumentTypesModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, FileText as FileTextIcon, Pencil, Trash2, Plus, Tags } from "lucide-react";
import { ModuleOnboarding, OnboardingStep } from "@/components/ModuleOnboarding";
import { usePageTitle } from "@/hooks/usePageTitle";
import { PageSkeleton } from "@/components/TableSkeleton";
import { usePermission } from "@/hooks/usePermission";
import { ViewerBadge } from "@/components/ViewerBadge";

export default function Documentos() {
  usePageTitle("Biblioteca de Documentos — Evita HSE");
  const { company } = useAuth();
  const { data: documents = [], isLoading } = useDocuments();
  const { data: types = [] } = useDocumentTypes();
  const isExpired = company?.plan === "expired";
  const { canEdit } = usePermission("document_library");
  const isDisabled = isExpired || !canEdit;

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [detailDoc, setDetailDoc] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [revisionDoc, setRevisionDoc] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [typesModalOpen, setTypesModalOpen] = useState(false);

  const areas = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d: any) => { if (d.area) set.add(d.area); });
    return Array.from(set).sort();
  }, [documents]);

  const counts = useMemo(() => {
    const c = { active: 0, under_review: 0, obsolete: 0, revision_overdue: 0 };
    documents.forEach((d: any) => {
      c[d.status as keyof typeof c]++;
      if (getRevisionCycleStatus(d) === "overdue") c.revision_overdue++;
    });
    return c;
  }, [documents]);

  const activeStatus = kpiFilter === "revision_overdue" ? null : (kpiFilter || (statusFilter !== "all" ? statusFilter : null));

  const filtered = useMemo(() => {
    let result = documents;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d: any) =>
        d.title.toLowerCase().includes(q) ||
        (d.code && d.code.toLowerCase().includes(q)) ||
        (d.responsible && d.responsible.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== "all") result = result.filter((d: any) => d.document_type_id === typeFilter);
    if (activeStatus) result = result.filter((d: any) => d.status === activeStatus);
    if (kpiFilter === "revision_overdue") result = result.filter((d: any) => getRevisionCycleStatus(d) === "overdue");
    if (areaFilter !== "all") result = result.filter((d: any) => d.area === areaFilter);
    return result;
  }, [documents, search, typeFilter, activeStatus, kpiFilter, areaFilter]);

  const handleKpiClick = (status: string | null) => {
    setKpiFilter(status);
    if (status) setStatusFilter("all");
  };

  const openEdit = (doc: any) => { setEditingDoc(doc); setDrawerOpen(true); setDetailOpen(false); };
  const openNew = () => { setEditingDoc(null); setDrawerOpen(true); };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Biblioteca de Documentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie documentos técnicos, revisões e vínculos.</p>
        </div>
        {!canEdit && <ViewerBadge />}
      </div>

      <DocumentKpiCards
        total={documents.length}
        active={counts.active}
        underReview={counts.under_review}
        obsolete={counts.obsolete}
        revisionOverdue={counts.revision_overdue}
        activeFilter={kpiFilter}
        onFilterClick={handleKpiClick}
      />

      <DocumentFilters
        search={search} onSearchChange={setSearch}
        typeFilter={typeFilter} onTypeChange={setTypeFilter}
        statusFilter={statusFilter} onStatusChange={(v) => { setStatusFilter(v); setKpiFilter(null); }}
        areaFilter={areaFilter} onAreaChange={setAreaFilter}
        types={types as any}
        areas={areas}
        onManageTypes={() => setTypesModalOpen(true)}
        onNewDocument={openNew}
        isExpired={!!isDisabled}
      />

      {isLoading ? (
        <PageSkeleton columns={9} />
      ) : documents.length === 0 ? (
        <ModuleOnboarding
          title="Biblioteca de Documentos"
          description="Organize seus documentos técnicos, controle revisões e vínculos."
          icon={FileTextIcon}
          steps={[
            { title: "Criar tipos de documento", description: "Defina categorias como Procedimento, Instrução, Manual", icon: Tags, actionLabel: "Criar tipos", action: () => setTypesModalOpen(true), completed: types.some((t: any) => !t.is_default) },
            { title: "Cadastrar primeiro documento", description: "Registre título, revisão e arquivo do documento", icon: Plus, actionLabel: "Cadastrar", action: openNew, completed: false },
          ] as OnboardingStep[]}
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum documento encontrado com os filtros aplicados.</div>
      ) : (
        <div className="bg-card border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Revisão</TableHead>
                <TableHead>Data emissão</TableHead>
                <TableHead>Próxima revisão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d: any) => {
                const statusInfo = getDocStatusBadgeInfo(d.status);
                const revCycleStatus = getRevisionCycleStatus(d);
                const revCycleBadge = getRevisionCycleBadgeInfo(revCycleStatus);
                return (
                  <TableRow key={d.id}>
                    <TableCell className="text-xs text-muted-foreground font-mono">{d.code || "—"}</TableCell>
                    <TableCell>
                      <button onClick={() => { setDetailDoc(d); setDetailOpen(true); }} className="text-left font-medium text-primary hover:underline">
                        {d.title}
                      </button>
                    </TableCell>
                    <TableCell>
                      {d.document_types ? (
                        <Badge variant="outline" className="text-xs">{d.document_types.name}</Badge>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">{d.responsible || "—"}</TableCell>
                    <TableCell className="text-sm font-mono">{d.current_revision}</TableCell>
                    <TableCell className="text-sm tabular-nums">{formatDateBR(d.current_revision_date)}</TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {d.has_revision_cycle && d.next_revision_at ? (
                        <div className="flex items-center gap-1.5">
                          <span>{formatDateBR(d.next_revision_at)}</span>
                          {revCycleBadge && (
                            <Badge variant="outline" className={`text-[10px] ${revCycleBadge.className}`}>
                              {revCycleBadge.label}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusInfo.className}`}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip><TooltipTrigger asChild><div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetailDoc(d); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        </div></TooltipTrigger><TooltipContent>Ver detalhes</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!isExpired} onClick={() => setRevisionDoc(d)}><FileTextIcon className="h-4 w-4" /></Button>
                        </div></TooltipTrigger><TooltipContent>{isExpired ? "Plano expirado" : "Nova revisão"}</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!isExpired} onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                        </div></TooltipTrigger><TooltipContent>{isExpired ? "Plano expirado" : "Editar"}</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={!!isExpired} onClick={() => setDeleteTarget(d)}><Trash2 className="h-4 w-4" /></Button>
                        </div></TooltipTrigger><TooltipContent>{isExpired ? "Plano expirado" : "Excluir"}</TooltipContent></Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <DocumentDrawer open={drawerOpen} onOpenChange={setDrawerOpen} editingDocument={editingDoc} />
      <DocumentDetailDrawer
        open={detailOpen} onOpenChange={setDetailOpen} document={detailDoc}
        onEdit={() => openEdit(detailDoc)}
        onNewRevision={() => { setRevisionDoc(detailDoc); setDetailOpen(false); }}
        isExpired={!!isExpired}
      />
      <NewRevisionModal open={!!revisionDoc} onOpenChange={(v) => !v && setRevisionDoc(null)} document={revisionDoc} />
      <DeleteDocumentDialog
        open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={deleteTarget?.title || ""}
        onConfirm={async () => { await deleteDocument.mutateAsync({ id: deleteTarget.id, company_id: deleteTarget.company_id }); setDeleteTarget(null); }}
        loading={deleteDocument.isPending}
      />
      <ManageDocumentTypesModal open={typesModalOpen} onOpenChange={setTypesModalOpen} types={types as any} />
    </div>
  );
}
