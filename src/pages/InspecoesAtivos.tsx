import { useMemo, useState } from "react";
import { useInspectionAssets, useDeleteAsset } from "@/hooks/useInspectionsField";
import { useSectors } from "@/hooks/useTrainings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Boxes, Pencil, Trash2 } from "lucide-react";
import { AssetDrawer } from "@/components/inspecoes/AssetDrawer";
import { TableSkeleton } from "@/components/TableSkeleton";
import { usePermission } from "@/hooks/usePermission";
import { PermissionButton } from "@/components/PermissionButton";
import { ViewerBadge } from "@/components/ViewerBadge";
import { ASSET_TYPES } from "@/lib/inspection-assets";

export default function InspecoesAtivos() {
  const { data: assets = [], isLoading } = useInspectionAssets();
  const { data: sectors = [] } = useSectors();
  const deleteAsset = useDeleteAsset();
  const { canEdit } = usePermission("inspections");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const filtered = useMemo(() => {
    let r = assets as any[];
    if (search) {
      const s = search.toLowerCase();
      r = r.filter((a) => a.tag_code.toLowerCase().includes(s) || a.name.toLowerCase().includes(s));
    }
    if (typeFilter !== "all") r = r.filter((a) => a.asset_type === typeFilter);
    return r;
  }, [assets, search, typeFilter]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Ativos"
        description="Extintores, máquinas e outros ativos vinculados às inspeções."
        actions={
          <>
            {!canEdit && <ViewerBadge />}
            <PermissionButton canEdit={canEdit} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />Novo ativo
            </PermissionButton>
          </>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por tag ou nome..."
        hasActiveFilters={!!search || typeFilter !== "all"}
        onClear={() => { setSearch(""); setTypeFilter("all"); }}
      >
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(ASSET_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v as string}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Boxes className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhum ativo cadastrado. Cadastre extintores, máquinas ou outros ativos para vincular às inspeções.</p>
        </div>
      ) : (
        <div className="lp-card rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etiqueta</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Setor / Local</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm font-semibold">{a.tag_code}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell className="text-sm">{ASSET_TYPES[a.asset_type] || a.asset_type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.sectors?.name || "—"}
                    {a.location_description && <div className="text-xs">{a.location_description}</div>}
                  </TableCell>
                  <TableCell>
                    {a.status === "active"
                      ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ativo</Badge>
                      : <Badge variant="outline">Inativo</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      {canEdit && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(a); setDrawerOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(a)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AssetDrawer open={drawerOpen} onOpenChange={setDrawerOpen} editing={editing} sectors={sectors} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ativo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se este ativo já tem inspeções, você deve inativar em vez de excluir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (deleteTarget) { await deleteAsset.mutateAsync(deleteTarget.id); setDeleteTarget(null); } }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
