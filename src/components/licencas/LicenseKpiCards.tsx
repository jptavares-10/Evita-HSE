import { BarChart3, CheckCircle2, AlertTriangle, XCircle, Shield } from "lucide-react";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";

interface LicenseKpiCardsProps {
  total: number;
  active: number;
  expiring: number;
  expired: number;
  permanent: number;
  activeFilter: string | null;
  onFilterClick: (status: string | null) => void;
}

const cards: { key: string | null; label: string; icon: any; tone: KpiTone }[] = [
  { key: null, label: "Total", icon: BarChart3, tone: "neutral" },
  { key: "active", label: "Vigentes", icon: CheckCircle2, tone: "success" },
  { key: "expiring", label: "Vencendo", icon: AlertTriangle, tone: "warning" },
  { key: "expired", label: "Vencidas", icon: XCircle, tone: "danger" },
  { key: "permanent", label: "Permanentes", icon: Shield, tone: "info" },
];

export function LicenseKpiCards({ total, active, expiring, expired, permanent, activeFilter, onFilterClick }: LicenseKpiCardsProps) {
  const counts: Record<string, number> = { null: total, active, expiring, expired, permanent };

  return (
    <KpiGrid cols={5}>
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
  );
}
