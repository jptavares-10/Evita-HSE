import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSaveAsset } from "@/hooks/useInspectionsField";
import { ASSET_TYPES } from "@/lib/inspection-qr";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: any | null;
  sectors: any[];
}

export function AssetDrawer({ open, onOpenChange, editing, sectors }: Props) {
  const save = useSaveAsset();
  const [tagCode, setTagCode] = useState("");
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("extinguisher");
  const [sectorId, setSectorId] = useState("");
  const [location, setLocation] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      if (editing) {
        setTagCode(editing.tag_code || "");
        setName(editing.name || "");
        setAssetType(editing.asset_type || "other");
        setSectorId(editing.sector_id || "");
        setLocation(editing.location_description || "");
        setActive(editing.status === "active");
      } else {
        setTagCode("");
        setName("");
        setAssetType("extinguisher");
        setSectorId("");
        setLocation("");
        setActive(true);
      }
    }
  }, [open, editing]);

  const handleSave = async () => {
    if (!tagCode.trim() || !name.trim()) return;
    await save.mutateAsync({
      id: editing?.id,
      tag_code: tagCode.trim(),
      name: name.trim(),
      asset_type: assetType,
      sector_id: sectorId || null,
      location_description: location.trim() || null,
      status: active ? "active" : "inactive",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? "Editar ativo" : "Novo ativo inspecionável"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Código da etiqueta *</Label>
            <Input placeholder="Ex: EXT-042" value={tagCode} onChange={(e) => setTagCode(e.target.value.toUpperCase())} />
            <p className="text-xs text-muted-foreground">Código curto que vai no QR e no adesivo. Deve ser único.</p>
          </div>
          <div className="space-y-2">
            <Label>Nome / descrição *</Label>
            <Input placeholder="Ex: Extintor CO2 6kg — Sala TI" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ASSET_TYPES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Setor</Label>
            <Select value={sectorId || "__none__"} onValueChange={(v) => setSectorId(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhum</SelectItem>
                {sectors.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Local / referência</Label>
            <Input placeholder="Ex: Corredor B, próximo à porta 3" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <span className="text-sm">{active ? "Ativo" : "Inativo"}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!tagCode.trim() || !name.trim() || save.isPending}>
              {save.isPending ? "Salvando..." : "Salvar ativo"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
