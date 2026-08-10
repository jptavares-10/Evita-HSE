import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/PermissionButton";
import { Search, Plus, Download } from "lucide-react";
import { CRITICALITIES, DEADLINE_TYPES } from "@/lib/conditionants";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  licenseFilter: string;
  onLicenseChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  criticalityFilter: string;
  onCriticalityChange: (v: string) => void;
  responsibleFilter: string;
  onResponsibleChange: (v: string) => void;
  deadlineFilter: string;
  onDeadlineChange: (v: string) => void;
  licenses: { id: string; license_number: string; title: string }[];
  members: { id: string; full_name: string | null }[];
  onNew: () => void;
  onExport: () => void;
  isDisabled: boolean;
  canEdit: boolean;
}

export function ConditionantFilters({
  search, onSearchChange, licenseFilter, onLicenseChange, statusFilter, onStatusChange,
  criticalityFilter, onCriticalityChange, responsibleFilter, onResponsibleChange,
  deadlineFilter, onDeadlineChange, licenses, members, onNew, onExport, isDisabled, canEdit,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Buscar por item ou descrição..." className="pl-9" />
      </div>

      <Select value={licenseFilter} onValueChange={onLicenseChange}>
        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Licença" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as licenças</SelectItem>
          {licenses.map((l) => <SelectItem key={l.id} value={l.id}>{l.license_number}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Situação" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="on_track">Em dia</SelectItem>
          <SelectItem value="expiring">Vencendo</SelectItem>
          <SelectItem value="overdue">Atrasadas</SelectItem>
          <SelectItem value="fulfilled">Cumpridas</SelectItem>
          <SelectItem value="continuous">Contínuas</SelectItem>
          <SelectItem value="not_applicable">Não aplicáveis</SelectItem>
        </SelectContent>
      </Select>

      <Select value={criticalityFilter} onValueChange={onCriticalityChange}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Criticidade" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toda criticidade</SelectItem>
          {CRITICALITIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={responsibleFilter} onValueChange={onResponsibleChange}>
        <SelectTrigger className="w-[170px]"><SelectValue placeholder="Responsável" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="none">Sem responsável</SelectItem>
          {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name || "—"}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={deadlineFilter} onValueChange={onDeadlineChange}>
        <SelectTrigger className="w-[170px]"><SelectValue placeholder="Tipo de prazo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os prazos</SelectItem>
          {DEADLINE_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onExport} className="gap-1.5">
        <Download className="h-4 w-4" /> Exportar
      </Button>

      <PermissionButton canEdit={canEdit} onClick={onNew} disabled={isDisabled} className="gap-1.5">
        <Plus className="h-4 w-4" /> Nova condicionante
      </PermissionButton>
    </div>
  );
}