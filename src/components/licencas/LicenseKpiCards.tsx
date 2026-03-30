import { BarChart3, CheckCircle2, AlertTriangle, XCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LicenseKpiCardsProps {
  total: number;
  active: number;
  expiring: number;
  expired: number;
  permanent: number;
  activeFilter: string | null;
  onFilterClick: (status: string | null) => void;
}

const cards = [
  { key: null, label: "Total", icon: BarChart3, bg: "bg-muted/50", text: "text-foreground", iconColor: "text-muted-foreground" },
  { key: "active", label: "Vigentes", icon: CheckCircle2, bg: "bg-green-50", text: "text-green-700", iconColor: "text-green-500" },
  { key: "expiring", label: "Vencendo", icon: AlertTriangle, bg: "bg-yellow-50", text: "text-yellow-700", iconColor: "text-yellow-500" },
  { key: "expired", label: "Vencidas", icon: XCircle, bg: "bg-red-50", text: "text-red-700", iconColor: "text-red-500" },
  { key: "permanent", label: "Permanentes", icon: Shield, bg: "bg-blue-50", text: "text-blue-700", iconColor: "text-blue-500" },
] as const;

export function LicenseKpiCards({ total, active, expiring, expired, permanent, activeFilter, onFilterClick }: LicenseKpiCardsProps) {
  const counts: Record<string, number> = { null: total, active, expiring, expired, permanent };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
  );
}
