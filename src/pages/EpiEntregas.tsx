import { useState, useMemo } from "react";
import { useEpiDeliveries } from "@/hooks/useEpi";
import { usePermission } from "@/hooks/usePermission";
import { ViewerBadge } from "@/components/ViewerBadge";
import { PermissionButton } from "@/components/PermissionButton";
import { DeliveryDrawer } from "@/components/epi/DeliveryDrawer";
import { AddAttachmentModal } from "@/components/epi/AddAttachmentModal";
import { formatDateBR } from "@/lib/epi";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, HandMetal, FileImage, ImageIcon } from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";

export default function EpiEntregas() {
  const { data: deliveries = [], isLoading } = useEpiDeliveries();
  const { canEdit } = usePermission("epi");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [attachModalDeliveryId, setAttachModalDeliveryId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return deliveries;
    const s = search.toLowerCase();
    return deliveries.filter((d: any) =>
      d.employees?.name?.toLowerCase().includes(s) ||
      d.epi_types?.name?.toLowerCase().includes(s) ||
      d.reason?.toLowerCase().includes(s)
    );
  }, [deliveries, search]);

  const pagination = useTablePagination(filtered);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por colaborador ou EPI..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          {!canEdit && <ViewerBadge />}
          <PermissionButton canEdit={canEdit} onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Entrega</PermissionButton>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HandMetal className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{search ? "Nenhuma entrega encontrada." : "Nenhuma entrega registrada."}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>EPI</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Registrado por</TableHead>
                <TableHead className="text-center">Comprovante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedData.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell>{formatDateBR(d.delivered_at)}</TableCell>
                  <TableCell className="font-medium">{d.employees?.name || "—"}</TableCell>
                  <TableCell>{d.epi_types?.name || "—"}</TableCell>
                  <TableCell className="text-right">{d.quantity} {d.epi_types?.unit || ""}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.reason || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{d.notes || "—"}</TableCell>
                  <TableCell className="text-sm">{d.profiles?.full_name || "—"}</TableCell>
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

      <DeliveryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
