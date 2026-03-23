import { FileText, Clock, AlertTriangle, XCircle } from "lucide-react";
import { getCdfDisplayStatus } from "@/lib/mtr";

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
    { key: null, label: "Total de MTRs", value: total, icon: FileText, bg: "bg-card" },
    { key: "pending", label: "CDF Pendentes", value: pending, icon: Clock, bg: "bg-blue-50" },
    { key: "warning", label: "CDF em Alerta", value: warning, icon: AlertTriangle, bg: "bg-yellow-50" },
    { key: "overdue", label: "CDF Vencidos", value: overdue, icon: XCircle, bg: "bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <button
          key={c.label}
          onClick={() => onFilter(activeFilter === c.key ? null : c.key)}
          className={`${c.bg} border rounded-lg p-4 text-left transition-all hover:shadow-sm ${activeFilter === c.key ? "ring-2 ring-primary" : ""}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <c.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{c.value}</p>
        </button>
      ))}
    </div>
  );
}
