import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INSPECTION_FREQUENCY_PRESETS } from "@/lib/inspections";
import { InspectionDocumentsSection } from "./InspectionDocumentsSection";
import { useAuth } from "@/contexts/AuthContext";

interface InspectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection: any | null;
  onSave: (values: any) => void;
  saving: boolean;
}

export function InspectionDrawer({ open, onOpenChange, inspection, onSave, saving }: InspectionDrawerProps) {
  const { company, profile } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [responsible, setResponsible] = useState("");
  const [isPeriodic, setIsPeriodic] = useState(true);
  const [frequencyType, setFrequencyType] = useState("fixed");
  const [frequencyPreset, setFrequencyPreset] = useState<string>("daily");
  const [frequencyDays, setFrequencyDays] = useState<number>(7);
  const [alertDaysBefore, setAlertDaysBefore] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (inspection) {
      setName(inspection.name || "");
      setDescription(inspection.description || "");
      setLocation(inspection.location || "");
      setResponsible(inspection.responsible || "");
      setIsPeriodic(inspection.is_periodic ?? true);
      setFrequencyType(inspection.frequency_type || "fixed");
      setFrequencyPreset(inspection.frequency_preset || "daily");
      setFrequencyDays(inspection.frequency_days || 7);
      setAlertDaysBefore(inspection.alert_days_before ?? 1);
      setNotes(inspection.notes || "");
    } else {
      setName("");
      setDescription("");
      setLocation("");
      setResponsible("");
      setIsPeriodic(true);
      setFrequencyType("fixed");
      setFrequencyPreset("daily");
      setFrequencyDays(7);
      setAlertDaysBefore(1);
      setNotes("");
    }
  }, [inspection, open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      id: inspection?.id,
      name: name.trim(),
      description: description || null,
      location: location || null,
      responsible: responsible || null,
      is_periodic: isPeriodic,
      frequency_type: isPeriodic ? frequencyType : "fixed",
      frequency_preset: isPeriodic && frequencyType === "fixed" ? frequencyPreset : null,
      frequency_days: isPeriodic && frequencyType === "custom" ? frequencyDays : null,
      alert_days_before: alertDaysBefore,
      notes: notes || null,
      last_done_at: inspection?.last_done_at || null,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{inspection ? "Editar Inspeção" : "Nova Inspeção"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Inspeção diária de extintores" />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Escopo da inspeção..." rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Local / Área</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Galpão A" />
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Nome do responsável" />
            </div>
          </div>

          {/* Periodicity toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Inspeção periódica</Label>
              <p className="text-xs text-muted-foreground">Recalcula próximo vencimento automaticamente</p>
            </div>
            <Switch checked={isPeriodic} onCheckedChange={setIsPeriodic} />
          </div>

          {isPeriodic && (
            <>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select value={frequencyType} onValueChange={setFrequencyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Pré-definida</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {frequencyType === "fixed" ? (
                <div className="space-y-2">
                  <Label>Periodicidade</Label>
                  <Select value={frequencyPreset} onValueChange={setFrequencyPreset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INSPECTION_FREQUENCY_PRESETS).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label} ({val.days} dias)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Intervalo em dias</Label>
                  <Input type="number" min={1} value={frequencyDays} onChange={(e) => setFrequencyDays(Number(e.target.value))} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Alerta (dias antes)</Label>
                <Input type="number" min={0} value={alertDaysBefore} onChange={(e) => setAlertDaysBefore(Number(e.target.value))} />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Observações gerais</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {/* Document links */}
          {inspection?.id && (
            <InspectionDocumentsSection
              inspectionId={inspection.id}
              companyId={company?.id || null}
              profileId={profile?.id || null}
            />
          )}

          <Button onClick={handleSubmit} disabled={saving || !name.trim()} className="w-full">
            {saving ? "Salvando..." : inspection ? "Salvar alterações" : "Criar inspeção"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
