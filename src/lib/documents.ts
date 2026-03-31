import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export type DocumentStatus = "active" | "under_review" | "obsolete";

export function getDocStatusBadgeInfo(status: DocumentStatus): { label: string; className: string } {
  switch (status) {
    case "active": return { label: "Vigente", className: "bg-green-100 text-green-700 border-green-200" };
    case "under_review": return { label: "Em revisão", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    case "obsolete": return { label: "Obsoleto", className: "bg-gray-100 text-gray-500 border-gray-200" };
  }
}

export function getDocStatusLabel(status: string): string {
  switch (status) {
    case "active": return "Vigente";
    case "under_review": return "Em revisão";
    case "obsolete": return "Obsoleto";
    default: return status;
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
    return format(new Date(dateStr), "dd/MM HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}

/**
 * Suggest next revision number. If current is "Rev. 01" → "Rev. 02".
 * For non-standard patterns, returns empty string.
 */
export function suggestNextRevision(current: string): string {
  const match = current.match(/^(.*?)(\d+)$/);
  if (!match) return "";
  const prefix = match[1];
  const num = parseInt(match[2], 10);
  const next = String(num + 1).padStart(match[2].length, "0");
  return `${prefix}${next}`;
}

export type RevisionCycleStatus = "ok" | "warning" | "overdue" | "none";

/**
 * Compute the revision cycle status for a document.
 * Warning threshold: 30 days before next_revision_at.
 */
export function getRevisionCycleStatus(doc: {
  has_revision_cycle?: boolean;
  next_revision_at?: string | null;
}): RevisionCycleStatus {
  if (!doc.has_revision_cycle || !doc.next_revision_at) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  try {
    const nextDate = parseISO(doc.next_revision_at);
    const daysUntil = differenceInDays(nextDate, today);
    if (daysUntil < 0) return "overdue";
    if (daysUntil <= 30) return "warning";
    return "ok";
  } catch {
    return "none";
  }
}

export function getRevisionCycleBadgeInfo(status: RevisionCycleStatus): { label: string; className: string } | null {
  switch (status) {
    case "ok": return { label: "Revisão em dia", className: "bg-green-100 text-green-700 border-green-200" };
    case "warning": return { label: "Revisão próxima", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    case "overdue": return { label: "Revisão atrasada", className: "bg-red-100 text-red-700 border-red-200" };
    case "none": return null;
  }
}

export function formatFrequencyDays(days: number | null | undefined): string {
  if (!days) return "—";
  if (days === 30) return "Mensal";
  if (days === 90) return "Trimestral";
  if (days === 180) return "Semestral";
  if (days === 365) return "Anual";
  if (days === 730) return "Bienal";
  return `${days} dias`;
}
