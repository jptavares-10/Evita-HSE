import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, AlertCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSaveLicense, useLicenseTypes } from "@/hooks/useLicenses";
import { getValidityLabel, getAlertDateLabel } from "@/lib/licenses";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingLicense: any | null;
}

export function LicenseDrawer({ open, onOpenChange, editingLicense }: Props) {
  const { company } = useAuth();
  const { toast } = useToast();
  const { data: types = [] } = useLicenseTypes();
  const saveLicense = useSaveLicense();
  const queryClient = useQueryClient();

  const [licenseNumber, setLicenseNumber] = useState("");
  const [title, setTitle] = useState("");
  const [typeId, setTypeId] = useState("");
  const [issuingBody, setIssuingBody] = useState("");
  const [sphere, setSphere] = useState("estadual");
  const [hasExpiry, setHasExpiry] = useState(true);
  const [issuedAt, setIssuedAt] = useState<Date>(new Date());
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [alertDays, setAlertDays] = useState(60);
  const [status, setStatus] = useState("active");
  const [conditionants, setConditionants] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  useEffect(() => {
    if (open) {
      if (editingLicense) {
        setLicenseNumber(editingLicense.license_number);
        setTitle(editingLicense.title);
        setTypeId(editingLicense.license_type_id || "");
        setIssuingBody(editingLicense.issuing_body);
        setSphere(editingLicense.sphere);
        setHasExpiry(editingLicense.has_expiry);
        setIssuedAt(parseISO(editingLicense.issued_at));
        setExpiresAt(editingLicense.expires_at ? parseISO(editingLicense.expires_at) : undefined);
        setAlertDays(editingLicense.alert_days_before);
        setStatus(editingLicense.status === "in_renewal" ? "in_renewal" : "active");
        setConditionants(editingLicense.conditionants || "");
        setNotes(editingLicense.notes || "");
        setFile(null);
      } else {
        setLicenseNumber(""); setTitle(""); setTypeId(""); setIssuingBody("");
        setSphere("estadual"); setHasExpiry(true); setIssuedAt(new Date());
        setExpiresAt(undefined); setAlertDays(60); setStatus("active");
        setConditionants(""); setNotes(""); setFile(null);
      }
    }
  }, [open, editingLicense]);

  const validityLabel = useMemo(() => {
    if (!hasExpiry || !expiresAt) return null;
    return getValidityLabel(format(issuedAt, "yyyy-MM-dd"), format(expiresAt, "yyyy-MM-dd"));
  }, [hasExpiry, issuedAt, expiresAt]);

  const alertDateLabel = useMemo(() => {
    if (!hasExpiry || !expiresAt) return null;
    return getAlertDateLabel(format(expiresAt, "yyyy-MM-dd"), alertDays);
  }, [hasExpiry, expiresAt, alertDays]);

  const handleSubmit = async () => {
    if (!licenseNumber.trim()) { toast({ title: "Número da licença é obrigatório", variant: "destructive" }); return; }
    if (!title.trim()) { toast({ title: "Título é obrigatório", variant: "destructive" }); return; }
    if (!typeId) { toast({ title: "Tipo de licença é obrigatório", variant: "destructive" }); return; }
    if (!issuingBody.trim()) { toast({ title: "Órgão emissor é obrigatório", variant: "destructive" }); return; }
    if (hasExpiry && !expiresAt) { toast({ title: "Data de vencimento é obrigatória", variant: "destructive" }); return; }

    await saveLicense.mutateAsync({
      id: editingLicense?.id,
      license_number: licenseNumber.trim(),
      title: title.trim(),
      license_type_id: typeId,
      issuing_body: issuingBody.trim(),
      sphere,
      issued_at: format(issuedAt, "yyyy-MM-dd"),
      expires_at: hasExpiry && expiresAt ? format(expiresAt, "yyyy-MM-dd") : null,
      has_expiry: hasExpiry,
      alert_days_before: alertDays,
      status,
      conditionants: conditionants || null,
      notes: notes || null,
      file,
    });

    onOpenChange(false);
  };

  const handleCreateType = async () => {
    if (!newTypeName.trim() || !company) return;
    const { data, error } = await supabase.from("license_types").insert({
      company_id: company.id, name: newTypeName.trim(),
    }).select("id").single();
    if (!error && data) {
      setTypeId(data.id);
      queryClient.invalidateQueries({ queryKey: ["license-types"] });
    }
    setShowNewType(false);
    setNewTypeName("");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingLicense ? "Editar Licença" : "Nova Licença Ambiental"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-4">
            {/* Identification */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identificação</h3>
              <div className="space-y-2">
                <Label>Número da licença *</Label>
                <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="Ex: LO-12345/2024" />
              </div>
              <div className="space-y-2">
                <Label>Título / descrição *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Licença de Operação — Planta SP" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de licença *</Label>
                <div className="flex gap-2">
                  <Select value={typeId} onValueChange={setTypeId}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {types.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setShowNewType(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Órgão emissor *</Label>
                <Input value={issuingBody} onChange={(e) => setIssuingBody(e.target.value)} placeholder="Ex: CETESB, IBAMA, SEMAD" />
              </div>
              <div className="space-y-2">
                <Label>Esfera *</Label>
                <Select value={sphere} onValueChange={setSphere}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="federal">Federal</SelectItem>
                    <SelectItem value="estadual">Estadual</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Validity */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Validade</h3>
              <div className="flex items-center gap-3">
                <Switch checked={hasExpiry} onCheckedChange={setHasExpiry} />
                <Label className="cursor-pointer">Esta licença tem prazo de validade</Label>
              </div>
              <div className="space-y-2">
                <Label>Data de emissão *</Label>
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
              {hasExpiry ? (
                <>
                  <div className="space-y-2">
                    <Label>Data de vencimento *</Label>
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
                  {validityLabel && <p className="text-sm text-primary">{validityLabel}</p>}
                  <div className="space-y-2">
                    <Label>Avisar com antecedência de</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} value={alertDays} onChange={(e) => setAlertDays(Number(e.target.value) || 1)} className="w-24" />
                      <span className="text-sm text-muted-foreground">dias</span>
                    </div>
                    {alertDateLabel && <p className="text-xs text-muted-foreground">Alerta em: {alertDateLabel}</p>}
                  </div>
                </>
              ) : (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Licença permanente — sem prazo
                </Badge>
              )}
            </section>

            {/* Status */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</h3>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Vigente</SelectItem>
                  <SelectItem value="in_renewal">Em renovação</SelectItem>
                </SelectContent>
              </Select>
            </section>

            {/* Conditionants */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Condicionantes</h3>
              <Textarea value={conditionants} onChange={(e) => setConditionants(e.target.value)} rows={4} placeholder="Liste as condições impostas pelo órgão emissor que a empresa deve cumprir..." />
            </section>

            {/* Notes */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Observações</h3>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </section>

            {/* File upload */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Documento</h3>
              {editingLicense && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Para atualizar o documento, use "Registrar renovação".
                </p>
              )}
              {!editingLicense && (
                <>
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
                  {!file && (
                    <p className="text-xs text-yellow-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Recomendado anexar o documento da licença
                    </p>
                  )}
                </>
              )}
            </section>
          </div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saveLicense.isPending}>
              {saveLicense.isPending ? "Salvando..." : "Salvar licença"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={showNewType} onOpenChange={setShowNewType}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Novo Tipo de Licença</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Ex: Licença de Operação" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} />
            <Button onClick={handleCreateType} className="w-full" disabled={!newTypeName.trim()}>Criar tipo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
