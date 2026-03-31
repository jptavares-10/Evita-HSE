import { useMemo } from "react";
import { Users, FileText, AlertTriangle } from "lucide-react";

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

  const cards = [
    { label: "Fornecedores ativos", value: stats.activeCount, icon: Users, color: "text-primary" },
    { label: "Documentos recebidos", value: stats.totalDocs, icon: FileText, color: "text-primary" },
    { label: "Sem documentos", value: stats.withoutDocs, icon: AlertTriangle, color: "text-yellow-600" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-muted">
            <c.icon className={`h-5 w-5 ${c.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
