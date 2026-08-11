import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInspectionAssets, useDeleteAsset } from "@/hooks/useInspectionsField";
import { useSectors } from "@/hooks/useTrainings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, QrCode, Pencil, Trash2, Printer, ExternalLink } from "lucide-react";
import { AssetDrawer } from "@/components/inspecoes/AssetDrawer";
import { TableSkeleton } from "@/components/TableSkeleton";
import { usePermission } from "@/hooks/usePermission";
import { PermissionButton } from "@/components/PermissionButton";
import { ViewerBadge } from "@/components/ViewerBadge";
import { ASSET_TYPES, buildAssetLabelsPdf, downloadBlob, getInspectionQrUrl, qrDataUrl } from "@/lib/inspection-assets";
import { useToast } from "@/hooks/use-toast";

export default function InspecoesAtivos() {
  const { company } = useAuth();
  const { data: assets = [], isLoading } = useInspectionAssets();
  const { data: sectors = [] } = useSectors();
  const deleteAsset = useDeleteAsset();
  const { canEdit } = usePermission("inspections");
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let r = assets as any[];
    if (search) {
      const s = search.toLowerCase();
      r = r.filter((a) => a.tag_code.toLowerCase().includes(s) || a.name.toLowerCase().includes(s));
    }
    if (typeFilter !== "all") r = r.filter((a) => a.asset_type === typeFilter);
    return r;
  }, [assets, search, typeFilter]);

  const toggleSel = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((a: any) => a.id)));
  };

  const handlePrintLabels = async () => {
    const toPrint = filtered.filter((a: any) => selected.has(a.id));
    if (toPrint.length === 0) {
      toast({ title: "Selecione pelo menos um ativo.", variant: "destructive" });
      return;
    }
    const blob = await buildAssetLabelsPdf(
      toPrint.map((a: any) => ({ tagCode: a.tag_code, name: a.name, location: a.location_description, qrToken: a.qr_token })),
      company?.name,
    );
    downloadBlob(blob, `etiquetas-ativos-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const showPreview = async (a: any) => {
    const url = getInspectionQrUrl(a.qr_token);
    const img = await qrDataUrl(url, 320);
    setPreviewImg(img);
    setPreviewToken(a.qr_token);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por tag ou nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="all">Todos os tipos</option>
          {Object.entries(ASSET_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {selected.size > 0 && (
          <Button variant="outline" onClick={handlePrintLabels}>
            <Printer className="h-4 w-4 mr-1.5" />
            Imprimir etiquetas ({selected.size})
          </Button>
        )}
        <PermissionButton canEdit={canEdit} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />
          Novo ativo
        </PermissionButton>
        {!canEdit && <ViewerBadge />}
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <QrCode className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhum ativo cadastrado. Cadastre extintores, máquinas ou outros ativos para gerar etiquetas com QR.</p>
        </div>
      ) : (
        <div className="lp-card rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </TableHead>
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
                  <TableCell>
                    <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSel(a.id)} className="rounded" />
                  </TableCell>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => showPreview(a)} title="Ver QR">
                        <QrCode className="h-4 w-4" />
                      </Button>
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

      <AlertDialog open={!!previewToken} onOpenChange={(v) => !v && (setPreviewToken(null), setPreviewImg(null))}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>QR Code do ativo</AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3">
              {previewImg && <img src={previewImg} alt="QR" className="mx-auto rounded border" />}
              <a href={previewToken ? getInspectionQrUrl(previewToken) : "#"} className="text-primary inline-flex items-center gap-1 text-xs" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                Testar link
              </a>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
