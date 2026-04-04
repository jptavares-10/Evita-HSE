import { useState } from "react";
import { useJobPositions, useTrainings, useTrainingMatrix, useToggleMatrixEntry } from "@/hooks/useTrainings";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, Download, LayoutGrid } from "lucide-react";
import { ImportMatrixModal } from "@/components/treinamentos/ImportMatrixModal";
import { usePermission } from "@/hooks/usePermission";

export default function TreinamentosMatriz() {
  const { company } = useAuth();
  const isExpired = company?.plan === "expired";
  const { canEdit } = usePermission("trainings");
  const isDisabled = isExpired || !canEdit;
  const { data: positions = [] } = useJobPositions();
  const { data: trainings = [] } = useTrainings();
  const { data: matrix = [] } = useTrainingMatrix();
  const toggleEntry = useToggleMatrixEntry();
  const [importOpen, setImportOpen] = useState(false);

  const handleToggle = (jobPositionId: string, trainingId: string) => {
    if (isDisabled) return;
    const existing = matrix.find((m: any) => m.job_position_id === jobPositionId && m.training_id === trainingId);
    toggleEntry.mutate({ jobPositionId, trainingId, exists: !!existing, entryId: existing?.id });
  };

  const downloadTemplate = () => {
    downloadXlsx(
      [["Cargo", "Treinamento"], ["Operador", "NR-35"]],
      "modelo_matriz.xlsx"
    );
  };

  if (positions.length === 0 || trainings.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="text-muted-foreground">Cadastre cargos em Colaboradores e treinamentos em Treinamentos para montar a matriz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 justify-end">
        <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="h-4 w-4 mr-1" />Modelo XLSX</Button>
        {isDisabled ? (
          <Tooltip><TooltipTrigger asChild><span><Button variant="outline" size="sm" disabled><Upload className="h-4 w-4 mr-1" />Importar</Button></span></TooltipTrigger>
          <TooltipContent>{!canEdit ? "Somente leitura" : "Plano expirado"}</TooltipContent></Tooltip>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4 mr-1" />Importar</Button>
        )}
      </div>

      <div className="border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground sticky left-0 bg-muted/50 min-w-[180px]">Cargo</th>
              {trainings.map((t: any) => (
                <th key={t.id} className="p-3 font-medium text-muted-foreground text-center min-w-[120px]">
                  <span className="text-xs leading-tight block">{t.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((p: any) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 font-medium sticky left-0 bg-background">{p.name}</td>
                {trainings.map((t: any) => {
                  const checked = matrix.some((m: any) => m.job_position_id === p.id && m.training_id === t.id);
                  return (
                    <td key={t.id} className="p-3 text-center">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => handleToggle(p.id, t.id)}
                        disabled={isDisabled}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ImportMatrixModal open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
