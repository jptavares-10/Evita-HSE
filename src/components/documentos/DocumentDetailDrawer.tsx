import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDocumentRevisions, useDocumentServiceLinks } from "@/hooks/useDocuments";
import { useDocumentReviewCycles } from "@/hooks/useDocumentReviews";
import { getDocStatusBadgeInfo, formatDateBR, formatDateTimeBR, getRevisionCycleStatus, getRevisionCycleBadgeInfo, formatFrequencyDays } from "@/lib/documents";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { ReviewCyclePanel } from "@/components/documentos/ReviewCyclePanel";
import { StartReviewCycleDrawer } from "@/components/documentos/StartReviewCycleDrawer";
import { Pencil, FileText, Clock, ExternalLink, Link2, CalendarClock, GitPullRequestArrow } from "lucide-react";
import { getSignedUrl } from "@/lib/storage-utils";
import { usePermission } from "@/hooks/usePermission";
import { usePlan } from "@/hooks/usePlan";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  document: any | null;
  onEdit: () => void;
  onNewRevision: () => void;
  isExpired: boolean;
}

export function DocumentDetailDrawer({ open, onOpenChange, document: doc, onEdit, onNewRevision, isExpired }: Props) {
  const { canEdit } = usePermission("document_library");
  const { hasModule } = usePlan();
  const canReview = hasModule("document_review");
  const { data: revisions = [] } = useDocumentRevisions(doc?.id ?? null);
  const { data: serviceLinks = [] } = useDocumentServiceLinks(doc?.id ?? null);
  const { data: cycles = [] } = useDocumentReviewCycles(doc?.id ?? null);
  const currentFileUrl = useSignedUrl("documents-library", doc?.current_file_url);
  const [startCycleOpen, setStartCycleOpen] = useState(false);

  if (!doc) return null;
  const statusInfo = getDocStatusBadgeInfo(doc.status);
  const revCycleStatus = getRevisionCycleStatus(doc);
  const revCycleBadge = getRevisionCycleBadgeInfo(revCycleStatus);

  const activeCycle = cycles.find((c: any) => c.status === "open" || c.status === "reviewing");
  const hasActiveCycle = !!activeCycle;
  const hasCycles = cycles.length > 0;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle className="flex items-center gap-2 flex-wrap">
              {doc.code && <span className="text-muted-foreground font-mono text-sm">{doc.code}</span>}
              {doc.title}
              <Badge variant="outline" className={`text-[10px] ${statusInfo.className}`}>{statusInfo.label}</Badge>
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 w-auto">
              <TabsTrigger value="details" className="flex-1">Documento</TabsTrigger>
              <TabsTrigger value="history" className="flex-1 gap-1.5">
                Histórico
                {revisions.length > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[10px]">{revisions.length}</Badge>
                )}
              </TabsTrigger>
              {hasCycles && (
                <TabsTrigger value="review" className="flex-1 gap-1.5">
                  Ciclo de revisão
                  {hasActiveCycle && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</p>
                  <p className="font-medium">{doc.document_types?.name || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revisão atual</p>
                  <p className="font-medium">{doc.current_revision}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data de emissão</p>
                  <p className="font-medium">{formatDateBR(doc.current_revision_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Responsável</p>
                  <p className="font-medium">{doc.responsible || "—"}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Área / setor</p>
                  <p className="font-medium">{doc.area || "—"}</p>
                </div>
              </div>

              {/* Revision cycle info */}
              {doc.has_revision_cycle && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5" />Ciclo de revisão
                  </p>
                  <div className="bg-muted/50 rounded-md p-3 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Periodicidade</span>
                      <span className="font-medium">{formatFrequencyDays(doc.revision_frequency_days)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Próxima revisão</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatDateBR(doc.next_revision_at)}</span>
                        {revCycleBadge && (
                          <Badge variant="outline" className={`text-[10px] ${revCycleBadge.className}`}>
                            {revCycleBadge.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active cycle warning */}
              {hasActiveCycle && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800">
                  Revisão em processo de aprovação. Aguarde a conclusão do ciclo.
                </div>
              )}

              {doc.description && (
                <div className="space-y-1.5 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3">{doc.description}</p>
                </div>
              )}

              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Documento atual</p>
                {currentFileUrl ? (
                  <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-2 rounded-md hover:bg-muted/80 transition-colors">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate text-primary">{doc.current_file_name}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum documento anexado</p>
                )}
              </div>

              {serviceLinks.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" />Serviços vinculados
                  </p>
                  {serviceLinks.map((sl: any) => (
                    <div key={sl.id} className="text-sm bg-muted/50 px-3 py-2 rounded-md">
                      {sl.periodic_services?.name || "—"}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-muted-foreground border-t pt-3">
                Registrado por {doc.profiles?.full_name || "—"} em {formatDateBR(doc.created_at)}
              </p>

              {canEdit && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onEdit} className="flex-1" disabled={isExpired}>
                      <Pencil className="h-4 w-4 mr-2" />Editar documento
                    </Button>
                    {hasActiveCycle ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <Button variant="outline" className="w-full" disabled>
                              <FileText className="h-4 w-4 mr-2" />Nova revisão
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Encerre o ciclo de revisão atual antes de enviar uma nova revisão.</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button variant="outline" onClick={onNewRevision} className="flex-1" disabled={isExpired}>
                        <FileText className="h-4 w-4 mr-2" />Nova revisão
                      </Button>
                    )}
                  </div>
                  {!hasActiveCycle && canReview && (
                    <Button variant="outline" onClick={() => setStartCycleOpen(true)} disabled={isExpired} className="w-full">
                      <GitPullRequestArrow className="h-4 w-4 mr-2" />Iniciar ciclo de revisão
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
              {revisions.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Clock className="h-10 w-10 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Nenhuma revisão registrada.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                  {revisions.map((r: any, idx: number) => {
                    const isCurrent = idx === 0;
                    return (
                      <RevisionEntry key={r.id} revision={r} isCurrent={isCurrent} />
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {hasCycles && (
              <TabsContent value="review" className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
                <ReviewCyclePanel documentId={doc.id} />
              </TabsContent>
            )}
          </Tabs>
        </SheetContent>
      </Sheet>

      <StartReviewCycleDrawer
        open={startCycleOpen}
        onOpenChange={setStartCycleOpen}
        document={doc}
      />
    </>
  );
}

function RevisionEntry({ revision: r, isCurrent }: { revision: any; isCurrent: boolean }) {
  const signedUrl = useSignedUrl("documents-library", r.file_url);

  return (
    <div className="relative">
      <div className="absolute -left-6 top-1.5 h-[18px] w-[18px] rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
        <Clock className="h-2.5 w-2.5 text-primary" />
      </div>
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{r.revision_number}</span>
          {isCurrent ? (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]" variant="outline">Atual</Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[10px]" variant="outline">Anterior</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">📅 {formatDateBR(r.revision_date)}</p>
        {r.notes && <p className="text-xs">📝 {r.notes}</p>}
        {signedUrl && (
          <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
            <FileText className="h-3 w-3" />
            {r.file_name}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <p className="text-[11px] text-muted-foreground">
          👤 Enviado por {r.profiles?.full_name || "—"} em {formatDateTimeBR(r.uploaded_at)}
        </p>
      </div>
    </div>
  );
}
