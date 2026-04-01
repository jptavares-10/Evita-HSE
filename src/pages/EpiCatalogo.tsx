import { useState, useMemo } from "react";
import { useEpiTypes, useEpiStock, useDeleteEpiType } from "@/hooks/useEpi";
import { usePermission } from "@/hooks/usePermission";
import { ViewerBadge } from "@/components/ViewerBadge";
import { PermissionButton } from "@/components/PermissionButton";
import { computeCaStatus, getCaStatusBadge, computeStockStatus, getStockStatusBadge, formatDateBR } from "@/lib/epi";
import { EpiDrawer } from "@/components/epi/EpiDrawer";
import { DeleteEpiDialog } from "@/components/epi/DeleteEpiDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, HardHat } from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";

export default function EpiCatalogo() {
  const { data: epiTypes = [], isLoading } = useEpiTypes();
  const { data: stock = {} } = useEpiStock();
  const deleteEpi = useDeleteEpiType();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return epiTypes;
    const s = search.toLowerCase();
    return epiTypes.filter((e: any) => e.name.toLowerCase().includes(s) || e.ca_number?.toLowerCase().includes(s));
  }, [epiTypes, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar EPI ou CA..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { setEditData(null); setDrawerOpen(true); }}><Plus className="h-4 w-4 mr-2" />Novo EPI</Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={7} />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HardHat className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{search ? "Nenhum EPI encontrado." : "Nenhum EPI cadastrado. Comece adicionando um."}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CA</TableHead>
                <TableHead>Validade CA</TableHead>
                <TableHead>Status CA</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead>Status Estoque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e: any) => {
                const currentStock = stock[e.id] ?? 0;
                const caStatus = computeCaStatus(e.ca_expires_at, e.ca_alert_days_before);
                const caBadge = getCaStatusBadge(caStatus);
                const stockStatus = computeStockStatus(currentStock, e.minimum_stock);
                const stockBadge = getStockStatusBadge(stockStatus);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.ca_number || "—"}</TableCell>
                    <TableCell>{formatDateBR(e.ca_expires_at)}</TableCell>
                    <TableCell><Badge variant="outline" className={caBadge.className}>{caBadge.label}</Badge></TableCell>
                    <TableCell className="text-right">{currentStock} {e.unit}</TableCell>
                    <TableCell><Badge variant="outline" className={stockBadge.className}>{stockBadge.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditData(e); setDrawerOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(e)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <EpiDrawer open={drawerOpen} onOpenChange={setDrawerOpen} editData={editData} />
      <DeleteEpiDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        onConfirm={() => { deleteEpi.mutate(deleteTarget.id); setDeleteTarget(null); }}
        name={deleteTarget?.name || ""}
      />
    </div>
  );
}
