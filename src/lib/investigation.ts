// Investigação estruturada de incidentes — enums e helpers

export const CAUSE_TYPES = [
  { value: "immediate", label: "Imediata", description: "Ato ou condição que desencadeou o evento", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "basic", label: "Básica", description: "Fator pessoal ou de trabalho por trás da causa imediata", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "root", label: "Raiz", description: "Falha de gestão ou sistema que permitiu o evento", color: "bg-red-100 text-red-800 border-red-200" },
] as const;

export const CATEGORY_6M = [
  { value: "man", label: "Mão de obra", description: "Pessoas — treinamento, atenção, comportamento" },
  { value: "machine", label: "Máquina", description: "Equipamento, ferramenta, manutenção" },
  { value: "method", label: "Método", description: "Procedimento, instrução, fluxo de trabalho" },
  { value: "material", label: "Material", description: "Insumo, matéria-prima, qualidade" },
  { value: "environment", label: "Meio ambiente", description: "Local, iluminação, clima, ergonomia" },
  { value: "measurement", label: "Medição", description: "Indicador, controle, calibração" },
] as const;

export const INVESTIGATION_METHODS = [
  { value: "five_whys", label: "5 Porquês", description: "Cadeia de perguntas até chegar à causa raiz. Rápido e prático.", planTier: "professional" },
  { value: "ishikawa", label: "Ishikawa (6M)", description: "Diagrama de espinha de peixe com causas por categoria.", planTier: "enterprise" },
  { value: "bowtie", label: "Bow-Tie", description: "Perigo central com ameaças, consequências e barreiras.", planTier: "enterprise" },
] as const;

export const CONTROL_HIERARCHY = [
  { value: "elimination", label: "Eliminação", description: "Remover o perigo", weight: 5 },
  { value: "substitution", label: "Substituição", description: "Trocar por algo menos perigoso", weight: 4 },
  { value: "engineering", label: "Engenharia", description: "Isolamento, proteção coletiva", weight: 3 },
  { value: "administrative", label: "Administrativo", description: "Procedimento, treinamento, sinalização", weight: 2 },
  { value: "ppe", label: "EPI", description: "Equipamento de proteção individual", weight: 1 },
] as const;

export const EFFECTIVENESS_RESULTS = [
  { value: "effective", label: "Efetiva", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "ineffective", label: "Não efetiva", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "reopened", label: "Reaberta", color: "bg-amber-100 text-amber-800 border-amber-200" },
] as const;

export const BOWTIE_NODE_TYPES = [
  { value: "threat", label: "Ameaça" },
  { value: "consequence", label: "Consequência" },
  { value: "preventive_barrier", label: "Barreira preventiva" },
  { value: "mitigating_barrier", label: "Barreira mitigadora" },
] as const;

export function getCauseTypeInfo(v: string) {
  return CAUSE_TYPES.find((c) => c.value === v) ?? CAUSE_TYPES[0];
}
export function getCategory6mInfo(v: string | null | undefined) {
  return CATEGORY_6M.find((c) => c.value === v);
}
export function getControlHierarchyInfo(v: string | null | undefined) {
  return CONTROL_HIERARCHY.find((c) => c.value === v);
}
export function getEffectivenessInfo(v: string | null | undefined) {
  return EFFECTIVENESS_RESULTS.find((c) => c.value === v);
}
export function getInvestigationMethodInfo(v: string | null | undefined) {
  return INVESTIGATION_METHODS.find((c) => c.value === v);
}

// Plan gate: Ishikawa e Bow-Tie são Enterprise only. 5 Whys é Pro+.
export function canUseMethod(method: string, plan: string, status: string): boolean {
  if (status === "trial") return true;
  if (status === "expired") return false;
  if (method === "five_whys") return plan === "professional" || plan === "enterprise";
  if (method === "ishikawa" || method === "bowtie") return plan === "enterprise";
  return false;
}

export function formatCurrencyBR(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function isActionOverdue(dueDate: string | null | undefined, status: string): boolean {
  if (!dueDate || status === "completed") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}