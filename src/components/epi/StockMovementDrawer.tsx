import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEpiTypes, useSaveStockMovement } from "@/hooks/useEpi";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultEpiTypeId?: string;
  defaultType?: "entry" | "exit";
}

export function StockMovementDrawer({ open, onOpenChange, defaultEpiTypeId, defaultType }: Props) {
  const { data: epiTypes = [] } = useEpiTypes();
  const save = useSaveStockMovement();

  const [epiTypeId, setEpiTypeId] = useState("");
  const [movementType, setMovementType] = useState<"entry" | "exit">("entry");
  const [quantity, setQuantity] = useState("1");
  const [movedAt, setMovedAt] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setEpiTypeId(defaultEpiTypeId || "");
      setMovementType(defaultType || "entry");
      setQuantity("1");
      setMovedAt(new Date().toISOString().split("T")[0]);
      setNotes("");
    }
  }, [open, defaultEpiTypeId, defaultType]);

  const handleSubmit = () => {
    if (!epiTypeId || !quantity) return;
    save.mutate({
      epi_type_id: epiTypeId,
      movement_type: movementType,
      quantity: parseInt(quantity),
      moved_at: movedAt,
      notes: notes.trim() || null,
    }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Registrar Movimentação</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <Label>EPI *</Label>
            <Select value={epiTypeId} onValueChange={setEpiTypeId}>
              <SelectTrigger><SelectValue placeholder="Selecione um EPI" /></SelectTrigger>
              <SelectContent>
                {epiTypes.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo *</Label>
            <Select value={movementType} onValueChange={(v) => setMovementType(v as "entry" | "exit")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entrada (compra)</SelectItem>
                <SelectItem value="exit">Saída manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantidade *</Label>
              <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label>Data *</Label>
              <Input type="date" value={movedAt} onChange={(e) => setMovedAt(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Ex: NF 12345" />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!epiTypeId || save.isPending}>
              {save.isPending ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
