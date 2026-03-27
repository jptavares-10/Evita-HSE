import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRegisterCertificate } from "@/hooks/useTrainings";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateExpiresAt, formatDateBR } from "@/lib/trainings";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  trainingId: string;
  trainingName: string;
  validityMonths: number | null;
  hasExpiry?: boolean;
}

export function RegisterCertificateModal({ open, onOpenChange, employeeId, trainingId, trainingName, validityMonths, hasExpiry = true }: Props) {
  const { company } = useAuth();
  const register = useRegisterCertificate();
  const [doneAt, setDoneAt] = useState<Date>(new Date());
  const [expiresAt, setExpiresAt] = useState<Date>(new Date());
  const [manualExpiry, setManualExpiry] = useState(false);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      const today = new Date();
      setDoneAt(today);
      if (hasExpiry && validityMonths) {
        setExpiresAt(calculateExpiresAt(today, validityMonths));
      } else {
        setExpiresAt(new Date(2099, 11, 31));
      }
      setManualExpiry(false);
      setNotes("");
      setFile(null);
    }
  }, [open, validityMonths, hasExpiry]);

  useEffect(() => {
    if (!manualExpiry && hasExpiry && validityMonths) {
      setExpiresAt(calculateExpiresAt(doneAt, validityMonths));
    }
  }, [doneAt, validityMonths, manualExpiry, hasExpiry]);

  const defaultExpiry = hasExpiry && validityMonths ? calculateExpiresAt(doneAt, validityMonths) : null;

  const handleSubmit = async () => {
    if (!company) return;
    setUploading(true);
    let certUrl: string | null = null;
    let certName: string | null = null;

    try {
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${company.id}/${employeeId}/${trainingId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("training-certificates").upload(path, file);
        if (upErr) throw upErr;
        certUrl = path;
        certName = file.name;
      }

      register.mutate({
        employee_id: employeeId,
        training_id: trainingId,
        done_at: format(doneAt, "yyyy-MM-dd"),
        expires_at: hasExpiry ? format(expiresAt, "yyyy-MM-dd") : "2099-12-31",
        certificate_url: certUrl,
        certificate_name: certName,
        notes: notes.trim() || null,
      }, { onSuccess: () => onOpenChange(false) });
    } catch {
      // error handled by mutation
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Registrar certificado — {trainingName}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Data de realização *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left", !doneAt && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(doneAt, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={doneAt} onSelect={(d) => d && setDoneAt(d)} className="p-3 pointer-events-auto" locale={ptBR} /></PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Data de vencimento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left", !expiresAt && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(expiresAt, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={expiresAt} onSelect={(d) => { if (d) { setExpiresAt(d); setManualExpiry(true); } }} className="p-3 pointer-events-auto" locale={ptBR} />
              </PopoverContent>
            </Popover>
            {manualExpiry && (
              <p className="text-xs text-yellow-600 mt-1">Data ajustada manualmente (padrão: {format(defaultExpiry, "dd/MM/yyyy")})</p>
            )}
          </div>

          <div>
            <Label>Certificado (PDF, JPG, PNG)</Label>
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={register.isPending || uploading}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
