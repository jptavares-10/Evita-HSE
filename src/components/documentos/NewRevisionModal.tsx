import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNewRevision } from "@/hooks/useDocuments";
import { suggestNextRevision, formatDateBR } from "@/lib/documents";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  document: any | null;
}

export function NewRevisionModal({ open, onOpenChange, document: doc }: Props) {
  const newRevision = useNewRevision();
  const { toast } = useToast();
  const [revNumber, setRevNumber] = useState("");
  const [revDate, setRevDate] = useState<Date>(new Date());
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && doc) {
      setRevNumber(suggestNextRevision(doc.current_revision));
      setRevDate(new Date());
      setFile(null);
      setNotes("");
    }
  }, [open, doc]);

  const handleSubmit = async () => {
    if (!doc) return;
    if (!revNumber.trim()) { toast({ title: "Número da revisão é obrigatório", variant: "destructive" }); return; }
    if (!file) { toast({ title: "Arquivo é obrigatório", variant: "destructive" }); return; }

    await newRevision.mutateAsync({
      documentId: doc.id,
      revision_number: revNumber.trim(),
      revision_date: format(revDate, "yyyy-MM-dd"),
      file,
      notes: notes || null,
    });
    onOpenChange(false);
  };

  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova revisão — {doc.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 bg-muted/50 rounded-md p-3 text-sm">
          {doc.code && <p><strong>Código:</strong> {doc.code}</p>}
          <p><strong>Revisão atual:</strong> {doc.current_revision} — emitida em {formatDateBR(doc.current_revision_date)}</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Novo número de revisão *</Label>
            <Input value={revNumber} onChange={(e) => setRevNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Data de emissão *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(revDate, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={revDate} onSelect={(d) => d && setRevDate(d)} className="p-3 pointer-events-auto" locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Upload do novo arquivo *</Label>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <p className="text-xs text-muted-foreground">PDF, DOC ou DOCX — máx 20MB</p>
          </div>
          <div className="space-y-2">
            <Label>Motivo da revisão</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Descreva o que mudou nesta revisão..." />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={newRevision.isPending}>
            {newRevision.isPending ? "Publicando..." : "Publicar revisão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
