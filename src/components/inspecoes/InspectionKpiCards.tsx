import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, AlertTriangle, XCircle, Wrench } from "lucide-react";

interface InspectionKpiCardsProps {
  inspections: any[];
  executions: any[];
  pendingActions: number;
  onFilter: (filter: string) => void;
  activeFilter: string;
}

export function InspectionKpiCards({ inspections, executions, pendingActions, onFilter, activeFilter }: InspectionKpiCardsProps) {
  const totalActive = inspections.filter((i) => i.status === "active").length;

  const expired = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inspections.filter((i: any) => {
      if (!i.next_due_at || i.status !== "active") return false;
      return new Date(i.next_due_at) < today;
    }).length;
  }, [inspections]);

  const nonConformWeek = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    return executions.filter((e: any) => {
      const d = new Date(e.executed_at);
      return d >= startOfWeek && (e.result === "nao_conforme" || e.result === "parcial");
    }).length;
  }, [executions]);

  const cards = [
    { key: "all", label: "Inspeções ativas", value: totalActive, icon: ClipboardCheck, color: "text-blue-600" },
    { key: "expired", label: "Vencidas", value: expired, icon: AlertTriangle, color: "text-destructive" },
    { key: "nao_conforme", label: "NC na semana", value: nonConformWeek, icon: XCircle, color: "text-yellow-600" },
    { key: "actions", label: "Ações pendentes", value: pendingActions, icon: Wrench, color: "text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card
          key={c.key}
          className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === c.key ? "ring-2 ring-primary" : ""}`}
          onClick={() => onFilter(activeFilter === c.key ? "all" : c.key)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <c.icon className={`h-8 w-8 ${c.color}`} />
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
