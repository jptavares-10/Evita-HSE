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

// ── Prioridade das ações corretivas ─────────────────────

export const ACTION_PRIORITIES = [
  { value: "low", label: "Baixa", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "medium", label: "Média", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "high", label: "Alta", color: "bg-red-100 text-red-800 border-red-200" },
] as const;

export function getPriorityInfo(v: string | null | undefined) {
  return ACTIONPRIORITIES_SAFE(v);
}
function ACTIONPRIORITIES_SAFE(v: string | null | undefined) {
  return ACTION_PRIORITIES.find((p) => p.value === v) ?? ACTION_PRIORITIES[1];
}

export type ActionState = "verified" | "completed" | "overdue" | "in_progress" | "pending";

export const ACTION_STATE_META: Record<ActionState, { label: string; color: string }> = {
  verified: { label: "Verificada", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  completed: { label: "Concluída", color: "bg-green-100 text-green-800 border-green-200" },
  overdue: { label: "Atrasada", color: "bg-red-100 text-red-800 border-red-200" },
  in_progress: { label: "Em andamento", color: "bg-blue-100 text-blue-800 border-blue-200" },
  pending: { label: "Pendente", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

export function getActionState(action: any): ActionState {
  if (action.status === "completed") return action.effectiveness_result ? "verified" : "completed";
  if (action.due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(action.due_date + "T00:00:00") < today) return "overdue";
  }
  return action.status === "in_progress" ? "in_progress" : "pending";
}

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(date + "T00:00:00").getTime() - today.getTime()) / 86400000);
}

// ── Etapas do tratamento da ocorrência ──────────────────

export interface OccurrenceStage {
  key: "register" | "investigate" | "plan" | "verify" | "close";
  label: string;
  done: boolean;
  pending: string | null;
  optional?: boolean;
}

/** Investigação não é exigida para observação de segurança. */
export function requiresInvestigation(type: string) {
  return type !== "safety_observation";
}

export function computeStages(occurrence: any, causes: any[], actions: any[]): OccurrenceStage[] {
  const rootCauses = causes.filter((c) => c.cause_type === "root");
  const needsInvestigation = requiresInvestigation(occurrence.type);
  const openActions = actions.filter((a) => a.status !== "completed");
  const unverified = actions.filter((a) => a.status === "completed" && !a.effectiveness_result);
  const noResponsible = actions.filter((a) => !a.responsible_profile_id);
  const noDue = actions.filter((a) => !a.due_date);
  const isClosed = occurrence.status === "closed";

  const investigationDone = !needsInvestigation || causes.length > 0;
  const planDone = actions.length > 0 && noResponsible.length === 0 && noDue.length === 0;
  const verifyDone = actions.length > 0 && openActions.length === 0 && unverified.length === 0;

  const plural = (n: number, s: string, p: string) => (n === 1 ? s : p);

  return [
    {
      key: "register",
      label: "Registro",
      done: true,
      pending: occurrence.cat_required && !occurrence.cat_number ? "CAT ainda não informada" : null,
    },
    {
      key: "investigate",
      label: "Investigação",
      done: investigationDone,
      optional: !needsInvestigation,
      pending: investigationDone
        ? rootCauses.length === 0 && causes.length > 0
          ? "nenhuma causa marcada como raiz"
          : null
        : "nenhuma causa identificada ainda",
    },
    {
      key: "plan",
      label: "Plano de ação",
      done: planDone,
      pending: actions.length === 0
        ? "nenhuma ação criada"
        : noResponsible.length > 0
          ? `${noResponsible.length} ${plural(noResponsible.length, "ação sem responsável", "ações sem responsável")}`
          : noDue.length > 0
            ? `${noDue.length} ${plural(noDue.length, "ação sem prazo", "ações sem prazo")}`
            : null,
    },
    {
      key: "verify",
      label: "Verificação",
      done: verifyDone,
      pending: actions.length === 0
        ? "aguardando o plano de ação"
        : openActions.length > 0
          ? `${openActions.length} ${plural(openActions.length, "ação em aberto", "ações em aberto")}`
          : unverified.length > 0
            ? `${unverified.length} ${plural(unverified.length, "ação sem verificação de eficácia", "ações sem verificação de eficácia")}`
            : null,
    },
    {
      key: "close",
      label: "Encerramento",
      done: isClosed,
      pending: isClosed ? null : verifyDone ? "pronta para encerrar" : "aguardando as etapas anteriores",
    },
  ];
}

/** Retorna null quando pode encerrar, ou o motivo do bloqueio. */
export function closeBlockReason(occurrence: any, causes: any[], actions: any[]): string | null {
  const stages = computeStages(occurrence, causes, actions);
  const verify = stages.find((s) => s.key === "verify")!;
  const investigate = stages.find((s) => s.key === "investigate")!;
  if (!investigate.done) return "Registre ao menos uma causa na investigação antes de encerrar.";
  if (actions.length === 0) return "Crie ao menos uma ação corretiva antes de encerrar.";
  if (!verify.done) return `Ainda há ${verify.pending}. Conclua e verifique a eficácia antes de encerrar.`;
  return null;
}

export function stageProgress(stages: OccurrenceStage[]): number {
  const done = stages.filter((s) => s.done).length;
  return Math.round((done / stages.length) * 100);
}
