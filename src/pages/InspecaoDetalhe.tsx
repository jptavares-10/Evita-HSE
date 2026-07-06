import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInspectionExecution, useInspectionEntries, useInspectionActions, useCompleteExecution, useAddAction, useUpdateActionStatus, useDeleteAction } from "@/hooks/useInspections";
import { getExecutionDisplayStatus, STATUS_CONFIG, PRIORITY_CONFIG, ACTION_STATUS_CONFIG, formatDateBR, formatDateTimeBR, getFrequencyLabel } from "@/lib/inspections";
import { RegisterEntryModal } from "@/components/inspecoes/RegisterEntryModal";
import { CompleteActionModal } from "@/components/inspecoes/CompleteActionModal";
import { ConfirmDialog } from "@/components/inspecoes/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, FileText, Download, User, Calendar, Clock, CheckCircle2, AlertTriangle, Trash2, Play, Smartphone, FileSignature, MapPin } from "lucide-react";
import { useSignedUrl, useSignedUrls } from "@/hooks/useSignedUrl";
import { useEmployees } from "@/hooks/useTrainings";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePermission } from "@/hooks/usePermission";
import { ViewerBadge } from "@/components/ViewerBadge";

export default function InspecaoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company, profile } = useAuth();
  const isExpired = company?.plan === "expired";
  const { canEdit } = usePermission("inspections");
  const isDisabled = !!isExpired || !canEdit;

  const { data: execution, isLoading } = useInspectionExecution(id ?? null);
  const { data: entries = [] } = useInspectionEntries(id ?? null);
  const { data: actions = [] } = useInspectionActions(id ?? null);
  const completeExecution = useCompleteExecution();
  const addAction = useAddAction();
  const updateActionStatus = useUpdateActionStatus();
  const deleteAction = useDeleteAction();
  const { data: employees = [] } = useEmployees();
  const activeEmployees = employees.filter((e: any) => e.status === "active");

  usePageTitle(execution ? `${execution.reference} — Evita HSE` : "Inspeção — Evita HSE");

  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [completeActionTarget, setCompleteActionTarget] = useState<any>(null);
  const [showActionForm, setShowActionForm] = useState(false);
  const [deleteActionTarget, setDeleteActionTarget] = useState<any>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  // Action form state
  const [actionDesc, setActionDesc] = useState("");
  const [actionResponsibleId, setActionResponsibleId] = useState("");
  const [actionResponsibleName, setActionResponsibleName] = useState("");
  const [actionIsExternal, setActionIsExternal] = useState(false);
  const [actionDueDate, setActionDueDate] = useState("");
  const [actionPriority, setActionPriority] = useState("medium");

  // Signed URLs for entry files
  const entryUrls = useMemo(() => entries.map((e: any) => e.file_url).filter(Boolean), [entries]);
  const signedEntryMap = useSignedUrls("inspection-files", entryUrls);

  // Signed URLs for action evidence
  const evidenceUrls = useMemo(() => actions.filter((a: any) => a.evidence_url).map((a: any) => a.evidence_url), [actions]);
  const signedEvidenceMap = useSignedUrls("inspection-files", evidenceUrls);

  // Doc signed URL
  const model = execution?.inspection_models;
  const docFileUrl = model?.linked_document?.current_file_url ?? null;
  const docSignedUrl = useSignedUrl("documents-library", docFileUrl);

  const openActions = useMemo(() => actions.filter((a: any) => a.status !== "completed"), [actions]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Execução não encontrada.</p>
        <Button variant="link" onClick={() => navigate("/inspecoes")}>Voltar</Button>
      </div>
    );
  }

  const displayStatus = getExecutionDisplayStatus(execution.status, execution.due_date);
  const statusCfg = STATUS_CONFIG[displayStatus];
  const isCompleted = displayStatus === "completed" || displayStatus === "completed_with_issues";

  const handleAddAction = async () => {
    if (!actionDesc.trim() || !actionDueDate || !id) return;
    const respName = actionIsExternal ? actionResponsibleName.trim() : (activeEmployees.find((e: any) => e.id === actionResponsibleId)?.name || null);
    await addAction.mutateAsync({
      execution_id: id,
      description: actionDesc.trim(),
      responsible_employee_id: actionIsExternal ? null : (actionResponsibleId || null),
      responsible_name: respName,
      due_date: actionDueDate,
      priority: actionPriority,
    });
    setShowActionForm(false);
    setActionDesc("");
    setActionResponsibleId("");
    setActionResponsibleName("");
    setActionDueDate("");
    setActionPriority("medium");
  };

  const handleComplete = () => {
    setCompleteDialogOpen(true);
  };

  const confirmComplete = async () => {
    if (!id) return;
    await completeExecution.mutateAsync({ executionId: id, hasOpenActions: openActions.length > 0 });
    setCompleteDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/inspecoes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{execution.reference}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className={`${statusCfg.bgColor} ${statusCfg.color}`}>{statusCfg.label}</Badge>
            {model?.related_nr && <Badge variant="outline">{model.related_nr}</Badge>}
            {model?.sectors?.name && <Badge variant="outline">{model.sectors.name}</Badge>}
            <Badge variant="outline">{getFrequencyLabel(model?.frequency_type, model?.frequency_days)}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Prevista: {formatDateBR(execution.due_date)}</span>
            {model?.default_responsible?.name && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{model.default_responsible.name}</span>}
          </div>
          {docSignedUrl && (
            <a href={docSignedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2">
              <Download className="h-4 w-4" />
              Ver checklist de referência
            </a>
          )}
        </div>
        {!isCompleted && canEdit && (
          <Button onClick={() => navigate(`/inspecoes/${id}/campo`)} className="bg-primary">
            <Smartphone className="h-4 w-4 mr-1.5" />
            Inspecionar em campo
          </Button>
        )}
      </div>

      {/* Signature summary when signed */}
      {execution.signer_name && (
        <section className="lp-card rounded-xl p-5 space-y-2">
          <h2 className="font-semibold flex items-center gap-2 text-sm">
            <FileSignature className="h-4 w-4" />
            Assinatura de fechamento
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Responsável</div>
              <div className="font-medium">{execution.signer_name}</div>
              {execution.signer_role && <div className="text-xs text-muted-foreground">{execution.signer_role}</div>}
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Data/Hora</div>
              <div className="font-medium">{formatDateTimeBR(execution.signed_at)}</div>
              {(execution.signed_location_lat != null && execution.signed_location_lng != null) && (
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {Number(execution.signed_location_lat).toFixed(5)}, {Number(execution.signed_location_lng).toFixed(5)}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Entries Section */}
      <section className="lp-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Registros de Execução
            <Badge variant="secondary" className="text-xs">{entries.length}</Badge>
          </h2>
          {!isCompleted && canEdit && (
            <Button size="sm" onClick={() => setEntryModalOpen(true)} disabled={isDisabled}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Registro
            </Button>
          )}
          {!canEdit && <ViewerBadge />}
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum registro adicionado.</p>
            <p className="text-xs">Clique em '+ Adicionar Registro' para iniciar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry: any) => (
              <div key={entry.id} className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{entry.employee_name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateTimeBR(entry.executed_at)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <a href={signedEntryMap[entry.file_url] || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                    {entry.file_name}
                  </a>
                </div>
                {entry.notes && <p className="text-xs text-muted-foreground bg-background/50 rounded px-2 py-1.5">{entry.notes}</p>}
                <p className="text-[11px] text-muted-foreground">Registrado por {entry.profiles?.full_name || "—"} em {formatDateTimeBR(entry.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Corrective Actions Section */}
      <section className="lp-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Ações Corretivas
            {openActions.length > 0 && <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">{openActions.length} abertas</Badge>}
          </h2>
          {!isCompleted && !showActionForm && canEdit && (
            <Button size="sm" variant="outline" onClick={() => setShowActionForm(true)} disabled={isDisabled}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Ação Corretiva
            </Button>
          )}
        </div>

        {/* Inline action form */}
        {showActionForm && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="space-y-2">
              <Label>Descrição da não conformidade / ação *</Label>
              <Textarea placeholder="Descreva o que foi identificado e o que deve ser corrigido..." value={actionDesc} onChange={(e) => setActionDesc(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <div className="flex items-center gap-2 mb-1">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" checked={actionIsExternal} onChange={(e) => { setActionIsExternal(e.target.checked); setActionResponsibleId(""); }} className="rounded" />
                  Nome livre
                </label>
              </div>
              {actionIsExternal ? (
                <Input placeholder="Nome do responsável" value={actionResponsibleName} onChange={(e) => setActionResponsibleName(e.target.value)} />
              ) : (
                <Select value={actionResponsibleId} onValueChange={setActionResponsibleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEmployees.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Prazo *</Label>
                <Input type="date" value={actionDueDate} onChange={(e) => setActionDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={actionPriority} onValueChange={setActionPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setShowActionForm(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleAddAction} disabled={!actionDesc.trim() || !actionDueDate || addAction.isPending}>
                {addAction.isPending ? "Salvando..." : "Adicionar ação"}
              </Button>
            </div>
          </div>
        )}

        {actions.length === 0 && !showActionForm ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ação corretiva registrada.</p>
        ) : (
          <div className="space-y-3">
            {actions.map((action: any) => {
              const prCfg = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG.medium;
              const stCfg = ACTION_STATUS_CONFIG[action.status] || ACTION_STATUS_CONFIG.open;
              return (
                <div key={action.id} className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium flex-1">{action.description}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${prCfg.bgColor} ${prCfg.color}`}>{prCfg.label}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${stCfg.bgColor} ${stCfg.color}`}>{stCfg.label}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {action.responsible_name && <span>👤 {action.responsible_name}</span>}
                    <span>📅 Prazo: {formatDateBR(action.due_date)}</span>
                  </div>
                  {action.status === "completed" && (
                    <div className="text-xs space-y-1 border-t pt-2">
                      <p className="text-green-700">✅ Concluída em {formatDateTimeBR(action.completed_at)}</p>
                      {action.completion_notes && <p className="text-muted-foreground">{action.completion_notes}</p>}
                      {action.evidence_url && (
                        <a href={signedEvidenceMap[action.evidence_url] || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          <FileText className="h-3 w-3" />{action.evidence_name || "Evidência"}
                        </a>
                      )}
                    </div>
                  )}
                  {action.status !== "completed" && (
                    <div className="flex gap-2 pt-1">
                      {canEdit && action.status === "open" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateActionStatus.mutate({ actionId: action.id, status: "in_progress" })} disabled={isDisabled}>
                          <Play className="h-3 w-3 mr-1" />Iniciar
                        </Button>
                      )}
                      {canEdit && action.status === "in_progress" && (
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => setCompleteActionTarget(action)} disabled={isDisabled}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />Concluir
                        </Button>
                      )}
                      {canEdit && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => setDeleteActionTarget(action)} disabled={isDisabled}>
                          <Trash2 className="h-3 w-3 mr-1" />Excluir
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Complete button */}
      {!isCompleted && canEdit && (
        <div className="sticky bottom-0 bg-background border-t py-4 -mx-6 px-6">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleComplete} disabled={isDisabled || completeExecution.isPending}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Concluir Execução
          </Button>
        </div>
      )}

      {/* Modals */}
      <RegisterEntryModal
        open={entryModalOpen}
        onOpenChange={setEntryModalOpen}
        executionId={id!}
        inspectionName={execution.reference}
        documentFileUrl={model?.linked_document?.current_file_url}
        documentFileName={model?.linked_document?.current_file_name}
      />
      <CompleteActionModal
        open={!!completeActionTarget}
        onOpenChange={(v) => !v && setCompleteActionTarget(null)}
        action={completeActionTarget}
        executionId={id!}
      />
      <ConfirmDialog
        open={!!deleteActionTarget}
        onOpenChange={(v) => !v && setDeleteActionTarget(null)}
        title="Excluir ação"
        description={`Tem certeza que deseja excluir a ação "${deleteActionTarget?.description?.slice(0, 50)}..."?`}
        onConfirm={async () => { await deleteAction.mutateAsync(deleteActionTarget.id); setDeleteActionTarget(null); }}
        loading={deleteAction.isPending}
        confirmLabel="Excluir"
      />
      <ConfirmDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        title={openActions.length > 0 ? "Concluir com pendências" : "Concluir execução"}
        description={openActions.length > 0
          ? `Existem ${openActions.length} ações corretivas em aberto. A execução será marcada como "Concluída com pendências".`
          : "Confirma a conclusão desta execução?"
        }
        onConfirm={confirmComplete}
        loading={completeExecution.isPending}
        confirmLabel={openActions.length > 0 ? "Concluir assim mesmo" : "Concluir"}
      />
    </div>
  );
}
