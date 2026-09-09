import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Kpi } from "@/components/ui/kpi";
import { ListChecks, AlertTriangle, Clock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllCorrectiveActions } from "@/hooks/useOccurrences";
import { useCompanyMembers } from "@/hooks/useCompanyMembers";
import { ActionsTable } from "@/components/incidentes/acoes/ActionsTable";
import { getActionState, daysUntil } from "@/lib/occurrences";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";

const ALL = "all";

export function IncidentesAcoes() {
  const { profile } = useAuth();
  const { data: actions = [] } = useAllCorrectiveActions();
  const { data: members = [] } = useCompanyMembers();

  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState(ALL);
  const [responsible, setResponsible] = useState(ALL);

  const mine = useMemo(
    () => actions.filter((a: any) => a.responsible_profile_id === profile?.id),
    [actions, profile?.id],
  );

  const kpis = useMemo(() => {
    const openMine = mine.filter((a: any) => a.status !== "completed").length;
    const overdue = actions.filter((a: any) => getActionState(a) === "overdue").length;
    const dueSoon = actions.filter((a: any) => {
      const st = getActionState(a);
      if (st === "completed" || st === "verified" || st === "overdue") return false;
      const d = daysUntil(a.due_date);
      return d !== null && d >= 0 && d <= 7;
    }).length;
    const awaiting = actions.filter((a: any) => getActionState(a) === "completed").length;
    return { openMine, overdue, dueSoon, awaiting };
  }, [actions, mine]);

  const filtered = useMemo(() => {
    const base = scope === "mine" ? mine : actions;
    return base.filter((a: any) => {
      if (search && !a.description?.toLowerCase().includes(search.toLowerCase())) return false;
      if (stateFilter !== ALL && getActionState(a) !== stateFilter) return false;
      if (responsible !== ALL && a.responsible_profile_id !== responsible) return false;
      return true;
    });
  }, [actions, mine, scope, search, stateFilter, responsible]);

  const { currentPage, setCurrentPage, pageSize, setPageSize, totalPages, paginatedData, totalItems } = useTablePagination(filtered);

  return (
    <div className="space-y-6">
      <KpiGrid cols={4}>
        <Kpi
          label="Minhas ações em aberto"
          value={kpis.openMine}
          icon={ListChecks}
          tone="primary"
          active={scope === "mine" && stateFilter === ALL}
          onClick={() => { setScope("mine"); setStateFilter(ALL); setCurrentPage(1); }}
        />
        <Kpi
          label="Atrasadas"
          value={kpis.overdue}
          icon={AlertTriangle}
          tone="danger"
          active={stateFilter === "overdue"}
          onClick={() => { setStateFilter(stateFilter === "overdue" ? ALL : "overdue"); setCurrentPage(1); }}
        />
        <Kpi label="Vencendo em 7 dias" value={kpis.dueSoon} icon={Clock} tone="warning" />
        <Kpi
          label="Aguardando verificação"
          value={kpis.awaiting}
          icon={ShieldCheck}
          tone="info"
          active={stateFilter === "completed"}
          onClick={() => { setStateFilter(stateFilter === "completed" ? ALL : "completed"); setCurrentPage(1); }}
        />
      </KpiGrid>

      <Tabs value={scope} onValueChange={(v) => { setScope(v as any); setCurrentPage(1); }}>
        <TabsList>
          <TabsTrigger value="mine">Minhas ações</TabsTrigger>
          <TabsTrigger value="all">Todas as ações</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
        searchPlaceholder="Buscar por descrição..."
        hasActiveFilters={!!search || stateFilter !== ALL || responsible !== ALL}
        onClear={() => { setSearch(""); setStateFilter(ALL); setResponsible(ALL); setCurrentPage(1); }}
      >
        <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as situações</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="overdue">Atrasada</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="verified">Verificada</SelectItem>
          </SelectContent>
        </Select>
        {scope === "all" && (
          <Select value={responsible} onValueChange={(v) => { setResponsible(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os responsáveis</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.full_name || "Usuário sem nome"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <ActionsTable actions={paginatedData} />
      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

export default IncidentesAcoes;
