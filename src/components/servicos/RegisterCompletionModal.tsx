import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRegisterCompletion } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileUploadArea, type PendingFile } from "./FileUploadArea";

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
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const registerCompletion = useRegisterCompletion();
  const { profile } = useAuth();

  const handleOpen = (v: boolean) => {
    if (v && service) {
      setDoneAt(new Date());
      setSupplier(service.supplier || "");
      setNotes("");
      setPendingFiles([]);
    }
    onOpenChange(v);
  };

  const handleSubmit = async () => {
    if (!service || !profile) return;
    await registerCompletion.mutateAsync({
      serviceId: service.id,
      done_at: format(doneAt, "yyyy-MM-dd"),
      supplier: supplier || null,
      notes: notes || null,
      frequency_type: service.frequency_type,
      frequency_preset: service.frequency_preset,
      frequency_days: service.frequency_days,
    });

    // Upload attachments
    const refDate = format(doneAt, "yyyy-MM-dd");
    for (const pf of pendingFiles) {
      const ext = pf.file.name.split(".").pop();
      const path = `${service.company_id}/${service.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("service-attachments").upload(path, pf.file);
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from("service-attachments").getPublicUrl(path);
        await supabase.from("service_attachments").insert({
          service_id: service.id,
          company_id: service.company_id,
          file_name: pf.file.name,
          file_url: publicUrl,
          file_type: pf.type,
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
