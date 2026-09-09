import { useMemo } from "react";
import { Users, FileText, AlertTriangle } from "lucide-react";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";

interface Props {
  suppliers: any[];
  docCounts?: Record<string, number>;
  /** Active status filter, shared with the "Situação" select. */
  activeStatus?: string | null;
  onSelectStatus?: (status: string | null) => void;
}

export function SupplierKpiCards({ suppliers, docCounts = {}, activeStatus = null, onSelectStatus }: Props) {
  const stats = useMemo(() => {
    const active = suppliers.filter((s: any) => s.status === "active");
    const activeCount = active.length;
    const totalDocs = Object.values(docCounts).reduce((sum, c) => sum + c, 0);
    const withoutDocs = active.filter((s: any) => !docCounts[s.id]).length;
    return { activeCount, totalDocs, withoutDocs };
  }, [suppliers, docCounts]);

  const cards: { key: string | null; label: string; value: number; icon: any; tone: KpiTone }[] = [
    { key: null, label: "Total de fornecedores", value: suppliers.length, icon: Users, tone: "neutral" },
    { key: "active", label: "Fornecedores ativos", value: stats.activeCount, icon: Users, tone: "primary" },
    { key: "inactive", label: "Inativos", value: suppliers.length - stats.activeCount, icon: Users, tone: "neutral" },
    { key: null, label: "Documentos recebidos", value: stats.totalDocs, icon: FileText, tone: "primary" },
    { key: null, label: "Sem documentos", value: stats.withoutDocs, icon: AlertTriangle, tone: stats.withoutDocs > 0 ? "warning" : "neutral" },
  ];

  return (
    <KpiGrid cols={5}>
      {cards.map((c) => (
        <Kpi
          key={c.label}
          label={c.label}
          value={c.value}
          icon={c.icon}
          tone={c.tone}
          active={c.key !== null && activeStatus === c.key}
          onClick={onSelectStatus && c.key !== null ? () => onSelectStatus(activeStatus === c.key ? null : c.key) : undefined}
        />
      ))}
    </KpiGrid>
  );
}
