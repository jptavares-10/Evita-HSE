import { addMonths, differenceInDays, format, parseISO, subDays } from "date-fns";

export type DeadlineType = "single" | "recurring" | "continuous" | "license_linked";
export type Recurrence = "monthly" | "bimonthly" | "quarterly" | "semiannual" | "annual";
export type Criticality = "baixa" | "media" | "alta";
export type ConditionantStatus = "pending" | "in_progress" | "fulfilled" | "not_applicable";
export type EffectiveStatus =
  | "on_track"
  | "expiring"
  | "overdue"
  | "fulfilled"
  | "continuous"
  | "not_applicable";

export const DEADLINE_TYPES: { value: DeadlineType; label: string; hint: string }[] = [
  { value: "single", label: "Data única", hint: "Cumprir até uma data específica." },
  { value: "recurring", label: "Recorrente", hint: "Gera novo vencimento a cada cumprimento." },
  { value: "continuous", label: "Contínua", hint: "Obrigação permanente, sem data fixa." },
  { value: "license_linked", label: "Vinculada à licença", hint: "X dias antes do vencimento da licença." },
];

export const RECURRENCES: { value: Recurrence; label: string; months: number }[] = [
  { value: "monthly", label: "Mensal", months: 1 },
  { value: "bimonthly", label: "Bimestral", months: 2 },
  { value: "quarterly", label: "Trimestral", months: 3 },
  { value: "semiannual", label: "Semestral", months: 6 },
  { value: "annual", label: "Anual", months: 12 },
];

export const CRITICALITIES: { value: Criticality; label: string; className: string }[] = [
  { value: "baixa", label: "Baixa", className: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "media", label: "Média", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "alta", label: "Alta", className: "bg-red-100 text-red-700 border-red-200" },
];

export const STATUS_OPTIONS: { value: ConditionantStatus; label: string }[] = [
  { value: "pending", label: "Pendente" },
  { value: "in_progress", label: "Em andamento" },
  { value: "fulfilled", label: "Cumprida" },
  { value: "not_applicable", label: "Não aplicável" },
];

export const EFFECTIVE_STATUS_META: Record<EffectiveStatus, { label: string; className: string }> = {
  on_track: { label: "Em dia", className: "bg-green-100 text-green-700 border-green-200" },
  expiring: { label: "Vencendo", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  overdue: { label: "Atrasada", className: "bg-red-100 text-red-700 border-red-200" },
  fulfilled: { label: "Cumprida", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  continuous: { label: "Contínua", className: "bg-blue-100 text-blue-700 border-blue-200" },
  not_applicable: { label: "Não aplicável", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

export const PROTOCOL_CHANNELS = ["Sistema do órgão", "E-mail", "Protocolo físico", "Correios", "Outro"];

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Resolves the date a conditionant is actually due, considering license-linked deadlines. */
export function resolveDueDate(
  deadlineType: string,
  dueDate: string | null,
  daysBeforeLicenseExpiry: number | null,
  licenseExpiresAt: string | null | undefined,
): string | null {
  if (deadlineType === "continuous") return null;
  if (deadlineType === "license_linked") {
    if (!licenseExpiresAt) return null;
    const base = parseISO(licenseExpiresAt);
    return format(subDays(base, daysBeforeLicenseExpiry ?? 0), "yyyy-MM-dd");
  }
  return dueDate;
}

export function computeEffectiveStatus(
  status: string,
  deadlineType: string,
  resolvedDueDate: string | null,
  alertDaysBefore: number,
): EffectiveStatus {
  if (status === "not_applicable") return "not_applicable";
  if (status === "fulfilled") return "fulfilled";
  if (deadlineType === "continuous") return "continuous";
  if (!resolvedDueDate) return "on_track";
  const diff = differenceInDays(parseISO(resolvedDueDate), today());
  if (diff < 0) return "overdue";
  if (diff <= (alertDaysBefore ?? 30)) return "expiring";
  return "on_track";
}

export function daysRemainingLabel(resolvedDueDate: string | null, alertDaysBefore: number): { label: string; color: string } {
  if (!resolvedDueDate) return { label: "—", color: "text-muted-foreground" };
  const diff = differenceInDays(parseISO(resolvedDueDate), today());
  if (diff < 0) return { label: `Atrasada há ${Math.abs(diff)} d`, color: "text-destructive" };
  if (diff <= (alertDaysBefore ?? 30)) return { label: `${diff} dias`, color: "text-yellow-600" };
  return { label: `${diff} dias`, color: "text-green-600" };
}

/** Next due date after a fulfillment, for recurring conditionants. */
export function nextRecurringDueDate(fulfilledAt: string, recurrence: string | null): string | null {
  const months = RECURRENCES.find((r) => r.value === recurrence)?.months;
  if (!months) return null;
  return format(addMonths(parseISO(fulfilledAt), months), "yyyy-MM-dd");
}

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy");
  } catch {
    return "—";
  }
}

export function deadlineTypeLabel(t: string, recurrence?: string | null, days?: number | null): string {
  if (t === "recurring") {
    const r = RECURRENCES.find((x) => x.value === recurrence)?.label;
    return r ? `Recorrente (${r.toLowerCase()})` : "Recorrente";
  }
  if (t === "license_linked") return `${days ?? 0} d antes da licença`;
  return DEADLINE_TYPES.find((x) => x.value === t)?.label ?? t;
}

export const EVIDENCE_ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export const EVIDENCE_MAX_SIZE = 20 * 1024 * 1024;