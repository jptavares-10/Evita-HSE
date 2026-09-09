import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterBar } from "@/components/ui/filter-bar";
import { STATUS_META } from "@/lib/status";

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
  hasActiveFilters?: boolean;
  onClear?: () => void;
}

export function MtrFilters({
  search, onSearchChange, statusFilter, onStatusChange,
  transporterFilter, onTransporterChange, hasActiveFilters, onClear,
}: Props) {
  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por número do MTR..."
      hasActiveFilters={hasActiveFilters}
      onClear={onClear}
    >
      <Input
        placeholder="Transportadora..."
        value={transporterFilter}
        onChange={(e) => onTransporterChange(e.target.value)}
        className="w-[180px]"
      />
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[190px]"><SelectValue placeholder="Situação do CDF" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as situações</SelectItem>
          <SelectItem value="received">{STATUS_META.ok.label}</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="warning">{STATUS_META.warning.label}</SelectItem>
          <SelectItem value="overdue">{STATUS_META.expired.label}</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
