import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eraser, Check } from "lucide-react";
import { useSignExecution } from "@/hooks/useInspectionsField";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  executionId: string;
  hasOpenActions: boolean;
  criticalNonConformCount: number;
  onSigned?: () => void;
}

export function SignExecutionModal({ open, onOpenChange, executionId, hasOpenActions, criticalNonConformCount, onSigned }: Props) {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [empty, setEmpty] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const signMut = useSignExecution();

  useEffect(() => {
    if (!open) return;
    setEmpty(true);
    setName("");
    setRole("");
    setCoords(null);
    setGpsError(null);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => setCoords(p.coords),
        (err) => setGpsError(err.message),
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  }, [open]);

  const canSubmit = !empty && name.trim().length >= 3 && !signMut.isPending;

  const handleClear = () => {
    sigRef.current?.clear();
    setEmpty(true);
  };

  const handleConfirm = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const png = sigRef.current.getCanvas().toDataURL("image/png");
    await signMut.mutateAsync({
      execution_id: executionId,
      signature_png: png,
      signer_name: name.trim(),
      signer_role: role.trim() || null,
      location: coords,
      has_open_actions: hasOpenActions,
    });
    onSigned?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 flex flex-col max-h-[92vh]">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle>Fechar e assinar inspeção</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4 overflow-y-auto">
          {criticalNonConformCount > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-900 rounded-lg px-3 py-2 text-sm">
              ⚠️ {criticalNonConformCount} item(s) crítico(s) não conforme(s). Isso ficará registrado no relatório.
            </div>
          )}
          {hasOpenActions && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 text-sm">
              Há ações corretivas em aberto — a inspeção será fechada como <strong>Concluída com pendências</strong>.
            </div>
          )}

          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs space-y-1">
            <div>
              <span className="text-muted-foreground">Data/Hora: </span>
              <span className="font-medium">{new Date().toLocaleString("pt-BR")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Localização: </span>
              {coords ? (
                <span className="font-medium">
                  {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)} (±{Math.round(coords.accuracy)}m)
                </span>
              ) : gpsError ? (
                <span className="text-amber-700">GPS indisponível</span>
              ) : (
                <span className="text-muted-foreground">Obtendo…</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nome do responsável *</Label>
            <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cargo / função / registro (CREA, TST etc.)</Label>
            <Input placeholder="Ex: Técnico de Segurança do Trabalho — TST 12345" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>

          <p className="text-xs leading-relaxed bg-muted/30 rounded px-3 py-2">
            <strong>Declaro</strong> ter executado a inspeção acima conforme o checklist previsto, e que as respostas, fotos e localização registradas refletem fielmente as condições encontradas no momento da verificação.
          </p>

          <div className="space-y-2">
            <Label>Assinatura *</Label>
            <div className="border-2 border-dashed border-primary/40 rounded-lg bg-white h-40 relative overflow-hidden">
              <SignatureCanvas
                ref={(r) => { sigRef.current = r; }}
                penColor="black"
                canvasProps={{
                  className: "w-full h-full",
                  style: { touchAction: "none", display: "block", width: "100%", height: "100%" },
                }}
                onEnd={() => setEmpty(sigRef.current?.isEmpty() ?? true)}
              />
              {empty && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-sm">
                  Assine aqui
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" onClick={handleClear} disabled={empty}>
                <Eraser className="h-3.5 w-3.5 mr-1" /> Limpar
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="flex-1" onClick={handleConfirm} disabled={!canSubmit}>
            <Check className="h-4 w-4 mr-1.5" />
            {signMut.isPending ? "Assinando..." : "Confirmar assinatura"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
