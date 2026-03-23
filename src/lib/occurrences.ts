import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const OCCURRENCE_TYPES = [
  { value: "incident", label: "Incidente", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "near_miss", label: "Quase-acidente", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "non_conformity", label: "Não conformidade", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "safety_observation", label: "Observação de segurança", color: "bg-blue-100 text-blue-800 border-blue-200" },
] as const;

export const SEVERITY_LEVELS = [
  { value: "low", label: "Baixa", color: "bg-gray-100 text-gray-800 border-gray-200", description: "Sem lesão ou dano material" },
  { value: "medium", label: "Média", color: "bg-yellow-100 text-yellow-800 border-yellow-200", description: "Lesão leve ou dano material pequeno" },
  { value: "high", label: "Alta", color: "bg-orange-100 text-orange-800 border-orange-200", description: "Lesão grave ou dano material significativo" },
  { value: "critical", label: "Crítica", color: "bg-red-100 text-red-800 border-red-200", description: "Risco de vida ou dano irreversível" },
] as const;

export const STATUS_OPTIONS = [
  { value: "open", label: "Aberta", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "in_progress", label: "Em andamento", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "closed", label: "Encerrada", color: "bg-green-100 text-green-800 border-green-200" },
] as const;

export const ACTION_STATUS_OPTIONS = [
  { value: "pending", label: "Pendente", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { value: "in_progress", label: "Em andamento", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "completed", label: "Concluída", color: "bg-green-100 text-green-800 border-green-200" },
] as const;

export const BODY_PARTS = [
  { value: "head", label: "Cabeça" },
  { value: "neck", label: "Pescoço" },
  { value: "chest", label: "Tórax" },
  { value: "back", label: "Costas" },
  { value: "left_arm", label: "Braço esquerdo" },
  { value: "right_arm", label: "Braço direito" },
  { value: "left_hand", label: "Mão esquerda" },
  { value: "right_hand", label: "Mão direita" },
  { value: "abdomen", label: "Abdômen" },
  { value: "left_leg", label: "Perna esquerda" },
  { value: "right_leg", label: "Perna direita" },
  { value: "left_foot", label: "Pé esquerdo" },
  { value: "right_foot", label: "Pé direito" },
  { value: "multiple", label: "Múltiplas partes" },
  { value: "other", label: "Outro" },
] as const;

export function getTypeInfo(type: string) {
  return OCCURRENCE_TYPES.find((t) => t.value === type) ?? OCCURRENCE_TYPES[0];
}

export function getSeverityInfo(severity: string) {
  return SEVERITY_LEVELS.find((s) => s.value === severity) ?? SEVERITY_LEVELS[0];
}

export function getStatusInfo(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

export function getActionStatusInfo(status: string) {
  return ACTION_STATUS_OPTIONS.find((s) => s.value === status) ?? ACTION_STATUS_OPTIONS[0];
}

export function getBodyPartLabel(value: string) {
  return BODY_PARTS.find((b) => b.value === value)?.label ?? value;
}

export function formatDateTimeBR(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function formatDateBR(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateStr;
  }
}
