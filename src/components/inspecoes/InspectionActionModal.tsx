import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X } from "lucide-react";

interface InspectionActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: any | null; // null = new, with data = completing
  inspectionId: string;
  executionId?: string | null;
  onSave: (values: any) => void;
  saving: boolean;
  mode: "create" | "complete";
}

export function InspectionActionModal({ open, onOpenChange, action, inspectionId, executionId, onSave, saving, mode }: InspectionActionModalProps) {
  const { company } = useAuth();
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [completionNotes, setCompletionNotes] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (action && mode === "complete") {
      setDescription(action.description || "");
      setResponsible(action.responsible || "");
      setDueDate(action.due_date || "");
      setStatus("done");
      setCompletionNotes("");
      setEvidenceFile(null);
    } else {
      setDescription("");
      setResponsible("");
      setDueDate("");
      setStatus("pending");
      setCompletionNotes("");
      setEvidenceFile(null);
    }
  }, [action, mode, open]);

  const handleSubmit = async () => {
    let evidenceUrl: string | null = null;
    let evidenceName: string | null = null;

    if (evidenceFile && company) {
      setUploading(true);
      const path = `${company.id}/${inspectionId}/${Date.now()}_${evidenceFile.name}`;
      const { error } = await supabase.storage.from("inspection-files").upload(path, evidenceFile);
      setUploading(false);
      if (error) {
        console.error("Upload failed:", error);
        return;
      }
      evidenceUrl = path;
      evidenceName = evidenceFile.name;
    }

    onSave({
      id: mode === "complete" ? action?.id : undefined,
      inspection_id: inspectionId,
      execution_id: executionId || null,
      description,
      responsible: responsible || null,
      due_date: dueDate || null,
      status: mode === "complete" ? "done" : status,
      completion_notes: completionNotes || null,
      evidence_url: evidenceUrl,
      evidence_name: evidenceName,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "complete" ? "Concluir Ação Corretiva" : "Nova Ação Corretiva"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="O que precisa ser corrigido..."
              disabled={mode === "complete"}
            />
          </div>

          {mode === "create" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prazo</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {mode === "complete" && (
            <>
              <div className="space-y-2">
                <Label>Notas de conclusão *</Label>
                <Textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={2}
                  placeholder="Descreva o que foi feito..."
                />
              </div>

              <div className="space-y-2">
                <Label>Evidência (foto/documento)</Label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4" />
                    {evidenceFile ? evidenceFile.name : "Selecionar arquivo"}
                    <input type="file" className="hidden" onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)} accept="image/*,.pdf,.doc,.docx" />
                  </label>
                  {evidenceFile && (
                    <button onClick={() => setEvidenceFile(null)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || uploading || !description.trim() || (mode === "complete" && !completionNotes.trim())}
          >
            {saving || uploading ? "Salvando..." : mode === "complete" ? "Concluir ação" : "Criar ação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
