import { addMonths, differenceInDays, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type TrainingRecordStatus = "ok" | "warning" | "expired" | "missing";

export function getRecordStatus(expiresAt: string, alertDaysBefore: number, hasExpiry: boolean = true): TrainingRecordStatus {
  if (!hasExpiry) return "ok";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = parseISO(expiresAt);
  exp.setHours(0, 0, 0, 0);

  if (exp < today) return "expired";
  const diff = differenceInDays(exp, today);
  if (diff <= alertDaysBefore) return "warning";
  return "ok";
}

export function getRecordStatusInfo(expiresAt: string, alertDaysBefore: number, hasExpiry: boolean = true) {
  if (!hasExpiry) {
    return { status: "ok" as const, label: "Sem vencimento", color: "text-blue-600", badgeClass: "bg-blue-100 text-blue-700 border-blue-200" };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = parseISO(expiresAt);
  exp.setHours(0, 0, 0, 0);
  const diff = differenceInDays(exp, today);
  const status = getRecordStatus(expiresAt, alertDaysBefore, hasExpiry);

  if (status === "expired") {
    return { status, label: `Vencido há ${Math.abs(diff)} dias`, color: "text-destructive", badgeClass: "bg-red-100 text-red-700 border-red-200" };
  }
  if (status === "warning") {
    return { status, label: `Vence em ${diff} dias`, color: "text-yellow-600", badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  }
  return { status, label: "Em dia", color: "text-green-600", badgeClass: "bg-green-100 text-green-700 border-green-200" };
}

export const MISSING_STATUS_INFO = {
  status: "missing" as const,
  label: "Não realizado",
  color: "text-muted-foreground",
  badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
};

export const NO_EXPIRY_STATUS_INFO = {
  status: "ok" as const,
  label: "Sem vencimento",
  color: "text-blue-600",
  badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
};

export function calculateExpiresAt(doneAt: string | Date, validityMonths: number): Date {
  const base = typeof doneAt === "string" ? parseISO(doneAt) : doneAt;
  return addMonths(base, validityMonths);
}

export function formatValidityLabel(months: number | null, hasExpiry: boolean = true): string {
  if (!hasExpiry || months === null) return "Sem vencimento";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years > 0 && rem > 0) return `${years} ano${years > 1 ? "s" : ""} e ${rem} ${rem > 1 ? "meses" : "mês"}`;
  if (years > 0) return `${years} ano${years > 1 ? "s" : ""}`;
  return `${months} ${months > 1 ? "meses" : "mês"}`;
}

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
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}

// Compute compliance for a single employee
export interface EmployeeCompliance {
  required: number;
  fulfilled: number;
  pending: number;
  isCompliant: boolean;
}

/**
 * Compute compliance for a single employee.
 * trainingsMap is optional — when provided, we check has_expiry to treat no-expiry trainings as always ok.
 */
export function computeEmployeeCompliance(
  requiredTrainingIds: string[],
  records: Array<{ training_id: string; expires_at: string }>,
  alertDaysBefore: number = 30,
  trainingsMap?: Map<string, { has_expiry: boolean; alert_days_before: number }>
): EmployeeCompliance {
  const required = requiredTrainingIds.length;
  if (required === 0) return { required: 0, fulfilled: 0, pending: 0, isCompliant: true };

  let fulfilled = 0;
  for (const tid of requiredTrainingIds) {
    const latestRecord = records
      .filter((r) => r.training_id === tid)
      .sort((a, b) => b.expires_at.localeCompare(a.expires_at))[0];
    if (!latestRecord) continue; // missing

    const tInfo = trainingsMap?.get(tid);
    const hasExpiry = tInfo?.has_expiry ?? true;
    const alertDays = tInfo?.alert_days_before ?? alertDaysBefore;

    if (!hasExpiry) {
      // No expiry → always ok if record exists
      fulfilled++;
    } else if (getRecordStatus(latestRecord.expires_at, alertDays, true) === "ok") {
      fulfilled++;
    }
  }
  return { required, fulfilled, pending: required - fulfilled, isCompliant: fulfilled === required };
}
