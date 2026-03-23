import { addDays, differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const FREQUENCY_PRESETS = {
  weekly: { label: "Semanal", days: 7 },
  monthly: { label: "Mensal", days: 30 },
  quarterly: { label: "Trimestral", days: 90 },
  semiannual: { label: "Semestral", days: 180 },
  annual: { label: "Anual", days: 365 },
} as const;

export type FrequencyPreset = keyof typeof FREQUENCY_PRESETS;

export function getFrequencyDays(type: string, preset: string | null, customDays: number | null): number {
  if (type === "custom" && customDays) return customDays;
  if (type === "fixed" && preset && preset in FREQUENCY_PRESETS) {
    return FREQUENCY_PRESETS[preset as FrequencyPreset].days;
  }
  return 30;
}

export function calculateNextDueAt(lastDoneAt: string | Date, frequencyDays: number): Date {
  const base = typeof lastDoneAt === "string" ? parseISO(lastDoneAt) : lastDoneAt;
  return addDays(base, frequencyDays);
}

export function getFrequencyLabel(type: string, preset: string | null, customDays: number | null): string {
  if (type === "fixed" && preset && preset in FREQUENCY_PRESETS) {
    return FREQUENCY_PRESETS[preset as FrequencyPreset].label;
  }
  if (type === "custom" && customDays) {
    return `A cada ${customDays} dias`;
  }
  return "—";
}

export type ServiceStatus = "ok" | "warning" | "expired";

export function getServiceStatus(nextDueAt: string, alertDaysBefore: number): ServiceStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = parseISO(nextDueAt);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) return "expired";
  const diff = differenceInDays(dueDate, today);
  if (diff <= alertDaysBefore) return "warning";
  return "ok";
}

export function getStatusInfo(nextDueAt: string, alertDaysBefore: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = parseISO(nextDueAt);
  dueDate.setHours(0, 0, 0, 0);
  const diff = differenceInDays(dueDate, today);
  const status = getServiceStatus(nextDueAt, alertDaysBefore);

  if (status === "expired") {
    return { status, label: `Vencido há ${Math.abs(diff)} dias`, color: "text-destructive" };
  }
  if (status === "warning") {
    return { status, label: `Vencendo em ${diff} dias`, color: "text-yellow-600" };
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

export const FILE_TYPE_LABELS: Record<string, string> = {
  certificate: "Certificado",
  evidence: "Evidência",
  license: "Licença",
  other: "Outro",
};

export const FILE_TYPE_BADGE_COLORS: Record<string, string> = {
  certificate: "bg-blue-100 text-blue-700 border-blue-200",
  evidence: "bg-yellow-100 text-yellow-700 border-yellow-200",
  license: "bg-green-100 text-green-700 border-green-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

export const PRESET_COLORS = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
];
