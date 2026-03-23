import { useMemo } from "react";
import { Users, FileText, AlertTriangle } from "lucide-react";

interface Props {
  suppliers: any[];
}

export function SupplierKpiCards({ suppliers }: Props) {
  const stats = useMemo(() => {
    const active = suppliers.filter((s: any) => s.status === "active").length;
    return { total: active };
  }, [suppliers]);

  const cards = [
    { label: "Fornecedores ativos", value: stats.total, icon: Users, color: "text-primary" },
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
