import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInspectionExecutions } from "@/hooks/useInspections";
import { getExecutionDisplayStatus, STATUS_CONFIG, formatDateBR } from "@/lib/inspections";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTablePagination } from "@/hooks/useTablePagination";
import { DataTablePagination } from "@/components/DataTablePagination";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  model: any | null;
}

export function ModelHistoryDrawer({ open, onOpenChange, model }: Props) {
  const { data: allExecutions = [] } = useInspectionExecutions();
  const navigate = useNavigate();

  const modelExecutions = model
    ? allExecutions
        .filter((e: any) => e.model_id === model.id)
        .sort((a: any, b: any) => b.due_date.localeCompare(a.due_date))
    : [];

  const completedOnTime = modelExecutions.filter((e: any) => {
    const st = getExecutionDisplayStatus(e.status, e.due_date);
    return st === "completed" || st === "completed_with_issues";
  }).length;

  const rate = modelExecutions.length > 0 ? Math.round((completedOnTime / modelExecutions.length) * 100) : 0;

  const pagination = useTablePagination(modelExecutions);

  if (!model) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Histórico — {model.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {modelExecutions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma execução registrada ainda.</p>
            </div>
          ) : (
            <>
              <div className="relative pl-6 space-y-3">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                {modelExecutions.map((exec: any) => {
                  const displayStatus = getExecutionDisplayStatus(exec.status, exec.due_date);
                  const cfg = STATUS_CONFIG[displayStatus];
                  return (
                    <div key={exec.id} className="relative">
                      <div className="absolute -left-6 top-1.5 h-[18px] w-[18px] rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                        <Clock className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <button
                        onClick={() => { onOpenChange(false); navigate(`/inspecoes/${exec.id}`); }}
                        className="w-full text-left bg-muted/50 rounded-lg p-3 hover:bg-muted/80 transition-colors space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">📅 {formatDateBR(exec.due_date)}</span>
                          <Badge variant="outline" className={`text-[10px] ${cfg.bgColor} ${cfg.color}`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{exec.reference}</p>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-1">
                <p className="text-xs text-muted-foreground">Total de execuções: <strong>{modelExecutions.length}</strong></p>
                <p className="text-xs text-muted-foreground">Taxa de conclusão: <strong>{rate}%</strong></p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
