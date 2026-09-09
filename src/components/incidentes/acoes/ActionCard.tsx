import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, ShieldCheck, Pencil, Trash2, Paperclip, User, CalendarDays } from "lucide-react";
import { getActionState, ACTION_STATE_META, getPriorityInfo, daysUntil } from "@/lib/occurrences";
import { getControlHierarchyInfo, getEffectivenessInfo } from "@/lib/investigation";
import { useActionAttachments } from "@/hooks/useOccurrences";

interface Props {
  action: any;
  canManage: boolean;
  isResponsible: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  onVerify?: () => void;
}

export function ActionCard({ action, canManage, isResponsible, onEdit, onDelete, onStart, onComplete, onVerify }: Props) {
  const state = getActionState(action);
  const meta = ACTION_STATE_META[state];
  const priority = getPriorityInfo(action.priority);
  const hierarchy = getControlHierarchyInfo(action.control_hierarchy);
  const effectiveness = getEffectivenessInfo(action.effectiveness_result);
  const { data: attachments = [] } = useActionAttachments(action.id);
  const days = daysUntil(action.due_date);
  const canAct = canManage || isResponsible;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-sm font-medium leading-snug">{action.description}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={`text-[10px] ${meta.color}`}>{meta.label}</Badge>
            <Badge variant="outline" className={`text-[10px] ${priority.color}`}>Prioridade {priority.label.toLowerCase()}</Badge>
            {hierarchy && <Badge variant="outline" className="text-[10px]">{hierarchy.label}</Badge>}
            {effectiveness && (
              <Badge variant="outline" className={`text-[10px] ${effectiveness.color}`}>Eficácia: {effectiveness.label}</Badge>
            )}
            {attachments.length > 0 && (
              <Badge variant="outline" className="text-[10px] gap-1"><Paperclip className="h-3 w-3" />{attachments.length}</Badge>
            )}
          </div>
        </div>
        {canManage && (
          <div className="flex shrink-0 gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Editar">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete} title="Excluir">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {action.responsible?.full_name || "Sem responsável"}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {action.due_date ? action.due_date.split("-").reverse().join("/") : "Sem prazo"}
          {state === "overdue" && days !== null && (
            <span className="text-destructive"> · {Math.abs(days)} dia(s) em atraso</span>
          )}
          {state !== "overdue" && state !== "completed" && state !== "verified" && days !== null && days <= 7 && (
            <span className="text-warning"> · vence em {days} dia(s)</span>
          )}
        </span>
      </div>

      {action.completion_notes && (
        <p className="rounded-md bg-muted/50 px-3 py-2 text-xs">
          <b>Concluída:</b> {action.completion_notes}
        </p>
      )}
      {action.effectiveness_notes && (
        <p className="rounded-md bg-muted/50 px-3 py-2 text-xs">
          <b>Verificação:</b> {action.effectiveness_notes}
        </p>
      )}

      {canAct && (
        <div className="flex flex-wrap gap-2 pt-1">
          {state === "pending" && onStart && (
            <Button variant="outline" size="sm" onClick={onStart}>
              <Play className="mr-1.5 h-3.5 w-3.5" /> Iniciar
            </Button>
          )}
          {(state === "pending" || state === "in_progress" || state === "overdue") && onComplete && (
            <Button size="sm" onClick={onComplete}>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Concluir
            </Button>
          )}
          {state === "completed" && canManage && onVerify && (
            <Button variant="outline" size="sm" onClick={onVerify}>
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Verificar eficácia
            </Button>
          )}
          {state === "verified" && canManage && onVerify && (
            <Button variant="ghost" size="sm" onClick={onVerify}>Rever verificação</Button>
          )}
        </div>
      )}
    </div>
  );
}
