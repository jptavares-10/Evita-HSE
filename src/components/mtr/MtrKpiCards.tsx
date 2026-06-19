import { FileText, Clock, AlertTriangle, XCircle } from "lucide-react";
import { getCdfDisplayStatus } from "@/lib/mtr";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";

interface Props {
  mtrs: any[];
  activeFilter: string | null;
  onFilter: (filter: string | null) => void;
}

export function MtrKpiCards({ mtrs, activeFilter, onFilter }: Props) {
  const total = mtrs.length;
  const statuses = mtrs.map((m) => getCdfDisplayStatus(m.cdf_status, m.alert_at, m.cdf_deadline_at));
  const pending = statuses.filter((s) => s === "pending" || s === "warning").length;
  const warning = statuses.filter((s) => s === "warning").length;
  const overdue = statuses.filter((s) => s === "overdue").length;

  const cards = [
    { key: null as string | null, label: "Total de MTRs", value: total, icon: FileText, tone: "neutral" as KpiTone },
    { key: "pending", label: "CDF Pendentes", value: pending, icon: Clock, tone: "info" as KpiTone },
    { key: "warning", label: "CDF em Alerta", value: warning, icon: AlertTriangle, tone: "warning" as KpiTone },
    { key: "overdue", label: "CDF Vencidos", value: overdue, icon: XCircle, tone: "danger" as KpiTone },
  ];

  return (
    <KpiGrid cols={4}>
      {cards.map((c) => (
        <Kpi
          key={c.label}
          label={c.label}
          value={c.value}
          icon={c.icon}
          tone={c.tone}
          active={activeFilter === c.key}
          onClick={() => onFilter(activeFilter === c.key ? null : c.key)}
        />
      ))}
    </KpiGrid>
  );
}
