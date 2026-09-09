import { Users } from "lucide-react";
import { Kpi, KpiGrid } from "@/components/ui/kpi";
import { STATUS_META } from "@/lib/status";

interface Props {
  totalActive: number;
  employeesOk: number;
  employeesPending: number;
  warningCount: number;
  conformity: number;
  /** Active status filter, shared with the "Situação" select. */
  activeStatus?: string | null;
  onSelectStatus?: (status: string | null) => void;
}

export function TrainingKpiCards({
  totalActive,
  employeesOk,
  employeesPending,
  warningCount,
  conformity,
  activeStatus = null,
  onSelectStatus,
}: Props) {
  const cards = [
    { key: null, label: "Colaboradores ativos", value: totalActive, icon: Users, tone: "neutral" as const },
    { key: "ok", label: "Em dia", value: employeesOk, icon: STATUS_META.ok.icon, tone: STATUS_META.ok.tone },
    { key: "warning", label: "Vencendo", value: warningCount, icon: STATUS_META.warning.icon, tone: STATUS_META.warning.tone },
    { key: "expired", label: "Vencidos", value: employeesPending, icon: STATUS_META.expired.icon, tone: STATUS_META.expired.tone },
    { key: null, label: STATUS_META.conformity.label, value: `${conformity}%`, icon: STATUS_META.conformity.icon, tone: STATUS_META.conformity.tone },
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
          onClick={onSelectStatus ? () => onSelectStatus(c.key) : undefined}
        />
      ))}
    </KpiGrid>
  );
}
