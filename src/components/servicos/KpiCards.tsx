import { CheckCircle2, AlertTriangle, XCircle, BarChart3, PowerOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

const cards = [
  { key: null, label: "Total", icon: BarChart3, bg: "bg-muted/50", text: "text-foreground", iconColor: "text-muted-foreground" },
  { key: "ok", label: "Em dia", icon: CheckCircle2, bg: "bg-green-50", text: "text-green-700", iconColor: "text-green-500" },
  { key: "warning", label: "Vencendo", icon: AlertTriangle, bg: "bg-yellow-50", text: "text-yellow-700", iconColor: "text-yellow-500" },
  { key: "expired", label: "Vencidos", icon: XCircle, bg: "bg-red-50", text: "text-red-700", iconColor: "text-red-500" },
] as const;

export function KpiCards({ total, ok, warning, expired, activeFilter, onFilterClick, inactiveCount = 0, showInactive, onToggleInactive }: KpiCardsProps) {
  const counts = { null: total, ok, warning, expired } as Record<string | "null", number>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const key = c.key as string | null;
          const count = counts[String(key)];
          const isActive = activeFilter === key;
          return (
            <button
              key={String(key)}
              onClick={() => onFilterClick(isActive ? null : key)}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-4 text-left transition-all hover:shadow-md active:scale-[0.98]",
                c.bg,
                isActive && "ring-2 ring-primary shadow-md"
              )}
            >
              <c.icon className={cn("h-8 w-8 flex-shrink-0", c.iconColor)} />
              <div>
                <p className={cn("text-2xl font-bold tabular-nums", c.text)}>{count}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </button>
          );
        })}
      </div>
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
