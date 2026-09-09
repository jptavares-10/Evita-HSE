import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, PowerOff, BarChart3, TrendingUp, LucideIcon } from "lucide-react";
import type { KpiTone } from "@/components/ui/kpi";

/**
 * Single source of truth for compliance status vocabulary across every module.
 * Never invent new labels for these concepts — reuse these keys.
 */
export type StatusKey = "total" | "ok" | "warning" | "expired" | "missing" | "inactive" | "conformity";

export interface StatusMeta {
  label: string;
  icon: LucideIcon;
  tone: KpiTone;
  /** Badge classes for table cells. */
  badgeClass: string;
}

export const STATUS_META: Record<StatusKey, StatusMeta> = {
  total: {
    label: "Total",
    icon: BarChart3,
    tone: "neutral",
    badgeClass: "border-border bg-muted text-muted-foreground",
  },
  ok: {
    label: "Em dia",
    icon: CheckCircle2,
    tone: "success",
    badgeClass: "border-success/30 bg-success/10 text-success",
  },
  warning: {
    label: "Vencendo",
    icon: AlertTriangle,
    tone: "warning",
    badgeClass: "border-warning/30 bg-warning/10 text-warning",
  },
  expired: {
    label: "Vencidos",
    icon: XCircle,
    tone: "danger",
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  missing: {
    label: "Sem registro",
    icon: MinusCircle,
    tone: "neutral",
    badgeClass: "border-border bg-muted text-muted-foreground",
  },
  inactive: {
    label: "Inativo",
    icon: PowerOff,
    tone: "neutral",
    badgeClass: "border-border bg-muted text-muted-foreground",
  },
  conformity: {
    label: "Conformidade geral",
    icon: TrendingUp,
    tone: "primary",
    badgeClass: "border-primary/30 bg-primary/10 text-primary",
  },
};

/** Singular labels for badges inside table rows. */
export const STATUS_LABEL_SINGULAR: Record<StatusKey, string> = {
  total: "Total",
  ok: "Em dia",
  warning: "Vencendo",
  expired: "Vencido",
  missing: "Sem registro",
  inactive: "Inativo",
  conformity: "Conformidade",
};

export function statusMeta(key: StatusKey): StatusMeta {
  return STATUS_META[key];
}

/** Options for the standard "Situação" select. */
export function statusSelectOptions(keys: StatusKey[] = ["ok", "warning", "expired"]) {
  return keys.map((k) => ({ value: k, label: STATUS_META[k].label }));
}
