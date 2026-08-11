import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X } from "lucide-react";
import { useSaveEpiType } from "@/hooks/useEpi";
import { storageUpload } from "@/lib/storage-utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editData?: any;
}

const UNITS = [
  { value: "un", label: "Unidade" },
  { value: "par", label: "Par" },
  { value: "kit", label: "Kit" },
  { value: "cx", label: "Caixa" },
  { value: "pct", label: "Pacote" },
];

export function EpiDrawer({ open, onOpenChange, editData }: Props) {
  const { company } = useAuth();
  const save = useSaveEpiType();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [caNumber, setCaNumber] = useState("");
  const [caExpiresAt, setCaExpiresAt] = useState("");
  const [caAlertDays, setCaAlertDays] = useState("60");
  const [unit, setUnit] = useState("un");
  const [minimumStock, setMinimumStock] = useState("0");
  const [caFileUrl, setCaFileUrl] = useState<string | null>(null);
  const [caFileName, setCaFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && editData) {
      setName(editData.name || "");
      setDescription(editData.description || "");
      setCaNumber(editData.ca_number || "");
      setCaExpiresAt(editData.ca_expires_at || "");
      setCaAlertDays(String(editData.ca_alert_days_before ?? 60));
      setUnit(editData.unit || "un");
      setMinimumStock(String(editData.minimum_stock ?? 0));
      setCaFileUrl(editData.ca_file_url || null);
      setCaFileName(editData.ca_file_name || null);
    } else if (open) {
      setName(""); setDescription(""); setCaNumber(""); setCaExpiresAt(""); setCaAlertDays("60");
      setUnit("un"); setMinimumStock("0"); setCaFileUrl(null); setCaFileName(null);
    }
  }, [open, editData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    if (file.size > 20 * 1024 * 1024) return;
    setUploading(true);
    const path = `${company.id}/${crypto.randomUUID()}/${file.name}`;
    const { error } = await storageUpload("epi-certificates", path, file);
    if (!error) {
      setCaFileUrl(path);
      setCaFileName(file.name);
    }
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    save.mutate({
      id: editData?.id,
      name: name.trim(),
      description: description.trim() || null,
      ca_number: caNumber.trim() || null,
      ca_expires_at: caExpiresAt || null,
      ca_alert_days_before: parseInt(caAlertDays) || 60,
      ca_file_url: caFileUrl,
      ca_file_name: caFileName,
      unit,
      minimum_stock: parseInt(minimumStock) || 0,
    }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editData ? "Editar EPI" : "Novo EPI"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Capacete de segurança" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Unidade</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estoque Mínimo</Label>
              <Input type="number" min="0" value={minimumStock} onChange={(e) => setMinimumStock(e.target.value)} />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-3">Certificado de Aprovação (CA)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nº CA</Label>
                <Input value={caNumber} onChange={(e) => setCaNumber(e.target.value)} placeholder="Ex: 12345" />
              </div>
              <div>
                <Label>Validade do CA</Label>
                <Input type="date" value={caExpiresAt} onChange={(e) => setCaExpiresAt(e.target.value)} />
              </div>
            </div>
            <div className="mt-3">
              <Label>Alerta (dias antes do vencimento)</Label>
              <Input type="number" min="1" value={caAlertDays} onChange={(e) => setCaAlertDays(e.target.value)} />
            </div>
            <div className="mt-3">
              <Label>Documento do CA</Label>
              {caFileName ? (
                <div className="flex items-center gap-2 text-sm mt-1 p-2 rounded bg-muted">
                  <span className="truncate flex-1">{caFileName}</span>
                  <button onClick={() => { setCaFileUrl(null); setCaFileName(null); }}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 mt-1 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? "Enviando..." : "Clique para anexar"}</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!name.trim() || save.isPending}>
              {save.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
