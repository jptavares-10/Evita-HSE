import { differenceInDays, differenceInMonths, differenceInYears, parseISO, format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export type LicenseStatus = "active" | "expiring" | "expired" | "in_renewal" | "permanent";

export function computeLicenseStatus(
  hasExpiry: boolean,
  expiresAt: string | null,
  alertDaysBefore: number,
  manualStatus: string
): LicenseStatus {
  if (manualStatus === "in_renewal") return "in_renewal";
  if (!hasExpiry) return "permanent";
  if (!expiresAt) return "active";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = parseISO(expiresAt);
  expDate.setHours(0, 0, 0, 0);

  if (expDate < today) return "expired";
  const diff = differenceInDays(expDate, today);
  if (diff <= alertDaysBefore) return "expiring";
  return "active";
}

export function getDaysRemainingInfo(
  hasExpiry: boolean,
  expiresAt: string | null,
  alertDaysBefore: number,
  manualStatus: string
): { label: string; color: string } {
  const status = computeLicenseStatus(hasExpiry, expiresAt, alertDaysBefore, manualStatus);

  if (status === "permanent") return { label: "Permanente", color: "text-blue-600" };
  if (status === "in_renewal") return { label: "Em renovação", color: "text-orange-600" };
  if (!expiresAt) return { label: "—", color: "text-muted-foreground" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = parseISO(expiresAt);
  expDate.setHours(0, 0, 0, 0);
  const diff = differenceInDays(expDate, today);

  if (diff < 0) return { label: `Vencida há ${Math.abs(diff)} dias`, color: "text-destructive" };
  if (diff <= alertDaysBefore) return { label: `${diff} dias`, color: "text-yellow-600" };
  return { label: `${diff} dias`, color: "text-green-600" };
}

export function getStatusBadgeInfo(status: LicenseStatus): { label: string; className: string } {
  switch (status) {
    case "active": return { label: "Vigente", className: "bg-green-100 text-green-700 border-green-200" };
    case "expiring": return { label: "Vencendo", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    case "expired": return { label: "Vencida", className: "bg-red-100 text-red-700 border-red-200" };
    case "in_renewal": return { label: "Em renovação", className: "bg-orange-100 text-orange-700 border-orange-200" };
    case "permanent": return { label: "Permanente", className: "bg-blue-100 text-blue-700 border-blue-200" };
  }
}

export function getSphereBadgeInfo(sphere: string): { label: string; className: string } {
  switch (sphere) {
    case "federal": return { label: "Federal", className: "bg-blue-900/10 text-blue-900 border-blue-900/20" };
    case "estadual": return { label: "Estadual", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
    case "municipal": return { label: "Municipal", className: "bg-sky-100 text-sky-700 border-sky-200" };
    default: return { label: sphere, className: "bg-muted text-muted-foreground" };
  }
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
    return format(parseISO(dateStr), "dd/MM HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function getValidityLabel(issuedAt: string, expiresAt: string): string {
  const issued = parseISO(issuedAt);
  const expires = parseISO(expiresAt);
  const years = differenceInYears(expires, issued);
  const months = differenceInMonths(expires, issued) % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ano${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} ${months > 1 ? "meses" : "mês"}`);
  return parts.length > 0 ? `Validade: ${parts.join(" e ")}` : "Validade: menos de 1 mês";
}

export function getAlertDateLabel(expiresAt: string, alertDaysBefore: number): string {
  const expires = parseISO(expiresAt);
  const alertDate = addDays(expires, -alertDaysBefore);
  return format(alertDate, "dd/MM/yyyy");
}
