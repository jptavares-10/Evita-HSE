import { differenceInDays, parseISO, format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export type CdfDisplayStatus = "pending" | "warning" | "received" | "overdue";

export function getCdfDisplayStatus(cdfStatus: string, alertAt: string, cdfDeadlineAt: string): CdfDisplayStatus {
  if (cdfStatus === "received") return "received";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = parseISO(cdfDeadlineAt);
  deadline.setHours(0, 0, 0, 0);
  const alert = parseISO(alertAt);
  alert.setHours(0, 0, 0, 0);

  if (today > deadline) return "overdue";
  if (today >= alert) return "warning";
  return "pending";
}

export function getCdfStatusInfo(cdfStatus: string, alertAt: string, cdfDeadlineAt: string) {
  const status = getCdfDisplayStatus(cdfStatus, alertAt, cdfDeadlineAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = parseISO(cdfDeadlineAt);
  deadline.setHours(0, 0, 0, 0);
  const diff = differenceInDays(deadline, today);

  switch (status) {
    case "received":
      return { status, label: "Recebido", color: "text-green-600", badgeClass: "bg-green-100 text-green-700 border-green-200" };
    case "overdue":
      return { status, label: `Vencido há ${Math.abs(diff)} dias`, color: "text-destructive", badgeClass: "bg-red-100 text-red-700 border-red-200" };
    case "warning":
      return { status, label: `${diff} dias restantes`, color: "text-yellow-600", badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    default:
      return { status, label: `${diff} dias`, color: "text-green-600", badgeClass: "bg-blue-100 text-blue-700 border-blue-200" };
  }
}

export function getDaysRemainingLabel(cdfStatus: string, cdfDeadlineAt: string): string {
  if (cdfStatus === "received") return "Recebido";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = parseISO(cdfDeadlineAt);
  deadline.setHours(0, 0, 0, 0);
  const diff = differenceInDays(deadline, today);
  if (diff < 0) return `Vencido há ${Math.abs(diff)} dias`;
  return `${diff} dias`;
}

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function formatTons(value: number | null | undefined): string {
  if (value == null) return "—";
  return Number(value).toFixed(3).replace(".", ",");
}

export function calculateCdfDeadline(issuedAt: string): string {
  return format(addDays(parseISO(issuedAt), 90), "yyyy-MM-dd");
}

export function calculateAlertDate(issuedAt: string): string {
  return format(addDays(parseISO(issuedAt), 83), "yyyy-MM-dd");
}

export const WASTE_PRESET_COLORS = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
];
