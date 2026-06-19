import { Users, CheckCircle2, AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";

interface Props {
  totalEmployees: number;
  upToDate: number;
  expiringSoon: number;
  expired: number;
  conformity: number;
}

export function AsoKpiCards({ totalEmployees, upToDate, expiringSoon, expired, conformity }: Props) {
  const cards: { label: string; value: string | number; icon: any; tone: KpiTone }[] = [
    { label: "Colaboradores ativos", value: totalEmployees, icon: Users, tone: "neutral" },
    { label: "ASOs em dia", value: upToDate, icon: CheckCircle2, tone: "success" },
    { label: "Vencendo em breve", value: expiringSoon, icon: AlertTriangle, tone: "warning" },
    { label: "Vencidos", value: expired, icon: XCircle, tone: "danger" },
    { label: "Conformidade geral", value: `${conformity}%`, icon: TrendingUp, tone: "primary" },
  ];

  return (
    <KpiGrid cols={5}>
      {cards.map((c) => (
        <Kpi key={c.label} label={c.label} value={c.value} icon={c.icon} tone={c.tone} />
      ))}
    </KpiGrid>
  );
}
