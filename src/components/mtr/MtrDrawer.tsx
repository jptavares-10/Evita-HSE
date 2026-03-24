import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, X, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatDateBR } from "@/lib/mtr";
import { useSaveMtr, useWasteCategories } from "@/hooks/useMTR";
import { ManageWasteCategoriesModal } from "./ManageWasteCategoriesModal";

interface WasteItem {
  waste_category_id: string;
  quantity_tons: number | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editMtr?: any;
}

export function MtrDrawer({ open, onOpenChange, editMtr }: Props) {
  const { data: categories = [] } = useWasteCategories();
  const saveMtr = useSaveMtr();
  const [catModalOpen, setCatModalOpen] = useState(false);

  const [mtrNumber, setMtrNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState<Date | undefined>(new Date());
  const [transporter, setTransporter] = useState("");
  const [notes, setNotes] = useState("");
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [mtrFile, setMtrFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!editMtr;

  useEffect(() => {
    if (open) {
      if (editMtr) {
        setMtrNumber(editMtr.mtr_number || "");
        setIssuedAt(editMtr.issued_at ? parseISO(editMtr.issued_at) : new Date());
        setTransporter(editMtr.transporter || "");
        setNotes(editMtr.notes || "");
        setWasteItems(
          (editMtr.mtr_waste_items || []).map((wi: any) => ({
            waste_category_id: wi.waste_category_id,
            quantity_tons: wi.quantity_tons,
          }))
        );
        setMtrFile(null);
      } else {
        setMtrNumber("");
        setIssuedAt(new Date());
        setTransporter("");
        setNotes("");
        setWasteItems([]);
        setMtrFile(null);
      }
      setErrors({});
    }
  }, [open, editMtr]);

  const cdfDeadline = issuedAt ? addDays(issuedAt, 90) : null;
  const alertDate = issuedAt ? addDays(issuedAt, 83) : null;

  function addWasteItem(categoryId: string) {
    if (wasteItems.find((w) => w.waste_category_id === categoryId)) return;
    setWasteItems([...wasteItems, { waste_category_id: categoryId, quantity_tons: null }]);
  }

  function removeWasteItem(categoryId: string) {
    setWasteItems(wasteItems.filter((w) => w.waste_category_id !== categoryId));
  }

  function updateQuantity(categoryId: string, val: string) {
    setWasteItems(wasteItems.map((w) =>
      w.waste_category_id === categoryId ? { ...w, quantity_tons: val ? parseFloat(val) : null } : w
    ));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!mtrNumber.trim()) e.mtrNumber = "Obrigatório";
    if (!issuedAt) e.issuedAt = "Obrigatório";
    if (wasteItems.length === 0) e.wasteItems = "Selecione ao menos 1 categoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    await saveMtr.mutateAsync({
      id: editMtr?.id,
      mtr_number: mtrNumber.trim(),
      issued_at: format(issuedAt!, "yyyy-MM-dd"),
      transporter: transporter || null,
      notes: notes || null,
      waste_items: wasteItems,
      mtr_file: mtrFile,
      existing_mtr_file_url: editMtr?.mtr_file_url,
      existing_mtr_file_name: editMtr?.mtr_file_name,
    });
    onOpenChange(false);
  }

  const selectedCatIds = new Set(wasteItems.map((w) => w.waste_category_id));
  const availableCategories = categories.filter((c: any) => !selectedCatIds.has(c.id));

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEdit ? "Editar MTR" : "Novo MTR"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            {/* Identification */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identificação</h3>
              <div>
                <Label>Número do MTR *</Label>
                <Input value={mtrNumber} onChange={(e) => setMtrNumber(e.target.value)} disabled={isEdit} placeholder="Ex: MTR-2026-001" />
                {isEdit && <p className="text-xs text-muted-foreground mt-1">O número do MTR não pode ser alterado após o cadastro.</p>}
                {errors.mtrNumber && <p className="text-xs text-destructive mt-1">{errors.mtrNumber}</p>}
              </div>
              <div>
                <Label>Data de emissão *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left", !issuedAt && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {issuedAt ? format(issuedAt, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={issuedAt} onSelect={setIssuedAt} locale={ptBR} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                {errors.issuedAt && <p className="text-xs text-destructive mt-1">{errors.issuedAt}</p>}
              </div>
              {cdfDeadline && (
                <div className="bg-muted/50 rounded p-3 text-sm space-y-1">
                  <p>Prazo para CDF: <span className="font-medium">{format(cdfDeadline, "dd/MM/yyyy", { locale: ptBR })}</span></p>
                  <p>Alerta em: <span className="font-medium">{alertDate ? format(alertDate, "dd/MM/yyyy", { locale: ptBR }) : ""}</span></p>
                </div>
              )}
            </div>

            {/* Transport */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Transporte</h3>
              <div>
                <Label>Transportadora</Label>
                <Input value={transporter} onChange={(e) => setTransporter(e.target.value)} placeholder="Nome da transportadora" />
              </div>
            </div>

            {/* Waste categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Categorias de Resíduo *</h3>
              {wasteItems.map((wi) => {
                const cat = categories.find((c: any) => c.id === wi.waste_category_id);
                return (
                  <div key={wi.waste_category_id} className="flex items-center gap-2 bg-muted/30 rounded p-2">
                    <Badge style={{ backgroundColor: cat?.color + "20", color: cat?.color, borderColor: cat?.color }} className="text-xs">{cat?.name}</Badge>
                    <Input type="number" step="0.001" min="0" placeholder="Quantidade (ton)" className="flex-1 h-8 text-sm"
                      value={wi.quantity_tons ?? ""} onChange={(e) => updateQuantity(wi.waste_category_id, e.target.value)} />
                    <button onClick={() => removeWasteItem(wi.waste_category_id)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                );
              })}
              {errors.wasteItems && <p className="text-xs text-destructive">{errors.wasteItems}</p>}
              <div className="flex gap-2">
                {availableCategories.length > 0 && (
                  <Select onValueChange={addWasteItem}>
                    <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="Adicionar categoria..." /></SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button variant="outline" size="sm" onClick={() => setCatModalOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />Nova</Button>
              </div>
            </div>

            {/* File */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Documentos</h3>
              {(editMtr?.mtr_file_name && !mtrFile) && (
                <p className="text-sm">Arquivo atual: <span className="text-primary">{editMtr.mtr_file_name}</span></p>
              )}
              {mtrFile && <p className="text-sm">Novo arquivo: {mtrFile.name}</p>}
              <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                <Upload className="h-4 w-4" />
                {mtrFile ? "Trocar arquivo" : "Anexar PDF do MTR"}
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setMtrFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Observações</h3>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações gerais..." rows={3} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saveMtr.isPending}>
                {saveMtr.isPending ? "Salvando..." : "Salvar MTR"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <ManageWasteCategoriesModal open={catModalOpen} onOpenChange={setCatModalOpen} />
    </>
  );
}
