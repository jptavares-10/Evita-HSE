import { format, parseISO } from "date-fns";
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
