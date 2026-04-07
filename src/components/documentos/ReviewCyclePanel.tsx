import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import {
  useDocumentReviewCycles,
  useReviewAssignments,
  useReviewComments,
  useApproveCycle,
  useRejectCycle,
  useCancelCycle,
  useResolveComment,
} from "@/hooks/useDocumentReviews";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { formatDateBR, formatDateTimeBR } from "@/lib/documents";
import { Check, X, Clock, MessageSquare, FileText, ExternalLink, AlertTriangle } from "lucide-react";

function getCycleStatusBadge(status: string) {
  switch (status) {
    case "open": return { label: "Aguardando respostas", className: "bg-blue-100 text-blue-700 border-blue-200" };
    case "reviewing": return { label: "Em revisão", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    case "approved": return { label: "Aprovado", className: "bg-green-100 text-green-700 border-green-200" };
    case "rejected": return { label: "Reprovado", className: "bg-red-100 text-red-700 border-red-200" };
    case "cancelled": return { label: "Cancelado", className: "bg-gray-100 text-gray-500 border-gray-200" };
    default: return { label: status, className: "" };
  }
}

function getAssignmentStatusBadge(status: string) {
  switch (status) {
    case "pending": return { label: "Pendente", className: "bg-gray-100 text-gray-600 border-gray-200" };
    case "read": return { label: "Leu", className: "bg-blue-100 text-blue-600 border-blue-200" };
    case "approved": return { label: "Aprovou", className: "bg-green-100 text-green-700 border-green-200" };
    case "rejected": return { label: "Solicitou modificações", className: "bg-red-100 text-red-700 border-red-200" };
    default: return { label: status, className: "" };
  }
}

interface Props {
  documentId: string;
}

export function ReviewCyclePanel({ documentId }: Props) {
  const { profile } = useAuth();
  const { data: cycles = [] } = useDocumentReviewCycles(documentId);

  if (cycles.length === 0) return null;

  const activeCycle = cycles.find((c: any) => c.status === "open" || c.status === "reviewing");
  const pastCycles = cycles.filter((c: any) => c.status !== "open" && c.status !== "reviewing");

  return (
    <div className="space-y-4">
      {activeCycle && (
        <ActiveCycleView cycle={activeCycle} isAuthor={activeCycle.created_by === profile?.id} />
      )}

      {pastCycles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Histórico de ciclos</p>
          <Accordion type="single" collapsible>
            {pastCycles.map((c: any) => {
              const badge = getCycleStatusBadge(c.status);
              return (
                <AccordionItem key={c.id} value={c.id}>
                  <AccordionTrigger className="text-sm py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span>{c.title}</span>
                      <Badge variant="outline" className={`text-[10px] ${badge.className}`}>{badge.label}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CycleContent cycle={c} readOnly />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}
    </div>
  );
}

function ActiveCycleView({ cycle, isAuthor }: { cycle: any; isAuthor: boolean }) {
  const badge = getCycleStatusBadge(cycle.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Badge variant="outline" className={`${badge.className}`}>{badge.label}</Badge>
        <p className="text-xs text-muted-foreground">
          Iniciado em {formatDateBR(cycle.created_at)}
          {cycle.due_date && <> · Prazo: {formatDateBR(cycle.due_date)}</>}
        </p>
      </div>
      <CycleContent cycle={cycle} readOnly={false} isAuthor={isAuthor} />
    </div>
  );
}

function CycleContent({ cycle, readOnly = false, isAuthor = false }: { cycle: any; readOnly?: boolean; isAuthor?: boolean }) {
  const { data: assignments = [] } = useReviewAssignments(cycle.id);
  const { data: comments = [] } = useReviewComments(cycle.id);
  const approveCycle = useApproveCycle();
  const rejectCycle = useRejectCycle();
  const cancelCycle = useCancelCycle();
  const resolveComment = useResolveComment();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  const respondedCount = assignments.filter((a: any) => a.status === "approved" || a.status === "rejected").length;
  const totalCount = assignments.length;
  const progress = totalCount > 0 ? (respondedCount / totalCount) * 100 : 0;
  const unresolvedModifications = comments.filter((c: any) => c.comment_type === "modification" && !c.is_resolved);
  const pendingReviewers = assignments.filter((a: any) => a.status === "pending" || a.status === "read");
  const canApprove = !readOnly && isAuthor && respondedCount > 0 &&
    (!cycle.require_all_responses || pendingReviewers.length === 0);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span>{respondedCount} de {totalCount} revisores responderam</span>
          <span className="tabular-nums">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Reviewers list */}
      <div className="space-y-2">
        {assignments.map((a: any) => {
          const sBadge = getAssignmentStatusBadge(a.status);
          const reviewerComments = comments.filter((c: any) => c.assignment_id === a.id);
          const initials = a.profiles?.full_name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "?";

          return (
            <div key={a.id} className="bg-muted/50 rounded-md p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={a.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium flex-1">{a.profiles?.full_name}</span>
                <Badge variant="outline" className={`text-[10px] ${sBadge.className}`}>{sBadge.label}</Badge>
              </div>

              {a.responded_at && (
                <p className="text-xs text-muted-foreground">
                  {a.status === "approved" ? "✅ Aprovado" : "⚠️ Solicita modificações"} — {formatDateTimeBR(a.responded_at)}
                </p>
              )}

              {reviewerComments.map((c: any) => (
                <CommentCard
                  key={c.id}
                  comment={c}
                  canResolve={!readOnly && isAuthor}
                  onResolve={() => { setResolveId(c.id); setResolveNotes(""); }}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Author actions */}
      {!readOnly && isAuthor && respondedCount > 0 && (
        <div className="space-y-3 border-t pt-4">
          {unresolvedModifications.length > 0 && (
            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-md p-2.5 text-xs text-yellow-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Existem {unresolvedModifications.length} solicitações de modificação em aberto. Você pode aprovar assim mesmo ou resolver primeiro.</span>
            </div>
          )}
          <div className="flex gap-2">
            {canApprove ? (
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setApproveOpen(true)}>
                <Check className="h-4 w-4 mr-1.5" />Aprovar revisão
              </Button>
            ) : cycle.require_all_responses && pendingReviewers.length > 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    <Button className="w-full" disabled>
                      <Check className="h-4 w-4 mr-1.5" />Aprovar revisão
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Aguardando resposta de {pendingReviewers.length} revisores</TooltipContent>
              </Tooltip>
            ) : null}
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => setRejectOpen(true)}>
              <X className="h-4 w-4 mr-1.5" />Reprovar
            </Button>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setCancelOpen(true)}>
              Cancelar ciclo
            </Button>
          </div>
        </div>
      )}

      {/* Approve dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar revisão</DialogTitle>
            <DialogDescription>Confirme a aprovação desta revisão do documento.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancelar</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={async () => {
              await approveCycle.mutateAsync({ cycleId: cycle.id });
              setApproveOpen(false);
            }} disabled={approveCycle.isPending}>
              {approveCycle.isPending ? "Aprovando..." : "Confirmar aprovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar revisão</DialogTitle>
            <DialogDescription>A revisão será marcada como reprovada e uma nova revisão deverá ser enviada.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo da reprovação..."
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={async () => {
              await rejectCycle.mutateAsync({ cycleId: cycle.id, reason: rejectReason });
              setRejectOpen(false);
              setRejectReason("");
            }} disabled={!rejectReason || rejectCycle.isPending}>
              {rejectCycle.isPending ? "Reprovando..." : "Confirmar reprovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar ciclo de revisão</DialogTitle>
            <DialogDescription>O ciclo será encerrado e os revisores não precisarão mais responder.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Voltar</Button>
            <Button variant="destructive" onClick={async () => {
              await cancelCycle.mutateAsync(cycle.id);
              setCancelOpen(false);
            }} disabled={cancelCycle.isPending}>
              {cancelCycle.isPending ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve dialog */}
      <Dialog open={!!resolveId} onOpenChange={(v) => !v && setResolveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como resolvido</DialogTitle>
            <DialogDescription>Descreva como a modificação solicitada foi tratada (opcional).</DialogDescription>
          </DialogHeader>
          <Textarea
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            placeholder="Como foi resolvido?"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveId(null)}>Cancelar</Button>
            <Button onClick={async () => {
              if (resolveId) await resolveComment.mutateAsync({ commentId: resolveId, notes: resolveNotes });
              setResolveId(null);
              setResolveNotes("");
            }} disabled={resolveComment.isPending}>
              Confirmar resolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CommentCard({ comment: c, canResolve, onResolve }: { comment: any; canResolve: boolean; onResolve: () => void }) {
  const signedUrl = useSignedUrl("review-attachments", c.attachment_url);

  return (
    <div className="bg-background rounded border p-2.5 space-y-1.5 text-xs">
      <p className="whitespace-pre-wrap">{c.content}</p>
      {signedUrl && (
        <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
          <FileText className="h-3 w-3" />
          <span className="truncate">{c.attachment_name}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
      <div className="flex items-center gap-2 pt-1">
        {c.comment_type === "modification" && (
          c.is_resolved ? (
            <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700 border-green-200">Resolvido</Badge>
          ) : (
            <>
              <Badge variant="outline" className="text-[10px] bg-orange-100 text-orange-700 border-orange-200">Modificação solicitada</Badge>
              {canResolve && (
                <button onClick={onResolve} className="text-primary hover:underline text-[10px]">Marcar como resolvido</button>
              )}
            </>
          )
        )}
        {c.comment_type === "approval" && (
          <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700 border-green-200">Aprovação</Badge>
        )}
      </div>
    </div>
  );
}
