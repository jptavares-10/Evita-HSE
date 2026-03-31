import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface RegisterExecutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection: any;
  onSave: (values: any) => void;
  saving: boolean;
}

export function RegisterExecutionModal({ open, onOpenChange, inspection, onSave, saving }: RegisterExecutionModalProps) {
  const [executedAt, setExecutedAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [result, setResult] = useState("conforme");
  const [observations, setObservations] = useState("");

  const handleSubmit = () => {
    onSave({
      inspection_id: inspection.id,
      executed_at: executedAt,
      result,
      observations: observations || null,
      is_periodic: inspection.is_periodic,
      frequency_type: inspection.frequency_type,
      frequency_preset: inspection.frequency_preset,
      frequency_days: inspection.frequency_days,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Execução — {inspection?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Data da execução *</Label>
            <Input type="date" value={executedAt} onChange={(e) => setExecutedAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Resultado *</Label>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conforme">Conforme</SelectItem>
                <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                <SelectItem value="parcial">Parcialmente Conforme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} placeholder="Detalhe as observações da execução..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving || !executedAt}>
            {saving ? "Salvando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
