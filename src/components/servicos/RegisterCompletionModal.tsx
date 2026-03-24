import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Calendar as CalendarScheduled, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRegisterCompletion } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileUploadArea, type PendingFile } from "./FileUploadArea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Service {
  id: string;
  name: string;
  supplier: string | null;
  frequency_type: string;
  frequency_preset: string | null;
  frequency_days: number | null;
  company_id: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service: Service | null;
}

export function RegisterCompletionModal({ open, onOpenChange, service }: Props) {
  const [doneAt, setDoneAt] = useState<Date>(new Date());
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [realizationType, setRealizationType] = useState<string>("scheduled");
  const [failureDescription, setFailureDescription] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const registerCompletion = useRegisterCompletion();
  const { profile } = useAuth();

  const handleOpen = (v: boolean) => {
    if (v && service) {
      setDoneAt(new Date());
      setSupplier(service.supplier || "");
      setNotes("");
      setRealizationType("scheduled");
      setFailureDescription("");
      setPendingFiles([]);
    }
    onOpenChange(v);
  };

  const handleSubmit = async () => {
    if (!service || !profile) return;
    const result = await registerCompletion.mutateAsync({
      serviceId: service.id,
      done_at: format(doneAt, "yyyy-MM-dd"),
      supplier: supplier || null,
      notes: notes || null,
      frequency_type: service.frequency_type,
      frequency_preset: service.frequency_preset,
      frequency_days: service.frequency_days,
      realization_type: realizationType,
      failure_description: realizationType === "corrective" ? failureDescription || null : null,
    });

    // Upload attachments
    const refDate = format(doneAt, "yyyy-MM-dd");
    for (const pf of pendingFiles) {
      const ext = pf.file.name.split(".").pop();
      const path = `${service.company_id}/${service.id}/${result.historyId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("service-attachments").upload(path, pf.file);
      if (!uploadErr) {
        await supabase.from("service_attachments").insert({
          service_id: service.id,
          company_id: service.company_id,
          file_name: pf.file.name,
          file_url: path,
          file_type: pf.type || "evidence",
          uploaded_by: profile.id,
          reference_date: refDate,
        });
      }
    }
    onOpenChange(false);
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar realização — {service.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Tipo de realização */}
          <div className="space-y-2">
            <Label>Tipo de realização</Label>
            <ToggleGroup type="single" value={realizationType} onValueChange={(v) => v && setRealizationType(v)} className="justify-start">
              <ToggleGroupItem value="scheduled" className="gap-1.5 data-[state=on]:bg-green-100 data-[state=on]:text-green-700 data-[state=on]:border-green-300">
                <CalendarScheduled className="h-4 w-4" />
                Programado
              </ToggleGroupItem>
              <ToggleGroupItem value="corrective" className="gap-1.5 data-[state=on]:bg-orange-100 data-[state=on]:text-orange-700 data-[state=on]:border-orange-300">
                <AlertTriangle className="h-4 w-4" />
                Corretivo
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">
              {realizationType === "scheduled"
                ? "Serviço realizado conforme o prazo planejado."
                : "Serviço realizado antes do prazo devido a uma falha ou problema."}
            </p>
          </div>

          {/* Failure description — only for corrective */}
          {realizationType === "corrective" && (
            <div className="space-y-2">
              <Label>Descrição da falha</Label>
              <Textarea
                value={failureDescription}
                onChange={(e) => setFailureDescription(e.target.value)}
                rows={2}
                placeholder="Descreva brevemente o problema que motivou a realização antecipada..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Data de realização</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(doneAt, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={doneAt} onSelect={(d) => d && setDoneAt(d)} className="p-3 pointer-events-auto" locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Empresa executora" />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            <p className="text-xs text-muted-foreground">
              Esta observação ficará salva no histórico desta realização com data e autoria.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Anexar comprovante</Label>
            <FileUploadArea
              pendingFiles={pendingFiles}
              onAdd={(f) => setPendingFiles((prev) => [...prev, ...f])}
              onRemove={(i) => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
              onTypeChange={(i, t) => setPendingFiles((prev) => prev.map((pf, idx) => idx === i ? { ...pf, type: t } : pf))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={registerCompletion.isPending}>
            {registerCompletion.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
