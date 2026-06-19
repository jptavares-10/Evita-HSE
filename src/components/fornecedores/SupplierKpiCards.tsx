import { useMemo } from "react";
import { Users, FileText, AlertTriangle } from "lucide-react";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";

interface Props {
  suppliers: any[];
  docCounts?: Record<string, number>;
}

export function SupplierKpiCards({ suppliers, docCounts = {} }: Props) {
  const stats = useMemo(() => {
    const active = suppliers.filter((s: any) => s.status === "active");
    const activeCount = active.length;
    const totalDocs = Object.values(docCounts).reduce((sum, c) => sum + c, 0);
    const withoutDocs = active.filter((s: any) => !docCounts[s.id]).length;
    return { activeCount, totalDocs, withoutDocs };
  }, [suppliers, docCounts]);

  const cards: { label: string; value: number; icon: any; tone: KpiTone }[] = [
    { label: "Fornecedores ativos", value: stats.activeCount, icon: Users, tone: "primary" },
    { label: "Documentos recebidos", value: stats.totalDocs, icon: FileText, tone: "primary" },
    { label: "Sem documentos", value: stats.withoutDocs, icon: AlertTriangle, tone: stats.withoutDocs > 0 ? "warning" : "neutral" },
  ];

  return (
    <KpiGrid cols={3}>
      {cards.map((c) => (
        <Kpi key={c.label} label={c.label} value={c.value} icon={c.icon} tone={c.tone} />
      ))}
    </KpiGrid>
  );
}
