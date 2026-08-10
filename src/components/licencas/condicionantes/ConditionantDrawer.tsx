import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSaveConditionant, useCompanyMembers, type ConditionantRow } from "@/hooks/useConditionants";
import { CRITICALITIES, DEADLINE_TYPES, RECURRENCES, STATUS_OPTIONS } from "@/lib/conditionants";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: ConditionantRow | null;
  licenses: any[];
  defaultLicenseId?: string;
}

const NONE = "__none__";

export function ConditionantDrawer({ open, onOpenChange, editing, licenses, defaultLicenseId }: Props) {
  const save = useSaveConditionant();
  const { data: members = [] } = useCompanyMembers();

  const [licenseId, setLicenseId] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  const [responsibleId, setResponsibleId] = useState(NONE);
  const [criticality, setCriticality] = useState("media");
  const [deadlineType, setDeadlineType] = useState("single");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [recurrence, setRecurrence] = useState("annual");
  const [daysBefore, setDaysBefore] = useState(90);
  const [alertDays, setAlertDays] = useState(30);
  const [status, setStatus] = useState("pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setLicenseId(editing.license_id);
      setItemCode(editing.item_code || "");
      setDescription(editing.description);
      setResponsibleId(editing.responsible_id || NONE);
      setCriticality(editing.criticality);
      setDeadlineType(editing.deadline_type);
      setDueDate(editing.due_date ? parseISO(editing.due_date) : undefined);
      setRecurrence(editing.recurrence || "annual");
      setDaysBefore(editing.days_before_license_expiry ?? 90);
      setAlertDays(editing.alert_days_before);
      setStatus(editing.status);
      setNotes(editing.notes || "");
    } else {
      setLicenseId(defaultLicenseId || "");
      setItemCode(""); setDescription(""); setResponsibleId(NONE); setCriticality("media");
      setDeadlineType("single"); setDueDate(undefined); setRecurrence("annual");
      setDaysBefore(90); setAlertDays(30); setStatus("pending"); setNotes("");
    }
  }, [open, editing, defaultLicenseId]);

  const selectedLicense = useMemo(() => licenses.find((l) => l.id === licenseId), [licenses, licenseId]);

  const linkedPreview = useMemo(() => {
    if (deadlineType !== "license_linked") return null;
    if (!selectedLicense?.has_expiry || !selectedLicense?.expires_at) {
      return "A licença selecionada é permanente ou não tem vencimento — não haverá prazo calculado.";
    }
    const d = subDays(parseISO(selectedLicense.expires_at), daysBefore || 0);
    return `Prazo calculado: ${format(d, "dd/MM/yyyy")} (licença vence em ${format(parseISO(selectedLicense.expires_at), "dd/MM/yyyy")}).`;
  }, [deadlineType, selectedLicense, daysBefore]);

  const canSave =
    !!licenseId &&
    description.trim().length > 0 &&
    (deadlineType === "continuous" || deadlineType === "license_linked" || !!dueDate);

  const handleSave = async () => {
    await save.mutateAsync({
      id: editing?.id,
      license_id: licenseId,
      item_code: itemCode.trim() || null,
      description: description.trim(),
      responsible_id: responsibleId === NONE ? null : responsibleId,
      criticality,
      deadline_type: deadlineType,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      recurrence,
      days_before_license_expiry: daysBefore,
      alert_days_before: alertDays,
      status,
      notes: notes.trim() || null,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? "Editar condicionante" : "Nova condicionante"}</SheetTitle>
          <SheetDescription>Vincule a condicionante à licença e defina o prazo de cumprimento.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-5">
          <div className="space-y-1.5">
            <Label>Licença *</Label>
            <Select value={licenseId} onValueChange={setLicenseId}>
              <SelectTrigger><SelectValue placeholder="Selecione a licença" /></SelectTrigger>
              <SelectContent>
                {licenses.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.license_number} — {l.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Item / nº da condicionante</Label>
              <Input value={itemCode} onChange={(e) => setItemCode(e.target.value)} placeholder="Ex: 3.1" />
            </div>
            <div className="space-y-1.5">
              <Label>Criticidade</Label>
              <Select value={criticality} onValueChange={setCriticality}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CRITICALITIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição da exigência *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Transcreva a condicionante conforme o texto da licença." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select value={responsibleId} onValueChange={setResponsibleId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sem responsável</SelectItem>
                  {members.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.full_name || m.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Situação</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de prazo</Label>
            <Select value={deadlineType} onValueChange={setDeadlineType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEADLINE_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{DEADLINE_TYPES.find((d) => d.value === deadlineType)?.hint}</p>
          </div>

          {(deadlineType === "single" || deadlineType === "recurring") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{deadlineType === "recurring" ? "Próximo vencimento *" : "Vencimento *"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} locale={ptBR} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              {deadlineType === "recurring" && (
                <div className="space-y-1.5">
                  <Label>Periodicidade</Label>
                  <Select value={recurrence} onValueChange={setRecurrence}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RECURRENCES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {deadlineType === "license_linked" && (
            <div className="space-y-1.5">
              <Label>Dias antes do vencimento da licença</Label>
              <Input type="number" min={0} value={daysBefore} onChange={(e) => setDaysBefore(Number(e.target.value))} />
              {linkedPreview && (
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {linkedPreview}
                </p>
              )}
            </div>
          )}

          {deadlineType !== "continuous" && (
            <div className="space-y-1.5">
              <Label>Alertar quantos dias antes</Label>
              <Input type="number" min={0} value={alertDays} onChange={(e) => setAlertDays(Number(e.target.value))} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!canSave || save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}