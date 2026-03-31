import { addDays, differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const INSPECTION_FREQUENCY_PRESETS = {
  daily: { label: "Diária", days: 1 },
  weekly: { label: "Semanal", days: 7 },
  biweekly: { label: "Quinzenal", days: 14 },
  monthly: { label: "Mensal", days: 30 },
  quarterly: { label: "Trimestral", days: 90 },
  semiannual: { label: "Semestral", days: 180 },
  annual: { label: "Anual", days: 365 },
} as const;

export type InspectionFrequencyPreset = keyof typeof INSPECTION_FREQUENCY_PRESETS;

export function getInspectionFrequencyDays(type: string, preset: string | null, customDays: number | null): number {
  if (type === "custom" && customDays) return customDays;
  if (type === "fixed" && preset && preset in INSPECTION_FREQUENCY_PRESETS) {
    return INSPECTION_FREQUENCY_PRESETS[preset as InspectionFrequencyPreset].days;
  }
  return 7;
}

export function calculateInspectionNextDue(lastDoneAt: string | Date, frequencyDays: number): Date {
  const base = typeof lastDoneAt === "string" ? parseISO(lastDoneAt) : lastDoneAt;
  return addDays(base, frequencyDays);
}

export function getInspectionFrequencyLabel(type: string, preset: string | null, customDays: number | null): string {
  if (type === "fixed" && preset && preset in INSPECTION_FREQUENCY_PRESETS) {
    return INSPECTION_FREQUENCY_PRESETS[preset as InspectionFrequencyPreset].label;
  }
  if (type === "custom" && customDays) {
    return `A cada ${customDays} dias`;
  }
  return "—";
}

export type InspectionStatus = "ok" | "warning" | "expired";

export function getInspectionStatus(nextDueAt: string | null, alertDaysBefore: number): InspectionStatus | null {
  if (!nextDueAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = parseISO(nextDueAt);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) return "expired";
  const diff = differenceInDays(dueDate, today);
  if (diff <= alertDaysBefore) return "warning";
  return "ok";
}

export function getInspectionStatusInfo(nextDueAt: string | null, alertDaysBefore: number) {
  if (!nextDueAt) return { status: null, label: "Avulsa", color: "text-muted-foreground" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = parseISO(nextDueAt);
  dueDate.setHours(0, 0, 0, 0);
  const diff = differenceInDays(dueDate, today);
  const status = getInspectionStatus(nextDueAt, alertDaysBefore);

  if (status === "expired") {
    return { status, label: `Vencida há ${Math.abs(diff)} dia(s)`, color: "text-destructive" };
  }
  if (status === "warning") {
    return { status, label: `Vence em ${diff} dia(s)`, color: "text-yellow-600" };
  }
  return { status, label: "Em dia", color: "text-green-600" };
}

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export const RESULT_LABELS: Record<string, string> = {
  conforme: "Conforme",
  nao_conforme: "Não Conforme",
  parcial: "Parcialmente Conforme",
};

export const RESULT_COLORS: Record<string, string> = {
  conforme: "bg-green-100 text-green-700 border-green-200",
  nao_conforme: "bg-red-100 text-red-700 border-red-200",
  parcial: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export const ACTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  done: "Concluída",
};

export const ACTION_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  done: "bg-green-100 text-green-700 border-green-200",
};
