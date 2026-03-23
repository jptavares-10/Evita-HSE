import { Users, CheckCircle2, AlertTriangle, XCircle, TrendingUp } from "lucide-react";

interface Props {
  totalActive: number;
  employeesOk: number;
  employeesPending: number;
  warningCount: number;
  conformity: number;
}

export function TrainingKpiCards({ totalActive, employeesOk, employeesPending, warningCount, conformity }: Props) {
  const cards = [
    { label: "Colaboradores ativos", value: totalActive, icon: Users, bg: "bg-card" },
    { label: "100% em dia", value: employeesOk, icon: CheckCircle2, bg: "bg-green-50" },
    { label: "Com pendências", value: employeesPending, icon: XCircle, bg: "bg-red-50" },
    { label: "Vencendo em breve", value: warningCount, icon: AlertTriangle, bg: "bg-yellow-50" },
    { label: "Conformidade geral", value: `${conformity}%`, icon: TrendingUp, bg: "bg-blue-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`${c.bg} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <c.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
