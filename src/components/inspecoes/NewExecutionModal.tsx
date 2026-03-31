import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateExecution, useInspectionModels } from "@/hooks/useInspections";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
  profiles: any[];
}

export function NewExecutionModal({ open, onOpenChange, onCreated, profiles }: Props) {
  const { data: models = [] } = useInspectionModels();
  const createExecution = useCreateExecution();
  const activeModels = models.filter((m: any) => m.status === "active");

  const [modelId, setModelId] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const selectedModel = modelId ? activeModels.find((m: any) => m.id === modelId) : null;

  const handleSave = async () => {
    if (!modelId || !dueDate || !selectedModel) return;
    const id = await createExecution.mutateAsync({
      model_id: modelId,
      model_name: selectedModel.name,
      due_date: dueDate,
    });
    setModelId("");
    setDueDate(format(new Date(), "yyyy-MM-dd"));
    onOpenChange(false);
    onCreated(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova execução manual</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Modelo de inspeção *</Label>
            <Select value={modelId} onValueChange={setModelId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo..." />
              </SelectTrigger>
              <SelectContent>
                {activeModels.map((m: any) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data prevista *</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          {selectedModel?.profiles && (
            <p className="text-xs text-muted-foreground">Responsável padrão: {selectedModel.profiles.full_name}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!modelId || !dueDate || createExecution.isPending}>
              {createExecution.isPending ? "Criando..." : "Criar execução"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
