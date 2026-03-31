import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDocumentTypes, useSaveDocument } from "@/hooks/useDocuments";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FREQUENCY_PRESETS = [
  { label: "Mensal (30 dias)", value: 30 },
  { label: "Trimestral (90 dias)", value: 90 },
  { label: "Semestral (180 dias)", value: 180 },
  { label: "Anual (365 dias)", value: 365 },
  { label: "Bienal (730 dias)", value: 730 },
  { label: "Personalizado", value: -1 },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingDocument: any | null;
}

export function DocumentDrawer({ open, onOpenChange, editingDocument }: Props) {
  const { company } = useAuth();
  const { toast } = useToast();
  const { data: types = [] } = useDocumentTypes();
  const saveDocument = useSaveDocument();
  const queryClient = useQueryClient();
  const isEdit = !!editingDocument;

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [typeId, setTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("active");
  const [revNumber, setRevNumber] = useState("Rev. 01");
  const [revDate, setRevDate] = useState<Date>(new Date());
  const [revNotes, setRevNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  // Revision cycle fields
  const [hasRevisionCycle, setHasRevisionCycle] = useState(false);
  const [frequencyPreset, setFrequencyPreset] = useState<string>("365");
  const [customDays, setCustomDays] = useState("");

  useEffect(() => {
    if (open) {
      if (editingDocument) {
        setCode(editingDocument.code || "");
        setTitle(editingDocument.title);
        setTypeId(editingDocument.document_type_id || "");
        setDescription(editingDocument.description || "");
        setResponsible(editingDocument.responsible || "");
        setArea(editingDocument.area || "");
        setStatus(editingDocument.status);
        setHasRevisionCycle(editingDocument.has_revision_cycle || false);
        const days = editingDocument.revision_frequency_days;
        if (days) {
          const preset = FREQUENCY_PRESETS.find(p => p.value === days);
          if (preset) {
            setFrequencyPreset(String(days));
            setCustomDays("");
          } else {
            setFrequencyPreset("-1");
            setCustomDays(String(days));
          }
        } else {
          setFrequencyPreset("365");
          setCustomDays("");
        }
      } else {
        setCode(""); setTitle(""); setTypeId(""); setDescription("");
        setResponsible(""); setArea(""); setStatus("active");
        setRevNumber("Rev. 01"); setRevDate(new Date()); setRevNotes("");
        setHasRevisionCycle(false); setFrequencyPreset("365"); setCustomDays("");
      }
      setFile(null);
    }
  }, [open, editingDocument]);

  const getFrequencyDays = (): number | null => {
    if (!hasRevisionCycle) return null;
    const preset = parseInt(frequencyPreset, 10);
    if (preset === -1) {
      const d = parseInt(customDays, 10);
      return isNaN(d) || d <= 0 ? null : d;
    }
    return preset;
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast({ title: "Título é obrigatório", variant: "destructive" }); return; }
    if (!typeId) { toast({ title: "Tipo é obrigatório", variant: "destructive" }); return; }
    if (!isEdit && !file) { toast({ title: "Arquivo é obrigatório no cadastro", variant: "destructive" }); return; }
    if (!isEdit && !revNumber.trim()) { toast({ title: "Número da revisão é obrigatório", variant: "destructive" }); return; }
    if (hasRevisionCycle && !getFrequencyDays()) { toast({ title: "Informe a periodicidade de revisão", variant: "destructive" }); return; }

    const freqDays = getFrequencyDays();
    const baseDate = isEdit ? (editingDocument.current_revision_date || new Date().toISOString()) : format(revDate, "yyyy-MM-dd");
    const nextRevAt = hasRevisionCycle && freqDays ? format(addDays(parseISO(typeof baseDate === 'string' ? baseDate : format(baseDate, "yyyy-MM-dd")), freqDays), "yyyy-MM-dd") : null;

    await saveDocument.mutateAsync({
      id: editingDocument?.id,
      code: code || null,
      title: title.trim(),
      document_type_id: typeId,
      description: description || null,
      responsible: responsible || null,
      area: area || null,
      status,
      revision_number: revNumber,
      revision_date: format(revDate, "yyyy-MM-dd"),
      revision_notes: revNotes || null,
      file: isEdit ? null : file,
      has_revision_cycle: hasRevisionCycle,
      revision_frequency_days: freqDays,
      next_revision_at: nextRevAt,
    });
    onOpenChange(false);
  };

  const handleCreateType = async () => {
    if (!newTypeName.trim() || !company) return;
    const { data, error } = await supabase.from("document_types").insert({
      company_id: company.id,
      name: newTypeName.trim(),
    }).select("id").single();
    if (!error && data) {
      setTypeId(data.id);
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
    }
    setShowNewType(false);
    setNewTypeName("");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEdit ? "Editar Documento" : "Novo Documento"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-4">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identificação</h3>
              <div className="space-y-2">
                <Label>Código</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: IT-001, APR-003" />
              </div>
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Instrução de Trabalho — Manuseio de Químicos" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de documento *</Label>
                <div className="flex gap-2">
                  <Select value={typeId} onValueChange={setTypeId}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {types.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setShowNewType(true)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Detalhes</h3>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Responsável técnico</Label>
                <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Área / setor</Label>
                <Input value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Vigente</SelectItem>
                    <SelectItem value="under_review">Em revisão</SelectItem>
                    <SelectItem value="obsolete">Obsoleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Revision cycle section */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ciclo de revisão</h3>
              <div className="flex items-center justify-between gap-3 bg-muted/50 rounded-md px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Revisão programada</p>
                  <p className="text-xs text-muted-foreground">Ativar ciclo de revisão periódica para este documento</p>
                </div>
                <Switch checked={hasRevisionCycle} onCheckedChange={setHasRevisionCycle} />
              </div>
              {hasRevisionCycle && (
                <div className="space-y-3 pl-1">
                  <div className="space-y-2">
                    <Label>Periodicidade</Label>
                    <Select value={frequencyPreset} onValueChange={setFrequencyPreset}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_PRESETS.map((p) => (
                          <SelectItem key={p.value} value={String(p.value)}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {frequencyPreset === "-1" && (
                    <div className="space-y-2">
                      <Label>Quantidade de dias</Label>
                      <Input
                        type="number"
                        min={1}
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        placeholder="Ex: 45"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            {!isEdit && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Primeira revisão</h3>
                <div className="space-y-2">
                  <Label>Número da revisão *</Label>
                  <Input value={revNumber} onChange={(e) => setRevNumber(e.target.value)} placeholder="Rev. 01" />
                </div>
                <div className="space-y-2">
                  <Label>Data de emissão *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(revDate, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={revDate} onSelect={(d) => d && setRevDate(d)} className="p-3 pointer-events-auto" locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Upload do documento *</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">PDF, DOC ou DOCX — máx 20MB</p>
                </div>
                <div className="space-y-2">
                  <Label>Motivo / descrição</Label>
                  <Textarea value={revNotes} onChange={(e) => setRevNotes(e.target.value)} rows={2} placeholder="Versão inicial do documento" />
                </div>
              </section>
            )}

            {isEdit && (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                Para atualizar o arquivo, use o botão "Nova revisão" após salvar.
              </p>
            )}
          </div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saveDocument.isPending}>
              {saveDocument.isPending ? "Salvando..." : "Salvar documento"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={showNewType} onOpenChange={setShowNewType}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Novo Tipo de Documento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome do tipo" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} />
            <Button onClick={handleCreateType} className="w-full" disabled={!newTypeName.trim()}>Criar tipo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
