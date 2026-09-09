import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompleteAction } from "@/hooks/useOccurrences";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 20 * 1024 * 1024;

interface Props {
  action: any | null;
  occurrenceId: string;
  onClose: () => void;
}

export function CompleteActionDialog({ action, occurrenceId, onClose }: Props) {
  const { toast } = useToast();
  const complete = useCompleteAction();
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (action) { setNotes(""); setFiles([]); }
  }, [action?.id]);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    Array.from(list).forEach((f) => {
      if (!ALLOWED.includes(f.type)) {
        toast({ title: `${f.name}: use foto (JPG, PNG, WEBP) ou PDF.`, variant: "destructive" });
        return;
      }
      if (f.size > MAX_SIZE) {
        toast({ title: `${f.name}: arquivo acima de 20MB.`, variant: "destructive" });
        return;
      }
      accepted.push(f);
    });
    setFiles((prev) => [...prev, ...accepted]);
  };

  const handleSubmit = async () => {
    if (!action) return;
    await complete.mutateAsync({
      actionId: action.id,
      occurrenceId,
      completion_notes: notes,
      files,
    });
    onClose();
  };

  return (
    <Dialog open={!!action} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Concluir ação</DialogTitle>
          <DialogDescription className="line-clamp-2">{action?.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>O que foi feito *</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Descreva a solução aplicada." />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Evidências</Label>
            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed py-5 text-sm text-muted-foreground hover:bg-muted/50">
              <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              Clique para anexar fotos ou PDF (até 20MB cada)
            </label>
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span className="flex items-center gap-2 truncate"><FileText className="h-4 w-4 shrink-0" />{f.name}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!notes.trim() || complete.isPending}>
            {complete.isPending ? "Concluindo..." : "Concluir ação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
