import { Card, CardContent } from "@/components/ui/card";
import { Clock, PlayCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  pendingToday: number;
  inProgress: number;
  overdue: number;
  completedThisWeek: number;
  activeFilter: string | null;
  onFilterClick: (filter: string | null) => void;
}

const cards = [
  { key: "pending_today", label: "Pendentes hoje", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  { key: "in_progress", label: "Em andamento", icon: PlayCircle, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { key: "overdue", label: "Vencidas", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
  { key: "completed_week", label: "Concluídas esta semana", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
];

export function InspectionKpiCards({ pendingToday, inProgress, overdue, completedThisWeek, activeFilter, onFilterClick }: Props) {
  const values: Record<string, number> = {
    pending_today: pendingToday,
    in_progress: inProgress,
    overdue: overdue,
    completed_week: completedThisWeek,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => {
        const isActive = activeFilter === c.key;
        return (
          <Card
            key={c.key}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md border",
              isActive ? `${c.bg} ring-2 ring-offset-1` : ""
            )}
            onClick={() => onFilterClick(isActive ? null : c.key)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <c.icon className={cn("h-4 w-4", c.color)} />
                <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
              </div>
              <p className={cn("text-2xl font-bold tabular-nums", c.color)}>{values[c.key]}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
