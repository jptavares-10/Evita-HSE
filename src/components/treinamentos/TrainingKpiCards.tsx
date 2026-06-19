import { Users, CheckCircle2, AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";

interface Props {
  totalActive: number;
  employeesOk: number;
  employeesPending: number;
  warningCount: number;
  conformity: number;
}

export function TrainingKpiCards({ totalActive, employeesOk, employeesPending, warningCount, conformity }: Props) {
  const cards: { label: string; value: string | number; icon: any; tone: KpiTone }[] = [
    { label: "Colaboradores ativos", value: totalActive, icon: Users, tone: "neutral" },
    { label: "100% em dia", value: employeesOk, icon: CheckCircle2, tone: "success" },
    { label: "Com pendências", value: employeesPending, icon: XCircle, tone: "danger" },
    { label: "Vencendo em breve", value: warningCount, icon: AlertTriangle, tone: "warning" },
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
