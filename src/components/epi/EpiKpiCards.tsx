import { HardHat, Package, HandMetal } from "lucide-react";
import { Kpi, KpiGrid } from "@/components/ui/kpi";
import { STATUS_META } from "@/lib/status";

interface Props {
  totalEpis: number;
  lowStock: number;
  caWarning: number;
  caExpired: number;
  deliveriesThisMonth: number;
}

export function EpiKpiCards({ totalEpis, lowStock, caWarning, caExpired, deliveriesThisMonth }: Props) {
  const cards = [
    { label: "EPIs cadastrados", value: totalEpis, icon: HardHat, tone: "neutral" as const, href: "/epi/catalogo" },
    { label: "CA vencendo", value: caWarning, icon: STATUS_META.warning.icon, tone: STATUS_META.warning.tone, href: "/epi/catalogo" },
    { label: "CA vencido", value: caExpired, icon: STATUS_META.expired.icon, tone: STATUS_META.expired.tone, href: "/epi/catalogo" },
    { label: "Estoque baixo", value: lowStock, icon: Package, tone: lowStock > 0 ? ("warning" as const) : ("success" as const), href: "/epi/estoque" },
    { label: "Entregas no mês", value: deliveriesThisMonth, icon: HandMetal, tone: "primary" as const, href: "/epi/entregas" },
  ];

  return (
    <KpiGrid cols={5}>
      {cards.map((c) => (
        <Kpi key={c.label} label={c.label} value={c.value} icon={c.icon} tone={c.tone} href={c.href} />
      ))}
    </KpiGrid>
  );
}
