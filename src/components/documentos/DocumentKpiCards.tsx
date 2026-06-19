import { FileText, CheckCircle, RefreshCw, Archive, AlertTriangle } from "lucide-react";
import { Kpi, KpiGrid, KpiTone } from "@/components/ui/kpi";

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
  const cards: { label: string; value: number; icon: any; tone: KpiTone; filter: string | null }[] = [
    { label: "Total", value: total, icon: FileText, tone: "neutral", filter: null },
    { label: "Vigentes", value: active, icon: CheckCircle, tone: "success", filter: "active" },
    { label: "Em revisão", value: underReview, icon: RefreshCw, tone: "warning", filter: "under_review" },
    { label: "Obsoletos", value: obsolete, icon: Archive, tone: "neutral", filter: "obsolete" },
    { label: "Revisão atrasada", value: revisionOverdue, icon: AlertTriangle, tone: "danger", filter: "revision_overdue" },
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
          active={activeFilter === c.filter}
          onClick={() => onFilterClick(activeFilter === c.filter ? null : c.filter)}
        />
      ))}
    </KpiGrid>
  );
}
