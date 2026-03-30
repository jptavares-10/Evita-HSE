import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Plus, Settings } from "lucide-react";

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
  onManageTypes: () => void;
  onNewLicense: () => void;
  isExpired: boolean;
}

export function LicenseFilters({
  search, onSearchChange, typeFilter, onTypeChange,
  sphereFilter, onSphereChange, statusFilter, onStatusChange,
  types, onManageTypes, onNewLicense, isExpired,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, título ou órgão..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
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
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Esfera" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="federal">Federal</SelectItem>
          <SelectItem value="estadual">Estadual</SelectItem>
          <SelectItem value="municipal">Municipal</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Vigente</SelectItem>
          <SelectItem value="expiring">Vencendo</SelectItem>
          <SelectItem value="expired">Vencida</SelectItem>
          <SelectItem value="in_renewal">Em renovação</SelectItem>
          <SelectItem value="permanent">Permanente</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={onManageTypes}>
        <Settings className="h-4 w-4 mr-1" />
        Gerenciar tipos
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button onClick={onNewLicense} disabled={isExpired}>
              <Plus className="h-4 w-4 mr-1" />
              Nova licença
            </Button>
          </div>
        </TooltipTrigger>
        {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
      </Tooltip>
    </div>
  );
}
