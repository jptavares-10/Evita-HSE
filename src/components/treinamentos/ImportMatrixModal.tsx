import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { parseXlsx } from "@/lib/xlsx-utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportMatrixModal({ open, onOpenChange }: Props) {
  const { company } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImport = async () => {
    if (!file || !company) return;
    setImporting(true);
    setResult(null);

    try {
      const lines = await parseXlsx(file);
      if (lines.length < 2) { setResult("Arquivo vazio."); setImporting(false); return; }

      const header = lines[0].map((h) => h.toLowerCase());
      const cargoIdx = header.findIndex((h) => h.includes("cargo"));
      const treinIdx = header.findIndex((h) => h.includes("treinamento"));
      if (cargoIdx === -1 || treinIdx === -1) { setResult("Colunas 'Cargo' e 'Treinamento' são obrigatórias."); setImporting(false); return; }

      const { data: positions } = await supabase.from("job_positions").select("id, name");
      const { data: trainings } = await supabase.from("trainings").select("id, name");
      const posMap = new Map((positions ?? []).map((p) => [p.name.toLowerCase(), p.id]));
      const trainMap = new Map((trainings ?? []).map((t) => [t.name.toLowerCase(), t.id]));

      let imported = 0;
      let posCreated = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        const cargo = cols[cargoIdx];
        const trein = cols[treinIdx];
        if (!cargo || !trein) { errors.push(`Linha ${i + 1}: vazio`); continue; }

        const trainId = trainMap.get(trein.toLowerCase());
        if (!trainId) { errors.push(`Linha ${i + 1}: Treinamento "${trein}" não encontrado. Cadastre-o primeiro.`); continue; }

        let posId = posMap.get(cargo.toLowerCase());
        if (!posId) {
          const { data: newPos, error } = await supabase.from("job_positions").insert({ company_id: company.id, name: cargo }).select("id").single();
          if (error) { errors.push(`Linha ${i + 1}: Erro cargo`); continue; }
          posId = newPos.id;
          posMap.set(cargo.toLowerCase(), posId);
          posCreated++;
        }

        const { error } = await supabase.from("training_matrix").insert({ company_id: company.id, job_position_id: posId, training_id: trainId }).select().maybeSingle();
        if (error && !error.message.includes("duplicate")) { errors.push(`Linha ${i + 1}: ${error.message}`); continue; }
        imported++;
      }

      let msg = `${imported} vínculo${imported !== 1 ? "s" : ""} importado${imported !== 1 ? "s" : ""}.`;
      if (errors.length > 0) msg += ` ${errors.length} erro${errors.length !== 1 ? "s" : ""}.`;
      setResult(msg + (errors.length > 0 ? "\n" + errors.join("\n") : ""));

      qc.invalidateQueries({ queryKey: ["training-matrix"] });
      qc.invalidateQueries({ queryKey: ["job-positions"] });
      toast({ title: `${imported} vínculos importados` });
    } catch {
      setResult("Erro ao processar arquivo.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Importar matriz (CSV)</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">O arquivo deve conter: Cargo, Treinamento (cada linha = um vínculo obrigatório)</p>
          <Input type="file" accept=".csv" onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); }} />
          {result && <pre className="text-xs bg-muted p-3 rounded max-h-40 overflow-auto whitespace-pre-wrap">{result}</pre>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={handleImport} disabled={!file || importing}>{importing ? "Importando..." : "Importar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
