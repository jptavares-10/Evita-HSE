import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportEmployeesModal({ open, onOpenChange }: Props) {
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
      const text = await file.text();
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) { setResult("Arquivo vazio ou sem dados."); setImporting(false); return; }

      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = header.findIndex((h) => h.includes("nome"));
      const cargoIdx = header.findIndex((h) => h.includes("cargo"));
      const setorIdx = header.findIndex((h) => h.includes("setor"));

      if (nameIdx === -1 || cargoIdx === -1) { setResult("Colunas 'Nome' e 'Cargo' são obrigatórias."); setImporting(false); return; }

      // Get existing positions
      const { data: existingPositions } = await supabase.from("job_positions").select("id, name");
      const posMap = new Map((existingPositions ?? []).map((p) => [p.name.toLowerCase(), p.id]));

      let imported = 0;
      let positionsCreated = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        const name = cols[nameIdx];
        const cargo = cols[cargoIdx];
        const setor = setorIdx >= 0 ? cols[setorIdx] : null;

        if (!name || !cargo) { errors.push(`Linha ${i + 1}: Nome ou Cargo vazio`); continue; }

        let posId = posMap.get(cargo.toLowerCase());
        if (!posId) {
          const { data: newPos, error } = await supabase.from("job_positions").insert({ company_id: company.id, name: cargo }).select("id").single();
          if (error) { errors.push(`Linha ${i + 1}: Erro ao criar cargo "${cargo}"`); continue; }
          posId = newPos.id;
          posMap.set(cargo.toLowerCase(), posId);
          positionsCreated++;
        }

        const { error } = await supabase.from("employees").insert({ company_id: company.id, name, job_position_id: posId, sector: setor || null });
        if (error) { errors.push(`Linha ${i + 1}: ${error.message}`); continue; }
        imported++;
      }

      let msg = `${imported} colaborador${imported !== 1 ? "es" : ""} importado${imported !== 1 ? "s" : ""}.`;
      if (positionsCreated > 0) msg += ` ${positionsCreated} cargo${positionsCreated !== 1 ? "s" : ""} criado${positionsCreated !== 1 ? "s" : ""}.`;
      if (errors.length > 0) msg += ` ${errors.length} erro${errors.length !== 1 ? "s" : ""}.`;
      setResult(msg + (errors.length > 0 ? "\n" + errors.join("\n") : ""));

      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["job-positions"] });
      toast({ title: `${imported} colaboradores importados` });
    } catch {
      setResult("Erro ao processar arquivo.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Importar colaboradores (CSV)</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">O arquivo deve conter as colunas: Nome, Cargo, Setor (opcional)</p>
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
