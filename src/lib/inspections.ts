import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const FREQUENCY_TYPES = {
  daily: { label: "Diária", days: 1 },
  weekly: { label: "Semanal", days: 7 },
  biweekly: { label: "Quinzenal", days: 14 },
  monthly: { label: "Mensal", days: 30 },
  custom: { label: "Personalizada", days: 0 },
} as const;

export type FrequencyType = keyof typeof FREQUENCY_TYPES;

export function getFrequencyDays(type: string, customDays: number | null): number {
  if (type === "custom" && customDays) return customDays;
  if (type in FREQUENCY_TYPES) return FREQUENCY_TYPES[type as FrequencyType].days;
  return 1;
}

export function getFrequencyLabel(type: string, customDays: number | null): string {
  if (type === "custom" && customDays) return `A cada ${customDays} dias`;
  if (type in FREQUENCY_TYPES) return FREQUENCY_TYPES[type as FrequencyType].label;
  return "—";
}

export type ExecutionStatus = "pending" | "in_progress" | "completed" | "completed_with_issues" | "overdue";

export function getExecutionDisplayStatus(status: string, dueDate: string): ExecutionStatus {
  if (status === "completed" || status === "completed_with_issues") return status as ExecutionStatus;
  if (status === "in_progress") return "in_progress";
  // pending — check if overdue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseISO(dueDate);
  due.setHours(0, 0, 0, 0);
  if (due < today) return "overdue";
  return "pending";
}

export const STATUS_CONFIG: Record<ExecutionStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pendente", color: "text-gray-700", bgColor: "bg-gray-100 border-gray-200" },
  in_progress: { label: "Em andamento", color: "text-blue-700", bgColor: "bg-blue-100 border-blue-200" },
  overdue: { label: "Vencida", color: "text-red-700", bgColor: "bg-red-100 border-red-200" },
  completed: { label: "Concluída", color: "text-green-700", bgColor: "bg-green-100 border-green-200" },
  completed_with_issues: { label: "Concluída c/ pendências", color: "text-yellow-700", bgColor: "bg-yellow-100 border-yellow-200" },
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: "Baixa", color: "text-gray-600", bgColor: "bg-gray-100 border-gray-200" },
  medium: { label: "Média", color: "text-blue-600", bgColor: "bg-blue-100 border-blue-200" },
  high: { label: "Alta", color: "text-orange-600", bgColor: "bg-orange-100 border-orange-200" },
  critical: { label: "Crítica", color: "text-red-600", bgColor: "bg-red-100 border-red-200" },
};

export const ACTION_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  open: { label: "Aberta", color: "text-red-700", bgColor: "bg-red-100 border-red-200" },
  in_progress: { label: "Em execução", color: "text-blue-700", bgColor: "bg-blue-100 border-blue-200" },
  completed: { label: "Concluída", color: "text-green-700", bgColor: "bg-green-100 border-green-200" },
};

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function formatDateTimeBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}
