import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveTraining } from "@/hooks/useTrainings";
import { formatValidityLabel } from "@/lib/trainings";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training?: any;
}

export function TrainingDrawer({ open, onOpenChange, training }: Props) {
  const save = useSaveTraining();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validityMonths, setValidityMonths] = useState(24);
  const [alertDays, setAlertDays] = useState(30);

  useEffect(() => {
    if (open) {
      setName(training?.name || "");
      setDescription(training?.description || "");
      setValidityMonths(training?.validity_months || 24);
      setAlertDays(training?.alert_days_before || 30);
    }
  }, [open, training]);

  const handleSave = () => {
    if (!name.trim()) return;
    save.mutate({ id: training?.id, name: name.trim(), description: description.trim() || null, validity_months: validityMonths, alert_days_before: alertDays }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed right-0 top-0 bottom-0 w-full max-w-md rounded-none border-l flex flex-col">
        <DrawerHeader><DrawerTitle>{training ? "Editar treinamento" : "Novo treinamento"}</DrawerTitle></DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          <div><Label>Nome *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: NR-35 — Trabalho em altura" /></div>
          <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" rows={3} /></div>
          <div>
            <Label>Validade em meses *</Label>
            <Input type="number" min={1} value={validityMonths} onChange={(e) => setValidityMonths(Number(e.target.value))} />
            <p className="text-xs text-muted-foreground mt-1">Equivale a {formatValidityLabel(validityMonths)}</p>
          </div>
          <div>
            <Label>Avisar com antecedência de (dias)</Label>
            <Input type="number" min={1} value={alertDays} onChange={(e) => setAlertDays(Number(e.target.value))} />
          </div>
        </div>
        <DrawerFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || save.isPending}>Salvar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
