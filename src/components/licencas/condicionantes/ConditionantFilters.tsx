import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterBar } from "@/components/ui/filter-bar";
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
  hasActiveFilters?: boolean;
  onClear?: () => void;
}

export function ConditionantFilters({
  search, onSearchChange, licenseFilter, onLicenseChange, statusFilter, onStatusChange,
  criticalityFilter, onCriticalityChange, responsibleFilter, onResponsibleChange,
  deadlineFilter, onDeadlineChange, licenses, members, hasActiveFilters, onClear,
}: Props) {
  return (
    <FilterBar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por item ou descrição..."
      hasActiveFilters={hasActiveFilters}
      onClear={onClear}
    >
      <Select value={licenseFilter} onValueChange={onLicenseChange}>
        <SelectTrigger className="w-[190px]"><SelectValue placeholder="Licença" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as licenças</SelectItem>
          {licenses.map((l) => <SelectItem key={l.id} value={l.id}>{l.license_number}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Situação" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as situações</SelectItem>
          <SelectItem value="on_track">Em dia</SelectItem>
          <SelectItem value="expiring">Vencendo</SelectItem>
          <SelectItem value="overdue">Vencidos</SelectItem>
          <SelectItem value="fulfilled">Cumpridas</SelectItem>
          <SelectItem value="continuous">Contínuas</SelectItem>
          <SelectItem value="not_applicable">Não aplicáveis</SelectItem>
        </SelectContent>
      </Select>

      <Select value={criticalityFilter} onValueChange={onCriticalityChange}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Criticidade" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toda criticidade</SelectItem>
          {CRITICALITIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={responsibleFilter} onValueChange={onResponsibleChange}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Responsável" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os responsáveis</SelectItem>
          <SelectItem value="none">Sem responsável</SelectItem>
          {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name || "—"}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={deadlineFilter} onValueChange={onDeadlineChange}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo de prazo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os prazos</SelectItem>
          {DEADLINE_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
