import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterBar } from "@/components/ui/filter-bar";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  areaFilter: string;
  onAreaChange: (v: string) => void;
  types: { id: string; name: string }[];
  areas: string[];
  onClear: () => void;
}

export function DocumentFilters({
  search, onSearchChange, typeFilter, onTypeChange, statusFilter, onStatusChange,
  areaFilter, onAreaChange, types, areas, onClear,
}: Props) {
  const hasActiveFilters = !!search || typeFilter !== "all" || statusFilter !== "all" || areaFilter !== "all";

  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por título, código ou responsável..."
      hasActiveFilters={hasActiveFilters}
      onClear={onClear}
    >
      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {areas.length > 0 && (
        <Select value={areaFilter} onValueChange={onAreaChange}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Área" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as áreas</SelectItem>
            {areas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[170px]"><SelectValue placeholder="Situação" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as situações</SelectItem>
          <SelectItem value="active">Vigente</SelectItem>
          <SelectItem value="under_review">Em revisão</SelectItem>
          <SelectItem value="obsolete">Obsoleto</SelectItem>
          <SelectItem value="revision_overdue">Revisão atrasada</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
