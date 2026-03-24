import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Calendar, MapPin, User, Pencil, Plus, Play, CheckCircle2, Trash2, FileText, Image, Download, X } from "lucide-react";
import { getTypeInfo, getSeverityInfo, getStatusInfo, getActionStatusInfo, getBodyPartLabel, formatDateTimeBR, formatDateBR } from "@/lib/occurrences";
import { useOccurrenceEmployees, useOccurrenceAttachments, useCorrectiveActions, useAddCorrectiveAction, useUpdateActionStatus, useDeleteCorrectiveAction, useCloseOccurrence } from "@/hooks/useOccurrences";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occurrence: any;
  onEdit: () => void;
  planExpired?: boolean;
}

export function OccurrenceDetailDrawer({ open, onOpenChange, occurrence, onEdit, planExpired }: Props) {
  const [tab, setTab] = useState("details");
  const [showAddAction, setShowAddAction] = useState(false);
  const [newActionDesc, setNewActionDesc] = useState("");
  const [completeActionId, setCompleteActionId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const { data: employees = [] } = useOccurrenceEmployees(occurrence?.id ?? null);
  const { data: attachments = [] } = useOccurrenceAttachments(occurrence?.id ?? null);
  const { data: actions = [] } = useCorrectiveActions(occurrence?.id ?? null);
  const addAction = useAddCorrectiveAction();
  const updateAction = useUpdateActionStatus();
  const deleteAction = useDeleteCorrectiveAction();
  const closeOcc = useCloseOccurrence();

  if (!occurrence) return null;

  const typeInfo = getTypeInfo(occurrence.type);
  const severityInfo = getSeverityInfo(occurrence.severity);
  const statusInfo = getStatusInfo(occurrence.status);

  const images = attachments.filter((a: any) => a.file_type === "image");
  const documents = attachments.filter((a: any) => a.file_type === "document");
  const completedActions = actions.filter((a: any) => a.status === "completed").length;

  const handleAddAction = () => {
    if (!newActionDesc.trim()) return;
    addAction.mutate({ occurrence_id: occurrence.id, description: newActionDesc.trim() }, {
      onSuccess: () => { setNewActionDesc(""); setShowAddAction(false); },
    });
  };

  const handleCompleteAction = () => {
    if (!completeActionId) return;
    updateAction.mutate({
      actionId: completeActionId,
      occurrenceId: occurrence.id,
      newStatus: "completed",
      completion_notes: completionNotes || null,
      evidenceFile: evidenceFile,
    }, {
      onSuccess: () => { setCompleteActionId(null); setCompletionNotes(""); setEvidenceFile(null); },
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2 flex-wrap">
              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
              <Badge className={severityInfo.color}>{severityInfo.label}</Badge>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </SheetTitle>
          </SheetHeader>

          <Tabs value={tab} onValueChange={setTab} className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b px-6">
              <TabsTrigger value="details">Ocorrência</TabsTrigger>
              <TabsTrigger value="actions" className="gap-1.5">
                Plano de Ação
                {actions.length > 0 && <span className="text-[10px] bg-primary/10 text-primary rounded-full px-1.5">{completedActions}/{actions.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="px-6 py-4 space-y-5 m-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />{formatDateTimeBR(occurrence.occurred_at)}</div>
                <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{occurrence.location}</div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Descrição</p>
                <p className="text-sm whitespace-pre-wrap">{occurrence.description}</p>
              </div>

              {employees.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Colaboradores envolvidos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {employees.map((e: any) => <Badge key={e.id} variant="outline">{e.employee_name}</Badge>)}
                  </div>
                </div>
              )}

              {occurrence.type === "incident" && (
                <div className="space-y-2">
                  {occurrence.body_part_affected && (
                    <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5">Parte do corpo</p><p className="text-sm">{getBodyPartLabel(occurrence.body_part_affected)}</p></div>
                  )}
                  {occurrence.with_leave !== null && (
                    <p className="text-sm">{occurrence.with_leave ? "Com afastamento" : "Sem afastamento"}</p>
                  )}
                </div>
              )}

              {occurrence.cause_analysis && (
                <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Análise de causa</p><p className="text-sm whitespace-pre-wrap">{occurrence.cause_analysis}</p></div>
              )}

              {/* Images */}
              {images.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Fotos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img: any) => (
                      <button key={img.id} onClick={() => setLightboxUrl(img.file_url)} className="aspect-square rounded-md overflow-hidden border hover:opacity-80 transition-opacity">
                        <img src={img.file_url} alt={img.file_name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {documents.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Documentos</p>
                  <div className="space-y-1">
                    {documents.map((doc: any) => (
                      <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <FileText className="h-3.5 w-3.5" />{doc.file_name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">Registrado por {occurrence.profiles?.full_name} em {formatDateTimeBR(occurrence.created_at)}</p>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={onEdit} disabled={planExpired}><Pencil className="h-3.5 w-3.5 mr-1" />Editar</Button>
                {occurrence.status !== "closed" && (
                  <Button variant="outline" size="sm" onClick={() => setShowCloseDialog(true)} disabled={planExpired}>Encerrar</Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="px-6 py-4 space-y-4 m-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Ações corretivas</h3>
                <Button size="sm" variant="outline" onClick={() => setShowAddAction(true)} disabled={planExpired}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Adicionar ação
                </Button>
              </div>

              {showAddAction && (
                <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                  <Textarea value={newActionDesc} onChange={(e) => setNewActionDesc(e.target.value)} placeholder="Descrição da ação corretiva..." className="min-h-[60px]" />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => { setShowAddAction(false); setNewActionDesc(""); }}>Cancelar</Button>
                    <Button size="sm" onClick={handleAddAction} disabled={!newActionDesc.trim() || addAction.isPending}>Adicionar</Button>
                  </div>
                </div>
              )}

              {actions.length === 0 && !showAddAction && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma ação corretiva registrada.</p>
              )}

              <div className="space-y-3">
                {actions.map((action: any) => {
                  const asInfo = getActionStatusInfo(action.status);
                  return (
                    <div key={action.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm flex-1">{action.description}</p>
                        <Badge className={asInfo.color + " text-[10px] shrink-0"}>{asInfo.label}</Badge>
                      </div>
                      {action.status === "completed" && (
                        <div className="text-xs text-muted-foreground space-y-0.5 pl-2 border-l-2 border-green-200">
                          <p>Concluída em {formatDateTimeBR(action.completed_at)} por {action.completer?.full_name}</p>
                          {action.completion_notes && <p>"{action.completion_notes}"</p>}
                          {action.evidence_url && (
                            <a href={action.evidence_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                              <Download className="h-3 w-3" />{action.evidence_name || "Evidência"}
                            </a>
                          )}
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        {action.status === "pending" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateAction.mutate({ actionId: action.id, occurrenceId: occurrence.id, newStatus: "in_progress" })} disabled={planExpired}>
                            <Play className="h-3 w-3 mr-1" />Iniciar
                          </Button>
                        )}
                        {(action.status === "pending" || action.status === "in_progress") && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setCompleteActionId(action.id)} disabled={planExpired}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />Concluir
                          </Button>
                        )}
                        {action.status !== "completed" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deleteAction.mutate({ actionId: action.id, occurrenceId: occurrence.id })} disabled={planExpired}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="history" className="px-6 py-4 m-0">
              <div className="space-y-3">
                <div className="text-sm flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Ocorrência registrada por {occurrence.profiles?.full_name} em {formatDateTimeBR(occurrence.created_at)}
                </div>
                {actions.map((a: any) => (
                  <div key={a.id} className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                      Ação "{a.description.substring(0, 40)}..." adicionada por {a.creator?.full_name}
                    </div>
                    {a.status === "completed" && (
                      <div className="flex items-center gap-2 ml-4">
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                        Concluída por {a.completer?.full_name} em {formatDateTimeBR(a.completed_at)}
                      </div>
                    )}
                  </div>
                ))}
                {occurrence.status === "closed" && (
                  <div className="text-sm flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Ocorrência encerrada
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Complete action modal */}
      <Dialog open={!!completeActionId} onOpenChange={(o) => { if (!o) { setCompleteActionId(null); setCompletionNotes(""); setEvidenceFile(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Concluir ação</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Observações da conclusão</Label>
              <Textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} placeholder="Descreva o que foi feito..." />
            </div>
            <div className="space-y-2">
              <Label>Evidência (opcional)</Label>
              <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCompleteActionId(null); setCompletionNotes(""); setEvidenceFile(null); }}>Cancelar</Button>
            <Button onClick={handleCompleteAction} disabled={updateAction.isPending}>Confirmar conclusão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close occurrence dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Encerrar ocorrência</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja encerrar esta ocorrência? Ações pendentes não serão afetadas mas a ocorrência ficará marcada como encerrada.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>Cancelar</Button>
            <Button onClick={() => { closeOcc.mutate(occurrence.id); setShowCloseDialog(false); }} disabled={closeOcc.isPending}>Encerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxUrl(null)}><X className="h-8 w-8" /></button>
          <img src={lightboxUrl} alt="" className="max-w-full max-h-full object-contain rounded" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
