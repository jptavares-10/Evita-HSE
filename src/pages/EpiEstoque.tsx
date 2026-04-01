import { useState, useMemo } from "react";
import { useEpiStockMovements } from "@/hooks/useEpi";
import { usePermission } from "@/hooks/usePermission";
import { ViewerBadge } from "@/components/ViewerBadge";
import { PermissionButton } from "@/components/PermissionButton";
import { StockMovementDrawer } from "@/components/epi/StockMovementDrawer";
import { formatDateBR } from "@/lib/epi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Package } from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";

export default function EpiEstoque() {
  const { data: movements = [], isLoading } = useEpiStockMovements();
  const { canEdit } = usePermission("epi");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    let result = movements;
    if (typeFilter !== "all") result = result.filter((m: any) => m.movement_type === typeFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((m: any) => m.epi_types?.name?.toLowerCase().includes(s) || m.notes?.toLowerCase().includes(s));
    }
    return result;
  }, [movements, search, typeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="entry">Entradas</SelectItem>
              <SelectItem value="exit">Saídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Movimentação</Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhuma movimentação encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>EPI</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Registrado por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell>{formatDateBR(m.moved_at)}</TableCell>
                  <TableCell className="font-medium">{m.epi_types?.name || "—"}</TableCell>
                  <TableCell>
                    {m.movement_type === "entry" ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        <ArrowUpCircle className="h-3 w-3 mr-1" />Entrada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                        <ArrowDownCircle className="h-3 w-3 mr-1" />Saída
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{m.quantity} {m.epi_types?.unit || ""}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{m.notes || "—"}</TableCell>
                  <TableCell className="text-sm">{m.profiles?.full_name || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <StockMovementDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
