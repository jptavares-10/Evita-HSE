import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eraser, Check, X, Maximize2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  summary: {
    employeeName: string;
    epiName: string;
    caNumber?: string | null;
    quantity: number;
    unit?: string | null;
    deliveredAt: string;
  };
  onConfirm: (signaturePng: string) => void;
}

export function SignatureKioskModal({ open, onOpenChange, summary, onConfirm }: Props) {
  const ref = useRef<SignatureCanvas | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    if (!open) setEmpty(true);
  }, [open]);

  const requestFs = async () => {
    try {
      const el = wrapRef.current;
      if (el && !document.fullscreenElement) await el.requestFullscreen();
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    ref.current?.clear();
    setEmpty(true);
  };

  const handleConfirm = () => {
    if (!ref.current || ref.current.isEmpty()) return;
    const png = ref.current.getTrimmedCanvas().toDataURL("image/png");
    onConfirm(png);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (!empty && !confirm("Descartar assinatura?")) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onOpenChange(false);
  };

  const fmt = (d: string) => {
    try {
      return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
    } catch {
      return d;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : handleCancel())}>
      <DialogContent
        className="max-w-none w-screen h-screen sm:rounded-none p-0 flex flex-col bg-background [&>button.absolute]:hidden"
      >
        <div ref={wrapRef} className="flex flex-col h-full">
          {/* Header */}
          <div className="px-8 py-5 border-b bg-card flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Coleta de assinatura</h2>
              <p className="text-sm text-muted-foreground">Confira os dados e assine no quadro abaixo</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={requestFs}>
                <Maximize2 className="h-4 w-4 mr-1" /> Tela cheia
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="px-8 py-5 grid grid-cols-2 gap-x-10 gap-y-3 bg-muted/30 border-b">
            <Field label="Colaborador" value={summary.employeeName} big />
            <Field label="EPI" value={summary.epiName} big />
            <Field label="CA" value={summary.caNumber || "—"} />
            <Field
              label="Quantidade"
              value={`${summary.quantity} ${summary.unit || ""}`.trim()}
            />
            <Field label="Data" value={fmt(summary.deliveredAt)} />
          </div>

          {/* Consent */}
          <div className="px-8 py-4 border-b">
            <p className="text-sm leading-relaxed">
              <strong>Declaro</strong> ter recebido o EPI acima, em perfeitas condições, ciente do uso
              correto, guarda e conservação, conforme <strong>NR-6</strong> e art. 158 da CLT.
            </p>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-6 flex flex-col min-h-0">
            <div className="flex-1 border-2 border-dashed border-primary/40 rounded-lg bg-white relative overflow-hidden min-h-[240px]">
              <SignatureCanvas
                ref={(r) => {
                  ref.current = r;
                }}
                penColor="black"
                canvasProps={{
                  className: "w-full h-full",
                  style: { touchAction: "none", display: "block", width: "100%", height: "100%" },
                }}
                onEnd={() => setEmpty(ref.current?.isEmpty() ?? true)}
              />
              {empty && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-muted-foreground text-lg">Assine aqui com o dedo</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-5 border-t bg-card flex items-center justify-between gap-4">
            <Button variant="outline" size="lg" onClick={handleClear} disabled={empty}>
              <Eraser className="h-5 w-5 mr-2" /> Limpar
            </Button>
            <Button size="lg" className="min-w-[220px] text-base" onClick={handleConfirm} disabled={empty}>
              <Check className="h-5 w-5 mr-2" /> Confirmar assinatura
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
      <div className={big ? "text-lg font-semibold" : "text-base"}>{value}</div>
    </div>
  );
}