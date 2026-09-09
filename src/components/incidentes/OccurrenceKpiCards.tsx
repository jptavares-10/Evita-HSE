import { AlertTriangle, FolderOpen, Activity, CheckCircle2, ListChecks } from "lucide-react";
import { Kpi, KpiGrid } from "@/components/ui/kpi";

interface Props {
  occurrences: any[];
  actions: any[];
  /** Active status filter, shared with the "Situação" select. */
  activeStatus?: string | null;
  onSelectStatus?: (status: string | null) => void;
}

export function OccurrenceKpiCards({ occurrences, actions, activeStatus = null, onSelectStatus }: Props) {
  const currentYear = new Date().getFullYear();
  const yearOccurrences = occurrences.filter((o) => new Date(o.occurred_at).getFullYear() === currentYear);

  const open = occurrences.filter((o) => o.status === "open").length;
  const inProgress = occurrences.filter((o) => o.status === "in_progress").length;
  const closed = occurrences.filter((o) => o.status === "closed").length;
  const openActions = actions.filter((a) => a.status !== "completed").length;

  const cards = [
    { key: null, label: `Ocorrências em ${currentYear}`, value: yearOccurrences.length, icon: AlertTriangle, tone: "neutral" as const },
    { key: "open", label: "Abertas", value: open, icon: FolderOpen, tone: open > 0 ? ("expired" as const) : ("neutral" as const) },
    { key: "in_progress", label: "Em andamento", value: inProgress, icon: Activity, tone: "primary" as const },
    { key: "closed", label: "Encerradas", value: closed, icon: CheckCircle2, tone: "success" as const },
    { key: null, label: "Ações em aberto", value: openActions, icon: ListChecks, tone: openActions > 0 ? ("warning" as const) : ("success" as const), href: "/incidentes/acoes" },
  ];

  return (
    <KpiGrid cols={5}>
      {cards.map((c: any) => (
        <Kpi
          key={c.label}
          label={c.label}
          value={c.value}
          icon={c.icon}
          tone={c.tone}
          href={c.href}
          active={c.key !== null && activeStatus === c.key}
          onClick={onSelectStatus && c.key !== null ? () => onSelectStatus(activeStatus === c.key ? null : c.key) : undefined}
        />
      ))}
    </KpiGrid>
  );
}
