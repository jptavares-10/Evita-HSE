import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignedAvatarImage } from "@/components/ui/signed-avatar-image";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyProfiles, useStartReviewCycle } from "@/hooks/useDocumentReviews";
import { useDocumentRevisions } from "@/hooks/useDocuments";
import { formatDateBR } from "@/lib/documents";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { FileText, ExternalLink, Search, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  document: any | null;
}

export function StartReviewCycleDrawer({ open, onOpenChange, document: doc }: Props) {
  const { profile } = useAuth();
  const { data: profiles = [] } = useCompanyProfiles();
  const { data: revisions = [] } = useDocumentRevisions(doc?.id ?? null);
  const startCycle = useStartReviewCycle();
  const currentFileUrl = useSignedUrl("documents-library", doc?.current_file_url);

  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [requireAll, setRequireAll] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  if (!doc) return null;

  const latestRevision = revisions[0];
  const availableProfiles = profiles.filter((p: any) => p.id !== profile?.id);
  const filteredProfiles = availableProfiles.filter((p: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
  });

  const toggleReviewer = (id: string) => {
    setSelectedReviewers((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedReviewers.length === 0 || !latestRevision) return;
    const title = `Revisão ${doc.current_revision} — ${doc.title}`;
    await startCycle.mutateAsync({
      documentId: doc.id,
      revisionId: latestRevision.id,
      title,
      reviewerIds: selectedReviewers,
      dueDate: dueDate || null,
      message: message || null,
      requireAllResponses: requireAll,
      commentsVisible,
    });
    setSelectedReviewers([]);
    setRequireAll(false);
    setCommentsVisible(true);
    setDueDate("");
    setMessage("");
    onOpenChange(false);
  };

  const initials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "?";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-base">
            Novo ciclo de revisão — {doc.code && <span className="text-muted-foreground font-mono">{doc.code}</span>} {doc.title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
          {/* Read-only info */}
          <div className="bg-muted/50 rounded-md p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revisão atual</span>
              <span className="font-medium">{doc.current_revision} — {formatDateBR(doc.current_revision_date)}</span>
            </div>
            {currentFileUrl && (
              <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline text-xs">
                <FileText className="h-3.5 w-3.5" />
                <span className="truncate">{doc.current_file_name}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Reviewers */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Selecionar revisores</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Selecione os usuários da empresa que devem revisar este documento.</p>
            </div>

            {selectedReviewers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedReviewers.map((rid) => {
                  const p = profiles.find((pr: any) => pr.id === rid);
                  return (
                    <Badge key={rid} variant="secondary" className="gap-1 pr-1">
                      {p?.full_name}
                      <button onClick={() => toggleReviewer(rid)} className="hover:bg-muted rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="border rounded-md max-h-48 overflow-y-auto divide-y">
              {filteredProfiles.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 text-center">Nenhum usuário encontrado</p>
              ) : (
                filteredProfiles.map((p: any) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedReviewers.includes(p.id)}
                      onCheckedChange={() => toggleReviewer(p.id)}
                    />
                    <Avatar className="h-7 w-7">
                      <SignedAvatarImage path={p.avatar_url} alt="" />
                      <AvatarFallback className="text-[10px]">{initials(p.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.full_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{p.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="require-all" className="text-sm cursor-pointer">
                Exigir resposta de todos os revisores antes de permitir aprovação
              </Label>
              <Switch id="require-all" checked={requireAll} onCheckedChange={setRequireAll} />
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label>Data limite para resposta (opcional)</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Mensagem para os revisores (opcional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Favor revisar especialmente a seção 4.2 e verificar conformidade com a NR-35 atualizada."
              rows={3}
            />
          </div>

          {/* Comments visibility */}
          <div className="flex items-center justify-between">
            <Label htmlFor="comments-visible" className="text-sm cursor-pointer">
              Revisores podem ver os comentários dos outros revisores
            </Label>
            <Switch id="comments-visible" checked={commentsVisible} onCheckedChange={setCommentsVisible} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedReviewers.length === 0 || startCycle.isPending}
            className="flex-1"
          >
            {startCycle.isPending ? "Iniciando..." : "Iniciar ciclo"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
