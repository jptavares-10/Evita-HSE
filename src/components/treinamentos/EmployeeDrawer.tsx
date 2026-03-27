import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
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
  const [sector, setSector] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(employee?.name || "");
      setPositionId(employee?.job_position_id || "");
      setSector(employee?.sector || "");
      setActive(employee?.status !== "inactive");
    }
  }, [open, employee]);

  const handleSave = () => {
    if (!name.trim() || !positionId) return;
    save.mutate({ id: employee?.id, name: name.trim(), job_position_id: positionId, sector: sector.trim() || null, status: active ? "active" : "inactive" }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed right-0 top-0 bottom-0 w-full max-w-md rounded-none border-l flex flex-col">
        <DrawerHeader><DrawerTitle>{employee ? "Editar colaborador" : "Novo colaborador"}</DrawerTitle></DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          <div><Label>Nome completo *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div>
            <Label>Cargo *</Label>
            <Select value={positionId} onValueChange={setPositionId}>
              <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
              <SelectContent>
                {positions.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Setor / Área</Label><Input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Ex: Produção" /></div>
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>{active ? "Ativo" : "Inativo"}</Label>
          </div>
        </div>
        <DrawerFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || !positionId || save.isPending}>Salvar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
