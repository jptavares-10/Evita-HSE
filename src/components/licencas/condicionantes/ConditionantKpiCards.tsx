import { ClipboardList, CheckCircle2, AlertTriangle, XCircle, Infinity as InfinityIcon, ShieldCheck } from "lucide-react";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";
import type { EffectiveStatus } from "@/lib/conditionants";

interface Props {
  counts: Record<EffectiveStatus, number>;
  total: number;
  conformity: number;
  activeFilter: string | null;
  onFilterClick: (status: string | null) => void;
}

const cards: { key: string | null; label: string; icon: any; tone: KpiTone }[] = [
  { key: null, label: "Total", icon: ClipboardList, tone: "neutral" },
  { key: "on_track", label: "Em dia", icon: CheckCircle2, tone: "success" },
  { key: "expiring", label: "Vencendo", icon: AlertTriangle, tone: "warning" },
  { key: "overdue", label: "Atrasadas", icon: XCircle, tone: "danger" },
  { key: "fulfilled", label: "Cumpridas", icon: ShieldCheck, tone: "primary" },
  { key: "continuous", label: "Contínuas", icon: InfinityIcon, tone: "info" },
];

export function ConditionantKpiCards({ counts, total, conformity, activeFilter, onFilterClick }: Props) {
  return (
    <div className="space-y-3">
      <KpiGrid cols={3} className="lg:grid-cols-6">
        {cards.map((c) => {
          const isActive = activeFilter === c.key;
          const value = c.key === null ? total : counts[c.key as EffectiveStatus] ?? 0;
          return (
            <Kpi
              key={String(c.key)}
              label={c.label}
              value={value}
              icon={c.icon}
              tone={c.tone}
              active={isActive}
              onClick={() => onFilterClick(isActive ? null : c.key)}
            />
          );
        })}
      </KpiGrid>

      <div className="lp-card rounded-xl px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Conformidade das condicionantes</span>
          <span className="font-semibold tabular-nums">{conformity}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${conformity >= 80 ? "bg-success" : conformity >= 50 ? "bg-warning" : "bg-destructive"}`}
            style={{ width: `${conformity}%` }}
          />
        </div>
      </div>
    </div>
  );
}