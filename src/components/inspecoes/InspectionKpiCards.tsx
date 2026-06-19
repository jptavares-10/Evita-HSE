import { Clock, PlayCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";

interface Props {
  pendingToday: number;
  inProgress: number;
  overdue: number;
  completedThisWeek: number;
  activeFilter: string | null;
  onFilterClick: (filter: string | null) => void;
}

const cards: { key: string; label: string; icon: any; tone: KpiTone }[] = [
  { key: "pending_today", label: "Pendentes hoje", icon: Clock, tone: "warning" },
  { key: "in_progress", label: "Em andamento", icon: PlayCircle, tone: "info" },
  { key: "overdue", label: "Vencidas", icon: AlertTriangle, tone: "danger" },
  { key: "completed_week", label: "Concluídas esta semana", icon: CheckCircle2, tone: "success" },
];

export function InspectionKpiCards({ pendingToday, inProgress, overdue, completedThisWeek, activeFilter, onFilterClick }: Props) {
  const values: Record<string, number> = {
    pending_today: pendingToday,
    in_progress: inProgress,
    overdue: overdue,
    completed_week: completedThisWeek,
  };

  return (
    <KpiGrid cols={4}>
      {cards.map((c) => {
        const isActive = activeFilter === c.key;
        return (
          <Kpi
            key={c.key}
            label={c.label}
            value={values[c.key]}
            icon={c.icon}
            tone={c.tone}
            active={isActive}
            onClick={() => onFilterClick(isActive ? null : c.key)}
          />
        );
      })}
    </KpiGrid>
  );
}
