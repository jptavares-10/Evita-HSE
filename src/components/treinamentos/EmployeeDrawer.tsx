import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSaveEmployee, useJobPositions } from "@/hooks/useTrainings";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any;
}

export function EmployeeDrawer({ open, onOpenChange, employee }: Props) {
  const save = useSaveEmployee();
  const { data: positions = [] } = useJobPositions();
  const [name, setName] = useState("");
  const [positionId, setPositionId] = useState<string>("");
  const [active, setActive] = useState(true);

  const selectedPosition = positions.find((p: any) => p.id === positionId);
  const sectorName = selectedPosition?.sectors?.name;

  useEffect(() => {
    if (open) {
      setName(employee?.name || "");
      setPositionId(employee?.job_position_id || "");
      setActive(employee?.status !== "inactive");
    }
  }, [open, employee]);

  const handleSave = () => {
    if (!name.trim() || !positionId) return;
    save.mutate({ id: employee?.id, name: name.trim(), job_position_id: positionId, sector: null, status: active ? "active" : "inactive" }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>{employee ? "Editar colaborador" : "Novo colaborador"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Nome completo *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cargo *</Label>
            <Select value={positionId} onValueChange={setPositionId}>
              <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
              <SelectContent>
                {positions.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {sectorName && (
            <div className="space-y-1.5">
              <Label>Setor</Label>
              <Input value={sectorName} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Definido pelo cargo selecionado</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>{active ? "Ativo" : "Inativo"}</Label>
          </div>
        </div>
        <SheetFooter className="px-6 pb-6 pt-2 flex-row gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || !positionId || save.isPending}>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
