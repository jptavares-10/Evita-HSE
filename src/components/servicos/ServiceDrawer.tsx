import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSaveService, useServiceCategories, useServiceAttachments } from "@/hooks/useServices";
import { FREQUENCY_PRESETS, type FrequencyPreset, getFrequencyDays, calculateNextDueAt, FILE_TYPE_LABELS, FILE_TYPE_BADGE_COLORS, formatDateBR } from "@/lib/services";
import { FileUploadArea, type PendingFile } from "./FileUploadArea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PRESET_COLORS } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  category_id: string | null;
  frequency_type: string;
  frequency_preset: string | null;
  frequency_days: number | null;
  last_done_at: string;
  alert_days_before: number;
  supplier: string | null;
  notes: string | null;
  company_id: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingService: Service | null;
}

export function ServiceDrawer({ open, onOpenChange, editingService }: Props) {
  const { company, profile } = useAuth();
  const { toast } = useToast();
  const { data: categories = [] } = useServiceCategories();
  const { data: existingAttachments = [] } = useServiceAttachments(editingService?.id ?? null);
  const saveService = useSaveService();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [freqType, setFreqType] = useState("fixed");
  const [freqPreset, setFreqPreset] = useState<string>("monthly");
  const [freqDays, setFreqDays] = useState(30);
  const [lastDoneAt, setLastDoneAt] = useState<Date>(new Date());
  const [alertDays, setAlertDays] = useState(30);
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (open) {
      if (editingService) {
        setName(editingService.name);
        setCategoryId(editingService.category_id || "");
        setFreqType(editingService.frequency_type);
        setFreqPreset(editingService.frequency_preset || "monthly");
        setFreqDays(editingService.frequency_days || 30);
        setLastDoneAt(parseISO(editingService.last_done_at));
        setAlertDays(editingService.alert_days_before);
        setSupplier(editingService.supplier || "");
        setNotes(editingService.notes || "");
      } else {
        setName(""); setCategoryId(""); setFreqType("fixed"); setFreqPreset("monthly");
        setFreqDays(30); setLastDoneAt(new Date()); setAlertDays(30);
        setSupplier(""); setNotes("");
      }
      setPendingFiles([]);
    }
  }, [open, editingService]);

  const nextDuePreview = useMemo(() => {
    const days = getFrequencyDays(freqType, freqType === "fixed" ? freqPreset : null, freqType === "custom" ? freqDays : null);
    return calculateNextDueAt(lastDoneAt, days);
  }, [freqType, freqPreset, freqDays, lastDoneAt]);

  const customMonths = useMemo(() => {
    if (freqType !== "custom") return "";
    const m = freqDays / 30;
    return m >= 1 ? `Equivale a aproximadamente ${m.toFixed(1)} meses` : "";
  }, [freqType, freqDays]);

  const handleSubmit = async () => {
    if (!name.trim()) { toast({ title: "Nome é obrigatório", variant: "destructive" }); return; }
    if (!categoryId) { toast({ title: "Categoria é obrigatória", variant: "destructive" }); return; }
    if (alertDays < 1) { toast({ title: "Dias de antecedência deve ser positivo", variant: "destructive" }); return; }

    const serviceId = await saveService.mutateAsync({
      id: editingService?.id,
      name: name.trim(),
      category_id: categoryId,
      frequency_type: freqType,
      frequency_preset: freqType === "fixed" ? freqPreset : null,
      frequency_days: freqType === "custom" ? freqDays : null,
      last_done_at: format(lastDoneAt, "yyyy-MM-dd"),
      alert_days_before: alertDays,
      supplier: supplier || null,
      notes: notes || null,
    });

    // Upload new files
    if (pendingFiles.length && company && profile) {
      const refDate = format(lastDoneAt, "yyyy-MM-dd");
      for (const pf of pendingFiles) {
        const ext = pf.file.name.split(".").pop();
        const path = `${company.id}/${serviceId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("service-attachments").upload(path, pf.file);
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from("service-attachments").getPublicUrl(path);
          await supabase.from("service_attachments").insert({
            service_id: serviceId,
            company_id: company.id,
            file_name: pf.file.name,
            file_url: publicUrl,
            file_type: pf.type,
            uploaded_by: profile.id,
            reference_date: refDate,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["service-attachments"] });
    }

    onOpenChange(false);
  };

  const handleDeleteAttachment = async (attId: string, fileUrl: string) => {
    const url = new URL(fileUrl);
    const parts = url.pathname.split("/storage/v1/object/public/service-attachments/");
    const storagePath = parts[1];
    if (storagePath) {
      await supabase.storage.from("service-attachments").remove([storagePath]);
    }
    await supabase.from("service_attachments").delete().eq("id", attId);
    queryClient.invalidateQueries({ queryKey: ["service-attachments"] });
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim() || !company) return;
    const { data, error } = await supabase.from("service_categories").insert({
      company_id: company.id,
      name: newCatName.trim(),
      color: newCatColor,
    }).select("id").single();
    if (!error && data) {
      setCategoryId(data.id);
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
    }
    setShowNewCat(false);
    setNewCatName("");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-4">
            {/* Identification */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identificação</h3>
              <div className="space-y-2">
                <Label>Nome do serviço *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Recarga de extintores" />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <div className="flex gap-2">
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                            {c.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setShowNewCat(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </section>

            {/* Frequency */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Frequência</h3>
              <div className="flex gap-2">
                <Button variant={freqType === "fixed" ? "default" : "outline"} size="sm" onClick={() => setFreqType("fixed")}>Período fixo</Button>
                <Button variant={freqType === "custom" ? "default" : "outline"} size="sm" onClick={() => setFreqType("custom")}>Personalizado</Button>
              </div>
              {freqType === "fixed" ? (
                <Select value={freqPreset} onValueChange={setFreqPreset}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQUENCY_PRESETS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input type="number" min={1} value={freqDays} onChange={(e) => setFreqDays(Number(e.target.value) || 1)} className="w-24" />
                    <span className="text-sm text-muted-foreground">dias</span>
                  </div>
                  {customMonths && <p className="text-xs text-muted-foreground">{customMonths}</p>}
                </div>
              )}
              <div className="space-y-2">
                <Label>Avisar com antecedência de</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" min={1} value={alertDays} onChange={(e) => setAlertDays(Number(e.target.value) || 1)} className="w-24" />
                  <span className="text-sm text-muted-foreground">dias</span>
                </div>
              </div>
            </section>

            {/* Last done */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Última realização</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(lastDoneAt, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={lastDoneAt} onSelect={(d) => d && setLastDoneAt(d)} className="p-3 pointer-events-auto" locale={ptBR} />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-primary">
                Próxima data prevista: <strong>{format(nextDuePreview, "dd/MM/yyyy")}</strong>
              </p>
            </section>

            {/* Additional */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informações adicionais</h3>
              <div className="space-y-2">
                <Label>Fornecedor / empresa executora</Label>
                <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
            </section>

            {/* Attachments */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Anexos</h3>
              {editingService && existingAttachments.length > 0 && (
                <div className="space-y-2">
                  {existingAttachments.map((att: any) => (
                    <div key={att.id} className="flex flex-col gap-1 text-sm bg-muted/50 px-3 py-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-primary hover:underline">{att.file_name}</a>
                        <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => handleDeleteAttachment(att.id, att.file_url)}>Remover</Button>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${FILE_TYPE_BADGE_COLORS[att.file_type] || FILE_TYPE_BADGE_COLORS.other}`}>
                          {FILE_TYPE_LABELS[att.file_type] || att.file_type}
                        </Badge>
                        {att.reference_date && (
                          <span className="text-muted-foreground">· {formatDateBR(att.reference_date)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <FileUploadArea
                pendingFiles={pendingFiles}
                onAdd={(f) => setPendingFiles((prev) => [...prev, ...f])}
                onRemove={(i) => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                onTypeChange={(i, t) => setPendingFiles((prev) => prev.map((pf, idx) => idx === i ? { ...pf, type: t } : pf))}
              />
            </section>
          </div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saveService.isPending}>
              {saveService.isPending ? "Salvando..." : "Salvar serviço"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Mini-modal for new category */}
      <Dialog open={showNewCat} onOpenChange={setShowNewCat}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button key={c} onClick={() => setNewCatColor(c)} className={cn("h-6 w-6 rounded-full border-2", newCatColor === c ? "border-foreground" : "border-transparent")} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Input placeholder="Nome da categoria" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
            <Button onClick={handleCreateCategory} className="w-full" disabled={!newCatName.trim()}>Criar categoria</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
