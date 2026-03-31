import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search } from "lucide-react";
import { OCCURRENCE_TYPES, SEVERITY_LEVELS, BODY_PARTS } from "@/lib/occurrences";
import { useSaveOccurrence, useOccurrenceEmployees, useOccurrenceAttachments } from "@/hooks/useOccurrences";
import { useEmployees } from "@/hooks/useTrainings";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occurrence?: any;
  planExpired?: boolean;
}

export function OccurrenceDrawer({ open, onOpenChange, occurrence, planExpired }: Props) {
  const [type, setType] = useState("incident");
  const [severity, setSeverity] = useState("medium");
  const [occurredDate, setOccurredDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [occurredTime, setOccurredTime] = useState(format(new Date(), "HH:mm"));
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [causeAnalysis, setCauseAnalysis] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [withLeave, setWithLeave] = useState(false);
  const [lostDays, setLostDays] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<{ employee_id?: string | null; employee_name: string }[]>([]);
  const [empSearch, setEmpSearch] = useState("");
  const [customName, setCustomName] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const { data: companyEmployees = [] } = useEmployees();
  const { data: existingEmployees = [] } = useOccurrenceEmployees(occurrence?.id ?? null);
  const { data: existingAttachments = [] } = useOccurrenceAttachments(occurrence?.id ?? null);
  const saveMutation = useSaveOccurrence();

  const isEditing = !!occurrence;

  useEffect(() => {
    if (open && occurrence) {
      setType(occurrence.type);
      setSeverity(occurrence.severity);
      const d = new Date(occurrence.occurred_at);
      setOccurredDate(format(d, "yyyy-MM-dd"));
      setOccurredTime(format(d, "HH:mm"));
      setLocation(occurrence.location);
      setDescription(occurrence.description);
      setCauseAnalysis(occurrence.cause_analysis || "");
      setBodyPart(occurrence.body_part_affected || "");
      setWithLeave(occurrence.with_leave ?? false);
      setLostDays(occurrence.lost_days ?? 0);
      setFiles([]);
    } else if (open) {
      setType("incident");
      setSeverity("medium");
      setOccurredDate(format(new Date(), "yyyy-MM-dd"));
      setOccurredTime(format(new Date(), "HH:mm"));
      setLocation("");
      setDescription("");
      setCauseAnalysis("");
      setBodyPart("");
      setWithLeave(false);
      setLostDays(0);
      setSelectedEmployees([]);
      setFiles([]);
    }
  }, [open, occurrence]);

  useEffect(() => {
    if (open && occurrence && existingEmployees.length > 0) {
      setSelectedEmployees(existingEmployees.map((e: any) => ({ employee_id: e.employee_id, employee_name: e.employee_name })));
    }
  }, [open, occurrence, existingEmployees]);

  const filteredEmployees = companyEmployees.filter(
    (e: any) => e.status === "active" && e.name.toLowerCase().includes(empSearch.toLowerCase()) && !selectedEmployees.some((s) => s.employee_id === e.id)
  );

  const addEmployee = (emp: any) => {
    setSelectedEmployees((prev) => [...prev, { employee_id: emp.id, employee_name: emp.name }]);
    setEmpSearch("");
  };

  const addCustomEmployee = () => {
    if (!customName.trim()) return;
    setSelectedEmployees((prev) => [...prev, { employee_id: null, employee_name: customName.trim() }]);
    setCustomName("");
  };

  const removeEmployee = (idx: number) => {
    setSelectedEmployees((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const canSave = type && severity && occurredDate && occurredTime && location.trim() && description.trim();

  const handleSave = () => {
    if (!canSave || planExpired) return;
    const occurredAt = new Date(`${occurredDate}T${occurredTime}:00`).toISOString();
    saveMutation.mutate(
      {
        id: occurrence?.id,
        type,
        severity,
        occurred_at: occurredAt,
        location: location.trim(),
        description: description.trim(),
        cause_analysis: causeAnalysis.trim() || null,
        body_part_affected: bodyPart || null,
        with_leave: withLeave,
        lost_days: withLeave ? lostDays : 0,
        employees: selectedEmployees,
        attachmentFiles: files,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar Ocorrência" : "Registrar Ocorrência"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-6 pb-6 pt-4">
          {/* Type & Severity */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tipo e Gravidade</h3>
            <div className="space-y-2">
              <Label>Tipo da ocorrência *</Label>
              <Select value={type} onValueChange={setType} disabled={isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OCCURRENCE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditing && <p className="text-xs text-muted-foreground">O tipo não pode ser alterado após o registro.</p>}
            </div>
            <div className="space-y-2">
              <Label>Gravidade *</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div>
                        <span>{s.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {s.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* When & Where */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quando e Onde</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" value={occurredDate} onChange={(e) => setOccurredDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hora *</Label>
                <Input type="time" value={occurredTime} onChange={(e) => setOccurredTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Local/Área *</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Galpão 3, Área de carga" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">O que aconteceu</h3>
            <div className="space-y-2">
              <Label>Descrição detalhada *</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o que aconteceu, as circunstâncias e o contexto..." className="min-h-[100px]" />
            </div>
          </div>

          {/* Employees */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Colaboradores envolvidos</h3>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} placeholder="Buscar colaborador..." className="pl-9" />
              </div>
              {empSearch && filteredEmployees.length > 0 && (
                <div className="border rounded-md max-h-32 overflow-y-auto">
                  {filteredEmployees.slice(0, 5).map((emp: any) => (
                    <button key={emp.id} onClick={() => addEmployee(emp)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors">{emp.name}</button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Pessoa não cadastrada" className="flex-1" />
                <Button variant="outline" size="sm" onClick={addCustomEmployee} disabled={!customName.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {selectedEmployees.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedEmployees.map((emp, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {emp.employee_name}
                      <button onClick={() => removeEmployee(idx)}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Body part (incident only) */}
          {type === "incident" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Parte do corpo afetada</h3>
              <Select value={bodyPart} onValueChange={setBodyPart}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {BODY_PARTS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-3">
                <Switch checked={withLeave} onCheckedChange={setWithLeave} />
                <Label>Com afastamento</Label>
              </div>
              {withLeave && (
                <div className="space-y-2">
                  <Label>Dias de afastamento</Label>
                  <Input type="number" min={0} value={lostDays} onChange={(e) => setLostDays(Math.max(0, parseInt(e.target.value) || 0))} placeholder="0" />
                </div>
              )}
            </div>
          )}

          {/* Cause analysis */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Análise de causa</h3>
            <Textarea value={causeAnalysis} onChange={(e) => setCauseAnalysis(e.target.value)} placeholder="Descreva a causa raiz identificada..." />
            <p className="text-xs text-muted-foreground">Pode ser preenchida depois.</p>
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Evidências</h3>
            <Input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
            {files.length > 0 && (
              <div className="space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-muted/50 px-3 py-1.5 rounded">
                    <span className="truncate">{f.name}</span>
                    <button onClick={() => removeFile(i)}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                ))}
              </div>
            )}
            {isEditing && existingAttachments.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Anexos existentes:</p>
                {existingAttachments.map((a: any) => (
                  <a key={a.id} href={a.file_url} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:underline truncate">{a.file_name}</a>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!canSave || saveMutation.isPending || planExpired}>
              {saveMutation.isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Registrar ocorrência"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
