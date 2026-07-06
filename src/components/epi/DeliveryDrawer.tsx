import { useEffect, useState, useRef, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEpiTypes, useSaveDelivery } from "@/hooks/useEpi";
import { useEmployees } from "@/hooks/useTrainings";
import { Upload, X, PenLine, CheckCircle2 } from "lucide-react";
import { SignatureKioskModal } from "./SignatureKioskModal";
import { buildDeliveryPdf, computeSignatureHash, fetchClientIp } from "@/lib/epi-signature";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultEpiTypeId?: string;
  defaultEmployeeId?: string;
}

export function DeliveryDrawer({ open, onOpenChange, defaultEpiTypeId, defaultEmployeeId }: Props) {
  const { data: epiTypes = [] } = useEpiTypes();
  const { data: employees = [] } = useEmployees();
  const save = useSaveDelivery();
  const fileRef = useRef<HTMLInputElement>(null);
  const { company, profile } = useAuth();

  const activeEmployees = employees.filter((e: any) => e.status === "active");

  const [epiTypeId, setEpiTypeId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [deliveredAt, setDeliveredAt] = useState(new Date().toISOString().split("T")[0]);
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [signaturePng, setSignaturePng] = useState<string | null>(null);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [kioskOpen, setKioskOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    if (open) {
      setEpiTypeId(defaultEpiTypeId || "");
      setEmployeeId(defaultEmployeeId || "");
      setDeliveredAt(new Date().toISOString().split("T")[0]);
      setQuantity("1");
      setReason("");
      setNotes("");
      setFile(null);
      setPreview(null);
      setSignaturePng(null);
      setSignedAt(null);
    }
  }, [open, defaultEpiTypeId, defaultEmployeeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const selectedEpi = useMemo(
    () => epiTypes.find((e: any) => e.id === epiTypeId),
    [epiTypes, epiTypeId],
  );
  const selectedEmployee = useMemo(
    () => employees.find((e: any) => e.id === employeeId),
    [employees, employeeId],
  );

  const canOpenKiosk = !!epiTypeId && !!employeeId;

  const handleSubmit = async () => {
    if (!epiTypeId || !employeeId) return;

    let sigPayload: any = {};
    if (signaturePng && signedAt) {
      setPreparing(true);
      try {
        const ip = await fetchClientIp();
        const userAgent = navigator.userAgent;
        const hashInput = {
          employee_id: employeeId,
          epi_type_id: epiTypeId,
          quantity: parseInt(quantity) || 1,
          delivered_at: deliveredAt,
          signed_at: signedAt,
        };
        const hash = await computeSignatureHash(hashInput);
        const pdfBlob = await buildDeliveryPdf({
          companyName: company?.name || "",
          companyCnpj: (company as any)?.cnpj || null,
          employeeName: selectedEmployee?.name || "",
          employeeJob: selectedEmployee?.job_positions?.name || null,
          employeeSector:
            (selectedEmployee as any)?.job_positions?.sectors?.name ||
            (selectedEmployee as any)?.sector ||
            null,
          epiName: selectedEpi?.name || "",
          caNumber: selectedEpi?.ca_number || null,
          quantity: parseInt(quantity) || 1,
          unit: selectedEpi?.unit || null,
          reason: reason.trim() || null,
          deliveredAt,
          signaturePng,
          signedAt,
          signedByName: profile?.full_name || null,
          hash,
          ip,
          userAgent,
        });
        sigPayload = {
          signature_png: signaturePng,
          signature_pdf_blob: pdfBlob,
          signature_hash: hash,
          signed_at: signedAt,
          signed_ip: ip,
          signed_user_agent: userAgent,
        };
      } finally {
        setPreparing(false);
      }
    }

    save.mutate(
      {
        epi_type_id: epiTypeId,
        employee_id: employeeId,
        delivered_at: deliveredAt,
        quantity: parseInt(quantity) || 1,
        reason: reason.trim() || null,
        notes: notes.trim() || null,
        attachment_file: file || undefined,
        ...sigPayload,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Registrar Entrega de EPI</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <Label>EPI *</Label>
            <Select value={epiTypeId} onValueChange={setEpiTypeId}>
              <SelectTrigger><SelectValue placeholder="Selecione um EPI" /></SelectTrigger>
              <SelectContent>
                {epiTypes.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Colaborador *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="Selecione um colaborador" /></SelectTrigger>
              <SelectContent>
                {activeEmployees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantidade</Label>
              <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label>Data da Entrega *</Label>
              <Input type="date" value={deliveredAt} onChange={(e) => setDeliveredAt(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Motivo</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: Substituição, primeira entrega" />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {/* Assinatura digital */}
          <div className="border rounded-lg p-3 bg-muted/30">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-sm font-semibold">Assinatura do colaborador</Label>
              {signaturePng && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> coletada
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Modo quiosque para tablet. Gera PDF com trilha de auditoria (hash, IP, dispositivo).
            </p>
            {signaturePng ? (
              <div className="flex items-center gap-2">
                <img
                  src={signaturePng}
                  alt="Assinatura coletada"
                  className="h-16 border rounded bg-white p-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSignaturePng(null);
                    setSignedAt(null);
                  }}
                >
                  Refazer
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={!canOpenKiosk}
                onClick={() => setKioskOpen(true)}
              >
                <PenLine className="h-4 w-4 mr-2" /> Coletar assinatura no tablet
              </Button>
            )}
            {!canOpenKiosk && (
              <p className="text-xs text-muted-foreground mt-1">
                Selecione EPI e colaborador antes de assinar.
              </p>
            )}
          </div>

          <div>
            <Label>Comprovante de entrega (opcional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Foto da assinatura, recibo ou comprovante — JPG, PNG, máx 5MB</p>
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Pré-visualização do comprovante de entrega" className="max-h-32 rounded-lg border" />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => { setFile(null); setPreview(null); }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
              >
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">Clique para selecionar</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!epiTypeId || !employeeId || save.isPending || preparing}>
              {preparing ? "Gerando PDF..." : save.isPending ? "Salvando..." : "Registrar Entrega"}
            </Button>
          </div>
        </div>

        <SignatureKioskModal
          open={kioskOpen}
          onOpenChange={setKioskOpen}
          summary={{
            employeeName: selectedEmployee?.name || "",
            epiName: selectedEpi?.name || "",
            caNumber: selectedEpi?.ca_number || null,
            quantity: parseInt(quantity) || 1,
            unit: selectedEpi?.unit || null,
            deliveredAt,
          }}
          onConfirm={(png) => {
            setSignaturePng(png);
            setSignedAt(new Date().toISOString());
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
