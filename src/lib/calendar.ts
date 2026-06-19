import type { LucideIcon } from "lucide-react";
import { Leaf, Shield, HeartPulse, Sparkles } from "lucide-react";

export type CalendarArea = "meio_ambiente" | "seguranca" | "saude" | "geral";
export type CalendarCategory =
  | "evento"
  | "campanha"
  | "auditoria"
  | "reuniao"
  | "treinamento_interno"
  | "outro";
export type CalendarEventStatus = "planejado" | "concluido" | "cancelado";

export const AREA_META: Record<CalendarArea, { label: string; color: string; icon: LucideIcon }> = {
  meio_ambiente: { label: "Meio Ambiente", color: "#10B981", icon: Leaf },
  seguranca: { label: "Segurança", color: "#EF4444", icon: Shield },
  saude: { label: "Saúde", color: "#F59E0B", icon: HeartPulse },
  geral: { label: "Geral", color: "#64748B", icon: Sparkles },
};

export const CATEGORY_META: Record<CalendarCategory, string> = {
  evento: "Evento",
  campanha: "Campanha",
  auditoria: "Auditoria",
  reuniao: "Reunião",
  treinamento_interno: "Treinamento interno",
  outro: "Outro",
};

export const STATUS_META: Record<CalendarEventStatus, { label: string; className: string }> = {
  planejado: { label: "Planejado", className: "bg-blue-100 text-blue-700 border-blue-200" },
  concluido: { label: "Concluído", className: "bg-green-100 text-green-700 border-green-200" },
  cancelado: { label: "Cancelado", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

export const SOURCE_MODULE_META: Record<string, { label: string; color: string }> = {
  periodic_service: { label: "Serviço Periódico", color: "#3B82F6" },
  environmental_license: { label: "Licença Ambiental", color: "#10B981" },
  license_renewal: { label: "Renovação de Licença", color: "#059669" },
  mtr: { label: "MTR", color: "#8B5CF6" },
  inspection_execution: { label: "Inspeção", color: "#F97316" },
  document_review_cycle: { label: "Revisão de Documento", color: "#EAB308" },
};

export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_ATTACHMENTS = 5;
export const ATTACHABLE_CATEGORIES: CalendarCategory[] = ["evento", "campanha"];

export function dueStatus(date: string | Date): "ok" | "warning" | "expired" {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "expired";
  if (diff <= 14) return "warning";
  return "ok";
}

export function dueStatusColor(s: ReturnType<typeof dueStatus>) {
  return s === "expired" ? "#DC2626" : s === "warning" ? "#F59E0B" : "#94A3B8";
}