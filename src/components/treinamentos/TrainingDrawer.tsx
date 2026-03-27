import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSaveTraining, useSectors, useTrainingSectorRules } from "@/hooks/useTrainings";
import { formatValidityLabel } from "@/lib/trainings";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training?: any;
}

export function TrainingDrawer({ open, onOpenChange, training }: Props) {
  const save = useSaveTraining();
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
        setSelectedSectorIds(sectorRules.filter((r: any) => r.training_id === training.id).map((r: any) => r.sector_id));
      } else {
        setSelectedSectorIds([]);
      }
    }
  }, [open, training, sectorRules]);

  const handleSave = () => {
    if (!name.trim()) return;
    save.mutate({
      id: training?.id,
      name: name.trim(),
      description: description.trim() || null,
      has_expiry: hasExpiry,
      validity_months: hasExpiry ? validityMonths : null,
      alert_days_before: alertDays,
      sector_ids: selectedSectorIds,
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const toggleSector = (sectorId: string) => {
    setSelectedSectorIds((prev) =>
      prev.includes(sectorId) ? prev.filter((id) => id !== sectorId) : [...prev, sectorId]
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed right-0 top-0 bottom-0 w-full max-w-md rounded-none border-l flex flex-col">
        <DrawerHeader className="px-6 pt-6 pb-4">
          <DrawerTitle>{training ? "Editar treinamento" : "Novo treinamento"}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 space-y-5">
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: NR-35 — Trabalho em altura" />
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" rows={3} />
          </div>

          <div className="flex items-center gap-3 py-1">
            <Switch checked={hasExpiry} onCheckedChange={setHasExpiry} />
            <Label className="cursor-pointer" onClick={() => setHasExpiry(!hasExpiry)}>
              Este treinamento tem validade
            </Label>
            {!hasExpiry && <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Sem vencimento</Badge>}
          </div>

          {hasExpiry && (
            <>
              <div className="space-y-1.5">
                <Label>Validade em meses *</Label>
                <Input type="number" min={1} value={validityMonths} onChange={(e) => setValidityMonths(Number(e.target.value))} />
                <p className="text-xs text-muted-foreground mt-1">Equivale a {formatValidityLabel(validityMonths)}</p>
              </div>

              <div className="space-y-1.5">
                <Label>Avisar com antecedência de (dias)</Label>
                <Input type="number" min={1} value={alertDays} onChange={(e) => setAlertDays(Number(e.target.value))} />
              </div>
            </>
          )}

          {sectors.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm font-semibold">Setores que exigem este treinamento</Label>
              <p className="text-xs text-muted-foreground">
                Ao selecionar um setor, este treinamento será automaticamente obrigatório para todos os colaboradores daquele setor.
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sectors.map((s: any) => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={selectedSectorIds.includes(s.id)} onCheckedChange={() => toggleSector(s.id)} />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <DrawerFooter className="px-6 py-4 flex-row gap-2 border-t">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || save.isPending}>Salvar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
