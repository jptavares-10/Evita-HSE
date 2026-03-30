import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useSaveTraining, useSectors, useTrainingSectorRules, useSaveTrainingSectorRules } from "@/hooks/useTrainings";
import { formatValidityLabel } from "@/lib/trainings";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training?: any;
}

export function TrainingDrawer({ open, onOpenChange, training }: Props) {
  const save = useSaveTraining();
  const saveSectorRules = useSaveTrainingSectorRules();
  const { data: sectors = [] } = useSectors();
  const { data: sectorRules = [] } = useTrainingSectorRules();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hasExpiry, setHasExpiry] = useState(true);
  const [validityMonths, setValidityMonths] = useState(24);
  const [alertDays, setAlertDays] = useState(30);
  const [selectedSectorIds, setSelectedSectorIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(training?.name || "");
      setDescription(training?.description || "");
      setHasExpiry(training?.has_expiry !== false);
      setValidityMonths(training?.validity_months || 24);
      setAlertDays(training?.alert_days_before || 30);
      if (training?.id) {
        const existing = sectorRules.filter((r: any) => r.training_id === training.id).map((r: any) => r.sector_id);
        setSelectedSectorIds(existing);
      } else {
        setSelectedSectorIds([]);
      }
    }
  }, [open, training, sectorRules]);

  const toggleSector = (sectorId: string) => {
    setSelectedSectorIds(prev =>
      prev.includes(sectorId) ? prev.filter(id => id !== sectorId) : [...prev, sectorId]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    save.mutate({
      id: training?.id,
      name: name.trim(),
      description: description.trim() || null,
      has_expiry: hasExpiry,
      validity_months: hasExpiry ? validityMonths : null,
      alert_days_before: alertDays,
    }, {
      onSuccess: (trainingId) => {
        if (trainingId) {
          saveSectorRules.mutate({ trainingId, sectorIds: selectedSectorIds });
        }
        onOpenChange(false);
      },
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed right-0 top-0 bottom-0 w-full max-w-md rounded-none border-l flex flex-col mb-0 mt-[96px] ml-[870px]">
        <DrawerHeader><DrawerTitle>{training ? "Editar treinamento" : "Novo treinamento"}</DrawerTitle></DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          <div><Label>Nome *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: NR-35 — Trabalho em altura" /></div>
          <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" rows={3} /></div>
          <div className="flex items-center gap-3">
            <Switch checked={hasExpiry} onCheckedChange={setHasExpiry} />
            <Label>{hasExpiry ? "Possui vencimento" : "Sem vencimento"}</Label>
          </div>
          {hasExpiry && (
            <>
              <div>
                <Label>Validade em meses *</Label>
                <Input type="number" min={1} value={validityMonths} onChange={(e) => setValidityMonths(Number(e.target.value))} />
                <p className="text-xs text-muted-foreground mt-1">Equivale a {formatValidityLabel(validityMonths)}</p>
              </div>
              <div>
                <Label>Avisar com antecedência de (dias)</Label>
                <Input type="number" min={1} value={alertDays} onChange={(e) => setAlertDays(Number(e.target.value))} />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Setores obrigatórios</Label>
            <p className="text-xs text-muted-foreground">
              Todos os cargos vinculados aos setores selecionados terão este treinamento como obrigatório.
            </p>
            {sectors.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhum setor cadastrado. Crie setores na tela de Cargos.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {sectors.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`sector-${s.id}`}
                      checked={selectedSectorIds.includes(s.id)}
                      onCheckedChange={() => toggleSector(s.id)}
                    />
                    <label htmlFor={`sector-${s.id}`} className="text-sm cursor-pointer">{s.name}</label>
                  </div>
                ))}
              </div>
            )}
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
