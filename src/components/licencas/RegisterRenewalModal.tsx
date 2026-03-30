import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRegisterRenewal } from "@/hooks/useLicenses";
import { formatDateBR } from "@/lib/licenses";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  license: any | null;
}

export function RegisterRenewalModal({ open, onOpenChange, license }: Props) {
  const { toast } = useToast();
  const registerRenewal = useRegisterRenewal();

  const [licenseNumber, setLicenseNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState<Date>(new Date());
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && license) {
      setLicenseNumber(license.license_number || "");
      setIssuedAt(new Date());
      setExpiresAt(undefined);
      setFile(null);
      setNotes("");
    }
  }, [open, license]);

  const handleSubmit = async () => {
    if (!license) return;
    if (!file) { toast({ title: "Upload da nova licença é obrigatório", variant: "destructive" }); return; }
    if (license.has_expiry && !expiresAt) { toast({ title: "Nova data de vencimento é obrigatória", variant: "destructive" }); return; }

    await registerRenewal.mutateAsync({
      licenseId: license.id,
      license_number: licenseNumber.trim() || license.license_number,
      issued_at: format(issuedAt, "yyyy-MM-dd"),
      expires_at: license.has_expiry && expiresAt ? format(expiresAt, "yyyy-MM-dd") : null,
      has_expiry: license.has_expiry,
      file,
      notes: notes || null,
    });

    onOpenChange(false);
  };

  if (!license) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar renovação</DialogTitle>
          <p className="text-sm text-muted-foreground">{license.title}</p>
        </DialogHeader>

        {/* Read-only info */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
          <p><span className="text-muted-foreground">Número atual:</span> {license.license_number}</p>
          <p><span className="text-muted-foreground">Vencimento atual:</span> {formatDateBR(license.expires_at) || "Permanente"}</p>
          <p><span className="text-muted-foreground">Órgão emissor:</span> {license.issuing_body}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Novo número da licença</Label>
            <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="Manter atual se não mudou" />
          </div>

          <div className="space-y-2">
            <Label>Nova data de emissão *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(issuedAt, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={issuedAt} onSelect={(d) => d && setIssuedAt(d)} className="p-3 pointer-events-auto" locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>

          {license.has_expiry && (
            <div className="space-y-2">
              <Label>Nova data de vencimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expiresAt && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? format(expiresAt, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={expiresAt} onSelect={(d) => d && setExpiresAt(d)} className="p-3 pointer-events-auto" locale={ptBR} />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label>Upload da nova licença *</Label>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{file ? file.name : "Clique para selecionar PDF (máx 20MB)"}</span>
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 20 * 1024 * 1024) {
                  toast({ title: "Arquivo muito grande. Máximo: 20MB.", variant: "destructive" });
                  return;
                }
                setFile(f || null);
              }} />
            </label>
          </div>

          <div className="space-y-2">
            <Label>Observações da renovação</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Ex: Renovada sem alterações nas condicionantes" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={registerRenewal.isPending}>
            {registerRenewal.isPending ? "Registrando..." : "Confirmar renovação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
