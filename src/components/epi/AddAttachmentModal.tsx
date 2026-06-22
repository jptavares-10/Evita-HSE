import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";

interface Props {
  deliveryId: string | null;
  onClose: () => void;
}

export function AddAttachmentModal({ deliveryId, onClose }: Props) {
  const { company } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 5MB", variant: "destructive" });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      toast({ title: "Formato inválido", description: "Apenas JPG, PNG ou WebP", variant: "destructive" });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!file || !deliveryId || !company) return;
    setSaving(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${company.id}/${deliveryId}/comprovante.${ext}`;

      const { error: upErr } = await supabase.storage.from("epi-files").upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase
        .from("epi_deliveries")
        .update({ attachment_url: path, attachment_name: file.name })
        .eq("id", deliveryId);
      if (dbErr) throw dbErr;

      qc.invalidateQueries({ queryKey: ["epi-deliveries"] });
      qc.invalidateQueries({ queryKey: ["epi-employee-deliveries"] });
      toast({ title: "Comprovante adicionado" });
      handleClose();
    } catch (err: any) {
      toast({ title: "Erro ao salvar comprovante", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={!!deliveryId} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Comprovante</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Foto da assinatura, recibo ou comprovante da entrega</Label>
            <p className="text-xs text-muted-foreground mb-2">JPG, PNG ou WebP — máx. 5MB</p>
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Pré-visualização do comprovante" className="max-h-48 rounded-lg border" />
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
                className="w-full border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Clique para selecionar</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!file || saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
