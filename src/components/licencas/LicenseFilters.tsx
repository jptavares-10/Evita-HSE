import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterBar } from "@/components/ui/filter-bar";
import { STATUS_META } from "@/lib/status";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  sphereFilter: string;
  onSphereChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  types: { id: string; name: string }[];
  hasActiveFilters?: boolean;
  onClear?: () => void;
}

export function LicenseFilters({
  search, onSearchChange, typeFilter, onTypeChange,
  sphereFilter, onSphereChange, statusFilter, onStatusChange,
  types, hasActiveFilters, onClear,
}: Props) {
  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por número, título ou órgão..."
      hasActiveFilters={hasActiveFilters}
      onClear={onClear}
    >
      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="none">Sem tipo</SelectItem>
          {types.map((t) => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sphereFilter} onValueChange={onSphereChange}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Esfera" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as esferas</SelectItem>
          <SelectItem value="federal">Federal</SelectItem>
          <SelectItem value="estadual">Estadual</SelectItem>
          <SelectItem value="municipal">Municipal</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Situação" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as situações</SelectItem>
          <SelectItem value="active">{STATUS_META.ok.label}</SelectItem>
          <SelectItem value="expiring">{STATUS_META.warning.label}</SelectItem>
          <SelectItem value="expired">{STATUS_META.expired.label}</SelectItem>
          <SelectItem value="in_renewal">Em renovação</SelectItem>
          <SelectItem value="permanent">Permanente</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
