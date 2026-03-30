import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Plus, Settings } from "lucide-react";

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
  onManageTypes: () => void;
  onNewDocument: () => void;
  isExpired: boolean;
}

export function DocumentFilters({
  search, onSearchChange, typeFilter, onTypeChange, statusFilter, onStatusChange,
  areaFilter, onAreaChange, types, areas, onManageTypes, onNewDocument, isExpired,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por título, código ou responsável..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
      </div>
      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Vigente</SelectItem>
          <SelectItem value="under_review">Em revisão</SelectItem>
          <SelectItem value="obsolete">Obsoleto</SelectItem>
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
      <Button variant="outline" size="sm" onClick={onManageTypes}><Settings className="h-4 w-4 mr-1" />Gerenciar tipos</Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button onClick={onNewDocument} disabled={isExpired}><Plus className="h-4 w-4 mr-1" />Novo documento</Button>
          </div>
        </TooltipTrigger>
        {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
      </Tooltip>
    </div>
  );
}
