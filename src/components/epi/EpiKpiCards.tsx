import { HardHat, AlertTriangle, Package, HandMetal } from "lucide-react";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";

interface Props {
  totalEpis: number;
  lowStock: number;
  caExpiring: number;
  deliveriesThisMonth: number;
}

export function EpiKpiCards({ totalEpis, lowStock, caExpiring, deliveriesThisMonth }: Props) {
  const cards: { label: string; value: number; icon: any; tone: KpiTone }[] = [
    { label: "EPIs Cadastrados", value: totalEpis, icon: HardHat, tone: "primary" },
    { label: "Estoque Baixo", value: lowStock, icon: Package, tone: lowStock > 0 ? "warning" : "success" },
    { label: "CAs Vencendo/Vencidos", value: caExpiring, icon: AlertTriangle, tone: caExpiring > 0 ? "danger" : "success" },
    { label: "Entregas no Mês", value: deliveriesThisMonth, icon: HandMetal, tone: "primary" },
  ];

  return (
    <KpiGrid cols={4}>
      {cards.map((c) => (
        <Kpi key={c.label} label={c.label} value={c.value} icon={c.icon} tone={c.tone} />
      ))}
    </KpiGrid>
  );
}
