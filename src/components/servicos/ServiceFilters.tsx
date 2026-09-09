import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterBar } from "@/components/ui/filter-bar";
import { STATUS_META } from "@/lib/status";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ServiceFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
  categories: Category[];
  hasActiveFilters?: boolean;
  onClear?: () => void;
}

export function ServiceFilters({
  search, onSearchChange, categoryFilter, onCategoryChange,
  statusFilter, onStatusChange, sortBy, onSortChange,
  categories, hasActiveFilters, onClear,
}: ServiceFiltersProps) {
  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por nome..."
      hasActiveFilters={hasActiveFilters}
      onClear={onClear}
    >
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[170px]"><SelectValue placeholder="Ordenar" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="next_due_at">Próxima data</SelectItem>
          <SelectItem value="name">Nome</SelectItem>
          <SelectItem value="category">Categoria</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Situação" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as situações</SelectItem>
          <SelectItem value="ok">{STATUS_META.ok.label}</SelectItem>
          <SelectItem value="warning">{STATUS_META.warning.label}</SelectItem>
          <SelectItem value="expired">{STATUS_META.expired.label}</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
