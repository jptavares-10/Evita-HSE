import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, MapPin, Pencil, AlertTriangle, Lock, RotateCcw } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePermission } from "@/hooks/usePermission";
import { usePlan } from "@/hooks/usePlan";
import {
  useOccurrence,
  useOccurrenceEmployees,
  useCorrectiveActions,
  useCloseOccurrence,
  useReopenOccurrence,
} from "@/hooks/useOccurrences";
import { useOccurrenceCauses } from "@/hooks/useInvestigation";
import {
  getTypeInfo,
  getSeverityInfo,
  getStatusInfo,
  getBodyPartLabel,
  formatDateTimeBR,
  computeStages,
  closeBlockReason,
  stageProgress,
  type OccurrenceStage,
} from "@/lib/occurrences";
import { OccurrenceStepper, StageProgressBar } from "@/components/incidentes/OccurrenceStepper";
import { InvestigationPanel } from "@/components/incidentes/investigation/InvestigationPanel";
import { ActionPlan5W2H } from "@/components/incidentes/investigation/ActionPlan5W2H";
import { LessonPublisher } from "@/components/incidentes/investigation/LessonPublisher";
import { OccurrenceLegalPanel } from "@/components/incidentes/investigation/OccurrenceLegalPanel";
import { OccurrenceDrawer } from "@/components/incidentes/OccurrenceDrawer";
import { CausesSummary } from "@/components/incidentes/investigation/CausesSummary";

