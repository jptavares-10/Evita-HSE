import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCorrectiveActions, useDeleteCorrectiveAction, useStartAction } from "@/hooks/useOccurrences";
import { useOccurrenceCauses } from "@/hooks/useInvestigation";
import { ActionCard } from "../acoes/ActionCard";
import { ActionFormDialog } from "../acoes/ActionFormDialog";
import { CompleteActionDialog } from "../acoes/CompleteActionDialog";
import { EffectivenessDialog } from "../acoes/EffectivenessDialog";
import { DeleteConfirmDialog } from "../acoes/DeleteConfirmDialog";

interface Props { occurrenceId: string; canEdit: boolean; disabled?: boolean; }

export function ActionPlan5W2H({ occurrenceId, canEdit, disabled }: Props) {
  const { profile } = useAuth();
  const { data: actions = [] } = useCorrectiveActions(occurrenceId);
  const { data: causes = [] } = useOccurrenceCauses(occurrenceId);
  const startAction = useStartAction();
  const deleteAction = useDeleteCorrectiveAction();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [defaultCauseId, setDefaultCauseId] = useState<string | null>(null);
  const [completing, setCompleting] = useState<any | null>(null);
  const [verifying, setVerifying] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);

  const canManage = canEdit && !disabled;
  const completed = actions.filter((a: any) => a.status === "completed").length;

  const openNew = (causeId: string | null = null) => {
    setEditing(null);
    setDefaultCauseId(causeId);
    setFormOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Plano de ação</p>
          <p className="text-[11px] text-muted-foreground">
            {actions.length > 0 ? `${completed} de ${actions.length} concluída(s)` : "Nenhuma ação registrada"}
          </p>
        </div>
        {canManage && (
          <Button size="sm" variant="outline" onClick={() => openNew(null)}>
            <Plus className="mr-1 h-3.5 w-3.5" />Nova ação
          </Button>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          Crie ações com responsável e prazo para tratar as causas identificadas.
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((a: any) => (
            <ActionCard
              key={a.id}
              action={a}
              canManage={canManage}
              isResponsible={!disabled && a.responsible_profile_id === profile?.id}
              onEdit={() => { setEditing(a); setDefaultCauseId(null); setFormOpen(true); }}
              onDelete={() => setDeleting(a)}
              onStart={() => startAction.mutate(a.id)}
              onComplete={() => setCompleting(a)}
              onVerify={() => setVerifying(a)}
            />
          ))}
        </div>
      )}

      <ActionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        occurrenceId={occurrenceId}
        action={editing}
        causes={causes}
        defaultCauseId={defaultCauseId}
      />
      <CompleteActionDialog action={completing} occurrenceId={occurrenceId} onClose={() => setCompleting(null)} />
      <EffectivenessDialog
        action={verifying}
        onClose={() => setVerifying(null)}
        onCreateFollowUp={(causeId) => openNew(causeId)}
      />
      <DeleteConfirmDialog
        open={!!deleting}
        title="Excluir ação corretiva?"
        description={deleting?.description}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          deleteAction.mutate({ actionId: deleting.id, occurrenceId });
          setDeleting(null);
        }}
      />
    </div>
  );
}
