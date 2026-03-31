import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, RefreshCw, Archive, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRevisionCycleStatus } from "@/lib/documents";

interface Props {
  total: number;
  active: number;
  underReview: number;
  obsolete: number;
  revisionOverdue: number;
  activeFilter: string | null;
  onFilterClick: (status: string | null) => void;
}

export function DocumentKpiCards({ total, active, underReview, obsolete, revisionOverdue, activeFilter, onFilterClick }: Props) {
  const cards = [
    { label: "Total", value: total, icon: FileText, color: "text-primary", filter: null },
    { label: "Vigentes", value: active, icon: CheckCircle, color: "text-green-600", filter: "active" },
    { label: "Em revisão", value: underReview, icon: RefreshCw, color: "text-yellow-600", filter: "under_review" },
    { label: "Obsoletos", value: obsolete, icon: Archive, color: "text-gray-500", filter: "obsolete" },
    { label: "Revisão atrasada", value: revisionOverdue, icon: AlertTriangle, color: "text-red-600", filter: "revision_overdue" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c) => (
        <Card
          key={c.label}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            activeFilter === c.filter && "ring-2 ring-primary"
          )}
          onClick={() => onFilterClick(activeFilter === c.filter ? null : c.filter)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <c.icon className={cn("h-8 w-8", c.color)} />
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
