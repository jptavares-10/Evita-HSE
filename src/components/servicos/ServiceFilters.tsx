import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  onManageCategories: () => void;
  onNewService: () => void;
  isExpired: boolean;
}

export function ServiceFilters({
  search, onSearchChange, categoryFilter, onCategoryChange,
  statusFilter, onStatusChange, sortBy, onSortChange,
  categories, onManageCategories, onNewService, isExpired,
}: ServiceFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
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
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="ok">Em dia</SelectItem>
          <SelectItem value="warning">Vencendo</SelectItem>
          <SelectItem value="expired">Vencido</SelectItem>
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
      <Button variant="outline" size="sm" onClick={onManageCategories}>
        <Settings2 className="h-4 w-4 mr-1" /> Categorias
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button onClick={onNewService} disabled={isExpired}>
              <Plus className="h-4 w-4 mr-1" /> Novo Serviço
            </Button>
          </div>
        </TooltipTrigger>
        {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
      </Tooltip>
    </div>
  );
}
