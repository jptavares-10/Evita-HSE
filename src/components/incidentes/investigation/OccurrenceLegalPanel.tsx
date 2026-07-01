import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign } from "lucide-react";
import { useUpdateOccurrenceExtras } from "@/hooks/useInvestigation";
import { formatCurrencyBR } from "@/lib/investigation";

interface Props { occurrence: any; canEdit: boolean; disabled?: boolean; }

export function OccurrenceLegalPanel({ occurrence, canEdit, disabled }: Props) {
  const update = useUpdateOccurrenceExtras();
  const [cat, setCat] = useState(occurrence.cat_number || "");
  const [catDate, setCatDate] = useState(occurrence.cat_issued_at ? occurrence.cat_issued_at.split("T")[0] : "");
  const [cost, setCost] = useState<string>(occurrence.cost_estimated ?? "");

  useEffect(() => {
    setCat(occurrence.cat_number || "");
    setCatDate(occurrence.cat_issued_at ? occurrence.cat_issued_at.split("T")[0] : "");
    setCost(occurrence.cost_estimated ?? "");
  }, [occurrence.id]);

  const catRequired = occurrence.cat_required;
  const missingCat = catRequired && !occurrence.cat_number;

  return (
    <div className="space-y-3">
      {missingCat && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 text-xs">
            <b>CAT obrigatória:</b> Incidente com afastamento ou gravidade alta requer emissão da Comunicação de Acidente de Trabalho ao INSS em até 1 dia útil (Lei 8.213/91, art. 22).
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            Nº da CAT
            {catRequired && <Badge className="bg-red-100 text-red-800 border-red-200 text-[9px]">Obrigatória</Badge>}
          </Label>
          <Input value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Ex.: 2024/00123" className="h-8 text-sm" disabled={!canEdit || disabled} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Data emissão</Label>
          <Input type="date" value={catDate} onChange={(e) => setCatDate(e.target.value)} className="h-8 text-sm" disabled={!canEdit || disabled} />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs flex items-center gap-1"><DollarSign className="h-3 w-3" />Custo estimado (R$)</Label>
          <Input type="number" step="0.01" value={cost as any} onChange={(e) => setCost(e.target.value)} placeholder="0,00" className="h-8 text-sm" disabled={!canEdit || disabled} />
          {cost !== "" && <p className="text-[10px] text-muted-foreground">= {formatCurrencyBR(Number(cost))}</p>}
        </div>
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => update.mutate({
            id: occurrence.id,
            cat_number: cat || null,
            cat_issued_at: catDate ? new Date(catDate).toISOString() : null,
            cost_estimated: cost === "" ? null : Number(cost),
          })} disabled={disabled || update.isPending}>Salvar</Button>
        </div>
      )}
    </div>
  );
}