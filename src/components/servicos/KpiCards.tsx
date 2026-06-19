import { CheckCircle2, AlertTriangle, XCircle, BarChart3, PowerOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";

interface KpiCardsProps {
  total: number;
  ok: number;
  warning: number;
  expired: number;
  activeFilter: string | null;
  onFilterClick: (status: string | null) => void;
  inactiveCount?: number;
  showInactive?: boolean;
  onToggleInactive?: () => void;
}

const cards: { key: string | null; label: string; icon: any; tone: KpiTone }[] = [
  { key: null, label: "Total", icon: BarChart3, tone: "neutral" },
  { key: "ok", label: "Em dia", icon: CheckCircle2, tone: "success" },
  { key: "warning", label: "Vencendo", icon: AlertTriangle, tone: "warning" },
  { key: "expired", label: "Vencidos", icon: XCircle, tone: "danger" },
];

export function KpiCards({ total, ok, warning, expired, activeFilter, onFilterClick, inactiveCount = 0, showInactive, onToggleInactive }: KpiCardsProps) {
  const counts = { null: total, ok, warning, expired } as Record<string | "null", number>;

  return (
    <div className="space-y-3">
      <KpiGrid cols={4}>
        {cards.map((c) => {
          const isActive = activeFilter === c.key;
          return (
            <Kpi
              key={String(c.key)}
              label={c.label}
              value={counts[String(c.key)]}
              icon={c.icon}
              tone={c.tone}
              active={isActive}
              onClick={() => onFilterClick(isActive ? null : c.key)}
            />
          );
        })}
      </KpiGrid>
      {inactiveCount > 0 && onToggleInactive && (
        <div className="flex items-center gap-2">
          <Switch id="show-inactive" checked={showInactive} onCheckedChange={onToggleInactive} />
          <Label htmlFor="show-inactive" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5">
            <PowerOff className="h-3.5 w-3.5" />
            Mostrar {inactiveCount} serviço{inactiveCount > 1 ? "s" : ""} inativo{inactiveCount > 1 ? "s" : ""}
          </Label>
        </div>
      )}
    </div>
  );
}
