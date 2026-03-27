import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSaveEmployee, useJobPositions, useSectors } from "@/hooks/useTrainings";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any;
}

export function EmployeeDrawer({ open, onOpenChange, employee }: Props) {
  const save = useSaveEmployee();
  const { data: positions = [] } = useJobPositions();
  const { data: sectors = [] } = useSectors();
  const [name, setName] = useState("");
  const [positionId, setPositionId] = useState<string>("");
  const [sectorId, setSectorId] = useState<string>("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      setName(employee?.name || "");
      setPositionId(employee?.job_position_id || "");
      setSectorId(employee?.sector_id || "");
      setActive(employee?.status !== "inactive");
    }
  }, [open, employee]);

  // Pre-fill sector when position changes
  useEffect(() => {
    if (!employee && positionId) {
      const pos = positions.find((p: any) => p.id === positionId);
      if (pos?.sector_id) {
        setSectorId(pos.sector_id);
      }
    }
  }, [positionId, positions, employee]);

  const handleSave = () => {
    if (!name.trim() || !positionId) return;
    save.mutate({
      id: employee?.id,
      name: name.trim(),
      job_position_id: positionId,
      sector_id: sectorId || null,
      status: active ? "active" : "inactive",
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed right-0 top-0 bottom-0 w-full max-w-md rounded-none border-l flex flex-col">
        <DrawerHeader className="px-6 pt-6 pb-4">
          <DrawerTitle>{employee ? "Editar colaborador" : "Novo colaborador"}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 space-y-5">
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

          <div className="space-y-1.5">
            <Label>Setor</Label>
            <Select value={sectorId} onValueChange={setSectorId}>
              <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {sectors.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>{active ? "Ativo" : "Inativo"}</Label>
          </div>
        </div>
        <DrawerFooter className="px-6 py-4 flex-row gap-2 border-t">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || !positionId || save.isPending}>Salvar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
