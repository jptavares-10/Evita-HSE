import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useSubmitReviewResponse, useConfirmRead } from "@/hooks/useDocumentReviews";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { formatDateBR } from "@/lib/documents";
import { FileText, ExternalLink, Upload } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assignment: any | null;
}

export function ReviewResponseDrawer({ open, onOpenChange, assignment }: Props) {
  const submitResponse = useSubmitReviewResponse();
  const confirmRead = useConfirmRead();

  const [hasRead, setHasRead] = useState(false);
  const [decision, setDecision] = useState<"approved" | "rejected" | "">("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const cycle = assignment?.document_review_cycles;
  const doc = cycle?.documents;
  const rev = cycle?.document_revisions;

  const fileUrl = useSignedUrl("documents-library", rev?.file_url ?? doc?.current_file_url);

  if (!assignment || !cycle || !doc) return null;

  const handleConfirmRead = async () => {
    if (assignment.status === "pending") {
      await confirmRead.mutateAsync(assignment.id);
    }
    setHasRead(true);
  };

  const handleSubmit = async () => {
    if (!decision) return;
    await submitResponse.mutateAsync({
      assignmentId: assignment.id,
      cycleId: cycle.id,
      decision,
      content,
      file,
    });
    setHasRead(false);
    setDecision("");
    setContent("");
    setFile(null);
    onOpenChange(false);
  };

  const isAlreadyResponded = assignment.status === "approved" || assignment.status === "rejected";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-base">
            Revisar — {doc.code && <span className="text-muted-foreground font-mono">{doc.code}</span>} {doc.title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
          {/* Document info */}
          <div className="bg-muted/50 rounded-md p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revisão</span>
              <span className="font-medium">{rev?.revision_number || doc.current_revision}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Enviado por</span>
              <span className="font-medium">{cycle.profiles?.full_name}</span>
            </div>
            {cycle.due_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prazo</span>
                <span className="font-medium">{formatDateBR(cycle.due_date)}</span>
              </div>
            )}
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline text-xs mt-1">
                <FileText className="h-3.5 w-3.5" />
                <span className="truncate">{rev?.file_name || doc.current_file_name}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {cycle.message && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm">
              <p className="text-xs font-medium text-blue-600 mb-1">Mensagem do autor:</p>
              <p className="text-blue-800 text-sm">{cycle.message}</p>
            </div>
          )}

          {isAlreadyResponded ? (
            <div className="text-center py-8 space-y-2">
              <Badge variant="outline" className={assignment.status === "approved" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                {assignment.status === "approved" ? "Aprovado" : "Modificações solicitadas"}
              </Badge>
              <p className="text-sm text-muted-foreground">Você já respondeu a esta revisão em {formatDateBR(assignment.responded_at)}.</p>
            </div>
          ) : (
            <>
              {/* Read confirmation */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="confirm-read"
                    checked={hasRead}
                    onCheckedChange={() => handleConfirmRead()}
                    disabled={hasRead}
                  />
                  <Label htmlFor="confirm-read" className="text-sm leading-snug cursor-pointer">
                    Confirmo que li e analisei o documento <span className="font-medium">{doc.title}</span> — <span className="font-medium">{rev?.revision_number || doc.current_revision}</span>
                  </Label>
                </div>
              </div>

              {/* Response */}
              {hasRead && (
                <div className="space-y-4 border-t pt-4 animate-fade-up">
                  <RadioGroup value={decision} onValueChange={(v) => setDecision(v as any)}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="approved" id="approve" />
                      <Label htmlFor="approve" className="cursor-pointer">Aprovo esta revisão</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="rejected" id="reject" />
                      <Label htmlFor="reject" className="cursor-pointer">Solicito modificações</Label>
                    </div>
                  </RadioGroup>

                  {decision && (
                    <div className="space-y-3 animate-fade-up">
                      <div className="space-y-2">
                        <Label>
                          {decision === "approved" ? "Comentário (opcional)" : "Descrição das modificações necessárias *"}
                        </Label>
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder={decision === "approved" ? "Adicione um comentário de aprovação se desejar..." : "Descreva detalhadamente as modificações necessárias..."}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{decision === "approved" ? "Anexar documento de suporte (opcional)" : "Anexar documento com marcações ou referências (opcional)"}</Label>
                        <div className="border-2 border-dashed rounded-md p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => document.getElementById("review-file-input")?.click()}>
                          {file ? (
                            <p className="text-sm text-primary">{file.name}</p>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                              <Upload className="h-5 w-5" />
                              <p className="text-xs">PDF, JPG ou PNG (máx 10MB)</p>
                            </div>
                          )}
                          <input
                            id="review-file-input"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f && f.size <= 10 * 1024 * 1024) setFile(f);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isAlreadyResponded && (
          <div className="border-t px-6 py-4 flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!decision || (decision === "rejected" && !content) || submitResponse.isPending}
              className="flex-1"
            >
              {submitResponse.isPending ? "Enviando..." : "Enviar resposta"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
