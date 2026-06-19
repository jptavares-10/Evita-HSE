import { AlertTriangle, Shield, Activity, CheckCircle2 } from "lucide-react";
import { getTypeInfo, getSeverityInfo } from "@/lib/occurrences";

interface Props {
  occurrences: any[];
  actions: any[];
}

export function OccurrenceKpiCards({ occurrences, actions }: Props) {
  const currentYear = new Date().getFullYear();
  const yearOccurrences = occurrences.filter((o) => new Date(o.occurred_at).getFullYear() === currentYear);

  const typeCounts: Record<string, number> = {};
  const severityCounts: Record<string, number> = {};
  for (const o of yearOccurrences) {
    typeCounts[o.type] = (typeCounts[o.type] || 0) + 1;
    severityCounts[o.severity] = (severityCounts[o.severity] || 0) + 1;
  }

  const openActions = actions.filter((a) => a.status !== "completed").length;
  const completedActions = actions.filter((a) => a.status === "completed").length;
  const totalActions = actions.length;
  const progressPct = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="lp-card rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold tabular-nums">{yearOccurrences.length}</p>
            <p className="text-xs text-muted-foreground">Ocorrências em {currentYear}</p>
          </div>
        </div>
      </div>

      <div className="lp-card rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-2">Por tipo</p>
        <div className="flex flex-wrap gap-1.5">
          {["incident", "near_miss", "non_conformity", "safety_observation"].map((t) => {
            const info = getTypeInfo(t);
            const count = typeCounts[t] || 0;
            if (count === 0) return null;
            return (
              <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${info.color}`}>
                {info.label}: {count}
              </span>
            );
          })}
          {yearOccurrences.length === 0 && <span className="text-xs text-muted-foreground">Nenhuma</span>}
        </div>
      </div>

      <div className="lp-card rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-2">Por gravidade</p>
        <div className="flex flex-wrap gap-1.5">
          {["low", "medium", "high", "critical"].map((s) => {
            const info = getSeverityInfo(s);
            const count = severityCounts[s] || 0;
            if (count === 0) return null;
            return (
              <span key={s} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${info.color}`}>
                {info.label}: {count}
              </span>
            );
          })}
          {yearOccurrences.length === 0 && <span className="text-xs text-muted-foreground">Nenhuma</span>}
        </div>
      </div>

      <div className="lp-card rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Ações corretivas</p>
            <p className="text-sm font-medium">{openActions} abertas / {completedActions} concluídas</p>
            <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
