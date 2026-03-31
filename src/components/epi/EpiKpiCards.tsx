import { HardHat, AlertTriangle, Package, HandMetal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  totalEpis: number;
  lowStock: number;
  caExpiring: number;
  deliveriesThisMonth: number;
}

export function EpiKpiCards({ totalEpis, lowStock, caExpiring, deliveriesThisMonth }: Props) {
  const cards = [
    { label: "EPIs Cadastrados", value: totalEpis, icon: HardHat, color: "text-primary" },
    { label: "Estoque Baixo", value: lowStock, icon: Package, color: lowStock > 0 ? "text-yellow-600" : "text-green-600" },
    { label: "CAs Vencendo/Vencidos", value: caExpiring, icon: AlertTriangle, color: caExpiring > 0 ? "text-destructive" : "text-green-600" },
    { label: "Entregas no Mês", value: deliveriesThisMonth, icon: HandMetal, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg bg-muted ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
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
