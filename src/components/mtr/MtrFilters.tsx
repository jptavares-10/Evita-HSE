import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Settings2, Plus } from "lucide-react";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  transporterFilter: string;
  onTransporterChange: (v: string) => void;
  categories: any[];
  categoryFilter: string[];
  onCategoryChange: (v: string[]) => void;
  onManageCategories: () => void;
  onNewMtr: () => void;
  isExpired: boolean;
}

export function MtrFilters({
  search, onSearchChange, statusFilter, onStatusChange,
  transporterFilter, onTransporterChange,
  onManageCategories, onNewMtr, isExpired,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por número do MTR..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status CDF" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="warning">Em alerta</SelectItem>
          <SelectItem value="received">Recebido</SelectItem>
          <SelectItem value="overdue">Vencido</SelectItem>
        </SelectContent>
      </Select>
      <div className="relative min-w-[160px]">
        <Input placeholder="Transportadora..." value={transporterFilter} onChange={(e) => onTransporterChange(e.target.value)} />
      </div>
      <Button variant="outline" size="sm" onClick={onManageCategories}><Settings2 className="h-4 w-4 mr-1" />Categorias</Button>
      <Button size="sm" onClick={onNewMtr} disabled={isExpired}>
        <Plus className="h-4 w-4 mr-1" />Novo MTR
      </Button>
    </div>
  );
}
