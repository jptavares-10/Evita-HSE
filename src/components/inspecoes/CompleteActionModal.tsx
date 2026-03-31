import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompleteAction } from "@/hooks/useInspections";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  action: any;
  executionId: string;
}

export function CompleteActionModal({ open, onOpenChange, action, executionId }: Props) {
  const completeAction = useCompleteAction();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!file || !action) return;
    await completeAction.mutateAsync({
      actionId: action.id,
      execution_id: executionId,
      file,
      completion_notes: notes.trim() || null,
    });
    setFile(null);
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Concluir ação — {action?.description?.slice(0, 50)}...</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Evidência de que a correção foi feita * (PDF/JPG/PNG, máx 20MB)</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size <= 20 * 1024 * 1024) setFile(f);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Observações da conclusão</Label>
            <Textarea placeholder="Opcional..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!file || completeAction.isPending}>
              {completeAction.isPending ? "Concluindo..." : "Concluir ação"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
