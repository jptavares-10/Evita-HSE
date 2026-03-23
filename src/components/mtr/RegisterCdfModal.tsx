import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatDateBR } from "@/lib/mtr";
import { useRegisterCdf } from "@/hooks/useMTR";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mtr: any;
}

export function RegisterCdfModal({ open, onOpenChange, mtr }: Props) {
  const registerCdf = useRegisterCdf();
  const [cdfNumber, setCdfNumber] = useState("");
  const [receivedAt, setReceivedAt] = useState<Date | undefined>(new Date());
  const [cdfNotes, setCdfNotes] = useState("");
  const [cdfFile, setCdfFile] = useState<File | null>(null);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && mtr) {
      setCdfNumber("");
      setReceivedAt(new Date());
      setCdfNotes("");
      setCdfFile(null);
      const q: Record<string, string> = {};
      (mtr.mtr_waste_items || []).forEach((wi: any) => {
        q[wi.id] = wi.quantity_tons != null ? String(wi.quantity_tons) : "";
      });
      setQuantities(q);
      setErrors({});
    }
  }, [open, mtr]);

  function validate() {
    const e: Record<string, string> = {};
    if (!cdfNumber.trim()) e.cdfNumber = "Obrigatório";
    if (!receivedAt) e.receivedAt = "Obrigatório";
    if (!cdfFile) e.cdfFile = "O PDF do CDF é obrigatório";
    const items = mtr?.mtr_waste_items || [];
    for (const wi of items) {
      if (!quantities[wi.id] || parseFloat(quantities[wi.id]) <= 0) {
        e[`qty_${wi.id}`] = "Obrigatório";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || !mtr) return;
    const items = (mtr.mtr_waste_items || []).map((wi: any) => ({
      item_id: wi.id,
      quantity_tons: parseFloat(quantities[wi.id]),
    }));
    await registerCdf.mutateAsync({
      mtrId: mtr.id,
      cdf_number: cdfNumber.trim(),
      cdf_received_at: format(receivedAt!, "yyyy-MM-dd"),
      cdf_notes: cdfNotes || null,
      quantities: items,
      cdf_file: cdfFile!,
    });
    onOpenChange(false);
  }

  if (!mtr) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar CDF — MTR {mtr.mtr_number}</DialogTitle>
        </DialogHeader>
        <div className="bg-muted/50 rounded p-3 text-sm space-y-1 mb-4">
          <p>Emissão: {formatDateBR(mtr.issued_at)}</p>
          <p>Prazo CDF: {formatDateBR(mtr.cdf_deadline_at)}</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Número do CDF *</Label>
            <Input value={cdfNumber} onChange={(e) => setCdfNumber(e.target.value)} placeholder="Ex: CDF-001" />
            {errors.cdfNumber && <p className="text-xs text-destructive mt-1">{errors.cdfNumber}</p>}
          </div>

          <div>
            <Label>Data de recebimento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left", !receivedAt && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {receivedAt ? format(receivedAt, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={receivedAt} onSelect={setReceivedAt} locale={ptBR} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {errors.receivedAt && <p className="text-xs text-destructive mt-1">{errors.receivedAt}</p>}
          </div>

          <div>
            <Label className="mb-2 block">Quantidades por categoria *</Label>
            <div className="space-y-2">
              {(mtr.mtr_waste_items || []).map((wi: any) => (
                <div key={wi.id} className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: wi.waste_categories?.color + "20", color: wi.waste_categories?.color, borderColor: wi.waste_categories?.color }} className="text-xs min-w-[80px] justify-center">
                    {wi.waste_categories?.name}
                  </Badge>
                  <Input type="number" step="0.001" min="0" placeholder="Toneladas" className="flex-1 h-8 text-sm"
                    value={quantities[wi.id] || ""} onChange={(e) => setQuantities({ ...quantities, [wi.id]: e.target.value })} />
                  {errors[`qty_${wi.id}`] && <span className="text-xs text-destructive">!</span>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>PDF do CDF *</Label>
            {cdfFile && <p className="text-sm mb-1">{cdfFile.name}</p>}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
              <Upload className="h-4 w-4" />{cdfFile ? "Trocar arquivo" : "Selecionar PDF"}
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => setCdfFile(e.target.files?.[0] || null)} />
            </label>
            {errors.cdfFile && <p className="text-xs text-destructive mt-1">{errors.cdfFile}</p>}
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={cdfNotes} onChange={(e) => setCdfNotes(e.target.value)} rows={2} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={registerCdf.isPending}>
              {registerCdf.isPending ? "Registrando..." : "Registrar CDF"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
