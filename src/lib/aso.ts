import { differenceInDays, parseISO, format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export type AsoStatus = "ok" | "warning" | "expired" | "no_expiry";

const ASO_ALERT_DAYS = 30;

export function computeAsoStatus(
  expiresAt: string | null | undefined
): AsoStatus {
  if (!expiresAt) return "no_expiry";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = parseISO(expiresAt);
  exp.setHours(0, 0, 0, 0);
  if (exp < today) return "expired";
  const diff = differenceInDays(exp, today);
  if (diff <= ASO_ALERT_DAYS) return "warning";
  return "ok";
}

export function getAsoStatusBadge(status: AsoStatus): { label: string; className: string } {
  switch (status) {
    case "ok": return { label: "Em dia", className: "bg-green-100 text-green-700 border-green-200" };
    case "warning": return { label: "Vencendo", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    case "expired": return { label: "Vencido", className: "bg-red-100 text-red-700 border-red-200" };
    case "no_expiry": return { label: "Sem validade", className: "bg-muted text-muted-foreground" };
  }
}

export function getResultBadge(result: string): { label: string; className: string } {
  switch (result) {
    case "apto": return { label: "Apto", className: "bg-green-100 text-green-700 border-green-200" };
    case "inapto": return { label: "Inapto", className: "bg-red-100 text-red-700 border-red-200" };
    case "apto_com_restricao": return { label: "Apto c/ restrição", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    default: return { label: result, className: "bg-muted text-muted-foreground" };
  }
}

export function calculateExpiresAt(examDate: string, validityMonths: number | null | undefined): string | null {
  if (!validityMonths) return null;
  return format(addMonths(parseISO(examDate), validityMonths), "yyyy-MM-dd");
}

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}
