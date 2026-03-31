import { differenceInDays, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type CaStatus = "ok" | "warning" | "expired" | "no_ca";

export function computeCaStatus(
  caExpiresAt: string | null | undefined,
  alertDaysBefore: number
): CaStatus {
  if (!caExpiresAt) return "no_ca";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = parseISO(caExpiresAt);
  exp.setHours(0, 0, 0, 0);
  if (exp < today) return "expired";
  const diff = differenceInDays(exp, today);
  if (diff <= alertDaysBefore) return "warning";
  return "ok";
}

export function getCaStatusBadge(status: CaStatus): { label: string; className: string } {
  switch (status) {
    case "ok": return { label: "CA Vigente", className: "bg-green-100 text-green-700 border-green-200" };
    case "warning": return { label: "CA Vencendo", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    case "expired": return { label: "CA Vencido", className: "bg-red-100 text-red-700 border-red-200" };
    case "no_ca": return { label: "Sem CA", className: "bg-muted text-muted-foreground" };
  }
}

export type StockStatus = "ok" | "low" | "out";

export function computeStockStatus(currentStock: number, minimumStock: number): StockStatus {
  if (currentStock <= 0) return "out";
  if (currentStock <= minimumStock) return "low";
  return "ok";
}

export function getStockStatusBadge(status: StockStatus): { label: string; className: string } {
  switch (status) {
    case "ok": return { label: "OK", className: "bg-green-100 text-green-700 border-green-200" };
    case "low": return { label: "Baixo", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    case "out": return { label: "Zerado", className: "bg-red-100 text-red-700 border-red-200" };
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

export function getCaDaysRemaining(caExpiresAt: string | null | undefined): string {
  if (!caExpiresAt) return "—";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = parseISO(caExpiresAt);
  exp.setHours(0, 0, 0, 0);
  const diff = differenceInDays(exp, today);
  if (diff < 0) return `Vencido há ${Math.abs(diff)} dias`;
  return `${diff} dias`;
}