export default function IncidenteDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit } = usePermission("ic_nc");
  const { status } = usePlan();
  const planExpired = status === "expired";

  const { data: occurrence, isLoading } = useOccurrence(id);
  const { data: employees = [] } = useOccurrenceEmployees(id ?? null);
  const { data: causes = [] } = useOccurrenceCauses(id ?? null);
  const { data: actions = [] } = useCorrectiveActions(id ?? null);
  const closeOcc = useCloseOccurrence();
  const reopenOcc = useReopenOccurrence();

  const [stage, setStage] = useState<OccurrenceStage["key"]>("register");
  const [editOpen, setEditOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closureNotes, setClosureNotes] = useState("");

  usePageTitle(occurrence ? `Ocorrência — ${getTypeInfo(occurrence.type).label}` : "Ocorrência", { noindex: true });

  const stages = useMemo(
    () => (occurrence ? computeStages(occurrence, causes, actions) : []),
    [occurrence, causes, actions],
  );
  const blockReason = occurrence ? closeBlockReason(occurrence, causes, actions) : null;

  if (isLoading) {
    return <AppLayout><div className="p-6 text-sm text-muted-foreground">Carregando...</div></AppLayout>;
  }

  if (!occurrence) {
    return (
      <AppLayout>
        <div className="p-6 space-y-3">
          <p className="text-sm text-muted-foreground">Ocorrência não encontrada.</p>
          <Button variant="outline" onClick={() => navigate("/incidentes")}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  const typeInfo = getTypeInfo(occurrence.type);
  const severityInfo = getSeverityInfo(occurrence.severity);
  const statusInfo = getStatusInfo(occurrence.status);
  const missingCat = occurrence.cat_required && !occurrence.cat_number;
  const isClosed = occurrence.status === "closed";

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Button asChild variant="ghost" size="sm" className="-ml-2 h-8">
              <Link to="/incidentes"><ArrowLeft className="mr-1.5 h-4 w-4" />Voltar para ocorrências</Link>
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
              <Badge className={severityInfo.color}>{severityInfo.label}</Badge>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              {missingCat && (
                <Badge className="border-red-200 bg-red-100 text-red-800">
                  <AlertTriangle className="mr-1 h-3 w-3" />CAT pendente
                </Badge>
              )}
            </div>
            <h1 className="max-w-3xl text-xl font-semibold leading-snug">{occurrence.description}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDateTimeBR(occurrence.occurred_at)}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{occurrence.location}</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {canEdit && !isClosed && (
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} disabled={planExpired}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />Editar registro
              </Button>
            )}
            {canEdit && isClosed && (
              <Button variant="outline" size="sm" onClick={() => reopenOcc.mutate(occurrence.id)} disabled={planExpired}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />Reabrir
              </Button>
            )}
          </div>
        </div>

        <StageProgressBar value={stageProgress(stages)} />
        <OccurrenceStepper stages={stages} active={stage} onSelect={setStage} />

        <div className="rounded-2xl border bg-card p-5">
          {stage === "register" && (
            <div className="space-y-5">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Descrição</p>
                <p className="whitespace-pre-wrap text-sm">{occurrence.description}</p>
              </div>

              {employees.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Colaboradores envolvidos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {employees.map((e: any) => <Badge key={e.id} variant="outline">{e.employee_name}</Badge>)}
                  </div>
                </div>
              )}

              {occurrence.type === "incident" && (
                <div className="space-y-2">
                  {occurrence.body_part_affected && (
                    <div>
                      <p className="mb-0.5 text-xs font-semibold uppercase text-muted-foreground">Parte do corpo</p>
                      <p className="text-sm">{getBodyPartLabel(occurrence.body_part_affected)}</p>
                    </div>
                  )}
                  {occurrence.with_leave !== null && (
                    <p className="text-sm">
                      {occurrence.with_leave
                        ? `Com afastamento${occurrence.lost_days > 0 ? ` — ${occurrence.lost_days} dia(s)` : ""}`
                        : "Sem afastamento"}
                    </p>
                  )}
                  <div className="pt-2">
                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Comunicação legal e custo</p>
                    <OccurrenceLegalPanel occurrence={occurrence} canEdit={canEdit} disabled={planExpired || isClosed} />
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Registrado por {occurrence.profiles?.full_name} em {formatDateTimeBR(occurrence.created_at)}
              </p>
            </div>
          )}

          {stage === "investigate" && (
            <InvestigationPanel occurrenceId={occurrence.id} canEdit={canEdit} disabled={planExpired || isClosed} />
          )}

          {stage === "plan" && (
            <div className="space-y-5">
              <CausesSummary occurrenceId={occurrence.id} canEdit={false} disabled />
              <ActionPlan5W2H occurrenceId={occurrence.id} canEdit={canEdit} disabled={planExpired || isClosed} />
            </div>
          )}

          {stage === "verify" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Depois de concluída, cada ação precisa de uma verificação de eficácia. Use os botões dentro de cada ação.
              </p>
              <ActionPlan5W2H occurrenceId={occurrence.id} canEdit={canEdit} disabled={planExpired || isClosed} />
            </div>
          )}

          {stage === "close" && (
            <div className="space-y-4">
              {isClosed ? (
                <div className="space-y-3">
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Encerrada {occurrence.closed_at ? `em ${formatDateTimeBR(occurrence.closed_at)}` : ""}
                      {occurrence.closer?.full_name ? ` por ${occurrence.closer.full_name}` : ""}.
                    </AlertDescription>
                  </Alert>
                  {occurrence.closure_notes && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Conclusão</p>
                      <p className="whitespace-pre-wrap text-sm">{occurrence.closure_notes}</p>
                    </div>
                  )}
                  <LessonPublisher occurrence={occurrence} canEdit={canEdit} disabled={planExpired} />
                </div>
              ) : (
                <div className="space-y-4">
                  {blockReason ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{blockReason}</AlertDescription>
                    </Alert>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Tudo pronto: causas registradas, ações concluídas e eficácia verificada.
                    </p>
                  )}
                  <LessonPublisher occurrence={occurrence} canEdit={canEdit} disabled={planExpired} />
                  {canEdit && (
                    <Button onClick={() => setCloseOpen(true)} disabled={!!blockReason || planExpired}>
                      Encerrar ocorrência
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <OccurrenceDrawer open={editOpen} onOpenChange={setEditOpen} occurrence={occurrence} />

      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar ocorrência</DialogTitle>
            <DialogDescription>Registre um resumo do tratamento para o histórico.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Conclusão</Label>
            <Textarea value={closureNotes} onChange={(e) => setClosureNotes(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>Cancelar</Button>
            <Button
              onClick={async () => {
                await closeOcc.mutateAsync({ occurrenceId: occurrence.id, closure_notes: closureNotes.trim() || null });
                setCloseOpen(false);
              }}
              disabled={closeOcc.isPending}
            >
              Encerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
