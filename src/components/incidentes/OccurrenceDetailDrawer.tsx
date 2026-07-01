import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Calendar, MapPin, User, Pencil, FileText, X } from "lucide-react";
import { useSignedUrls, useSignedUrl } from "@/hooks/useSignedUrl";
import { getTypeInfo, getSeverityInfo, getStatusInfo, getBodyPartLabel, formatDateTimeBR } from "@/lib/occurrences";
import { useOccurrenceEmployees, useOccurrenceAttachments, useCorrectiveActions, useCloseOccurrence } from "@/hooks/useOccurrences";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { usePermission } from "@/hooks/usePermission";
import { InvestigationPanel } from "./investigation/InvestigationPanel";
import { ActionPlan5W2H } from "./investigation/ActionPlan5W2H";
import { LessonPublisher } from "./investigation/LessonPublisher";
import { OccurrenceLegalPanel } from "./investigation/OccurrenceLegalPanel";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occurrence: any;
  onEdit: () => void;
  planExpired?: boolean;
}

export function OccurrenceDetailDrawer({ open, onOpenChange, occurrence, onEdit, planExpired }: Props) {
  const { canEdit } = usePermission("ic_nc");
  const [tab, setTab] = useState("details");
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [lightboxPath, setLightboxPath] = useState<string | null>(null);

  const { data: employees = [] } = useOccurrenceEmployees(occurrence?.id ?? null);
  const { data: attachments = [] } = useOccurrenceAttachments(occurrence?.id ?? null);
  const { data: actions = [] } = useCorrectiveActions(occurrence?.id ?? null);
  const closeOcc = useCloseOccurrence();
  // Resolve signed URLs for all attachment file_urls + evidence_urls
  const allFileUrls = useMemo(() => attachments.map((a: any) => a.file_url).filter(Boolean), [attachments]);
  const signedMap = useSignedUrls("occurrence-files", allFileUrls);
  const lightboxSignedUrl = useSignedUrl("occurrence-files", lightboxPath);

  if (!occurrence) return null;

  const typeInfo = getTypeInfo(occurrence.type);
  const severityInfo = getSeverityInfo(occurrence.severity);
  const statusInfo = getStatusInfo(occurrence.status);

  const images = attachments.filter((a: any) => a.file_type === "image");
  const documents = attachments.filter((a: any) => a.file_type === "document");
  const completedActions = actions.filter((a: any) => a.status === "completed").length;
  const missingCat = occurrence.cat_required && !occurrence.cat_number;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2 flex-wrap">
              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
              <Badge className={severityInfo.color}>{severityInfo.label}</Badge>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              {missingCat && <Badge className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" />CAT pendente</Badge>}
            </SheetTitle>
          </SheetHeader>

          <Tabs value={tab} onValueChange={setTab} className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b px-6 overflow-x-auto">
              <TabsTrigger value="details">Ocorrência</TabsTrigger>
              <TabsTrigger value="investigation">Investigação</TabsTrigger>
              <TabsTrigger value="actions" className="gap-1.5">
                Plano 5W2H
                {actions.length > 0 && <span className="text-[10px] bg-primary/10 text-primary rounded-full px-1.5">{completedActions}/{actions.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="lesson">Lição</TabsTrigger>
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
                    <p className="text-sm">
                      {occurrence.with_leave
                        ? `Com afastamento${occurrence.lost_days > 0 ? ` — ${occurrence.lost_days} dia(s)` : ""}`
                        : "Sem afastamento"}
                    </p>
                  )}
                </div>
              )}

              {occurrence.cause_analysis && (
                <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Análise de causa</p><p className="text-sm whitespace-pre-wrap">{occurrence.cause_analysis}</p></div>
              )}

              {occurrence.type === "incident" && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Comunicação legal & custo</p>
                  <OccurrenceLegalPanel occurrence={occurrence} canEdit={canEdit} disabled={planExpired} />
                </div>
              )}

              {/* Images */}
              {images.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Fotos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img: any) => (
                      <button key={img.id} onClick={() => setLightboxPath(img.file_url)} className="aspect-square rounded-md overflow-hidden border hover:opacity-80 transition-opacity">
                        {signedMap[img.file_url] ? (
                          <img src={signedMap[img.file_url]} alt={img.file_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted animate-pulse" />
                        )}
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
                      <a key={doc.id} href={signedMap[doc.file_url] || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <FileText className="h-3.5 w-3.5" />{doc.file_name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">Registrado por {occurrence.profiles?.full_name} em {formatDateTimeBR(occurrence.created_at)}</p>

              {canEdit && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={onEdit} disabled={planExpired}><Pencil className="h-3.5 w-3.5 mr-1" />Editar</Button>
                  {occurrence.status !== "closed" && (
                    <Button variant="outline" size="sm" onClick={() => setShowCloseDialog(true)} disabled={planExpired}>Encerrar</Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="investigation" className="px-6 py-4 m-0">
              <InvestigationPanel occurrenceId={occurrence.id} canEdit={canEdit} disabled={planExpired} />
            </TabsContent>

            <TabsContent value="actions" className="px-6 py-4 m-0">
              <ActionPlan5W2H occurrenceId={occurrence.id} canEdit={canEdit} disabled={planExpired} />
            </TabsContent>

            <TabsContent value="lesson" className="px-6 py-4 m-0">
              <LessonPublisher occurrence={occurrence} canEdit={canEdit} disabled={planExpired} />
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
      {lightboxPath && lightboxSignedUrl && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setLightboxPath(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxPath(null)}><X className="h-8 w-8" /></button>
          <img src={lightboxSignedUrl} alt="" className="max-w-full max-h-full object-contain rounded" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
