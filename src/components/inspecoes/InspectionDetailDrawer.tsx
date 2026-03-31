import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useInspectionExecutions, useInspectionActions } from "@/hooks/useInspections";
import { InspectionDocumentsDetail } from "./InspectionDocumentsSection";
import { getInspectionStatusInfo, getInspectionFrequencyLabel, formatDateBR, RESULT_LABELS, RESULT_COLORS, ACTION_STATUS_LABELS, ACTION_STATUS_COLORS } from "@/lib/inspections";
import { CalendarDays, MapPin, User, Clock, FileText, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";

interface InspectionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection: any | null;
  onRegisterExecution: () => void;
  onCreateAction: (executionId?: string) => void;
  onCompleteAction: (action: any) => void;
}

export function InspectionDetailDrawer({ open, onOpenChange, inspection, onRegisterExecution, onCreateAction, onCompleteAction }: InspectionDetailDrawerProps) {
  const { data: executions = [] } = useInspectionExecutions(inspection?.id || null);
  const { data: actions = [] } = useInspectionActions(inspection?.id || null);

  if (!inspection) return null;

  const statusInfo = getInspectionStatusInfo(inspection.next_due_at, inspection.alert_days_before);
  const freqLabel = inspection.is_periodic
    ? getInspectionFrequencyLabel(inspection.frequency_type, inspection.frequency_preset, inspection.frequency_days)
    : "Avulsa";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">{inspection.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {inspection.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />{inspection.location}
              </div>
            )}
            {inspection.responsible && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />{inspection.responsible}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />{freqLabel}
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className={statusInfo.color}>{statusInfo.label}</span>
            </div>
          </div>

          {inspection.description && (
            <p className="text-sm text-muted-foreground">{inspection.description}</p>
          )}

          {/* Document links */}
          <InspectionDocumentsDetail inspectionId={inspection.id} />

          <Separator />

          {/* Actions section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ações Corretivas</h3>
              <Button size="sm" variant="outline" onClick={() => onCreateAction()}>
                <Plus className="h-3.5 w-3.5 mr-1" />Ação
              </Button>
            </div>
            {actions.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma ação registrada.</p>
            ) : (
              <div className="space-y-2">
                {actions.map((action: any) => (
                  <div key={action.id} className="border rounded-md p-3 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium flex-1">{action.description}</p>
                      <Badge variant="outline" className={ACTION_STATUS_COLORS[action.status] || ""}>
                        {ACTION_STATUS_LABELS[action.status] || action.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {action.responsible && <span>Resp: {action.responsible}</span>}
                      {action.due_date && <span>Prazo: {formatDateBR(action.due_date)}</span>}
                    </div>
                    {action.status !== "done" && (
                      <Button size="sm" variant="ghost" className="text-xs h-7 mt-1" onClick={() => onCompleteAction(action)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Concluir
                      </Button>
                    )}
                    {action.status === "done" && action.completion_notes && (
                      <p className="text-xs text-green-600 mt-1">✓ {action.completion_notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Executions timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Histórico de Execuções</h3>
              <Button size="sm" onClick={onRegisterExecution}>
                <Plus className="h-3.5 w-3.5 mr-1" />Registrar
              </Button>
            </div>
            {executions.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma execução registrada.</p>
            ) : (
              <div className="space-y-2">
                {executions.map((exec: any) => (
                  <div key={exec.id} className="border rounded-md p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{formatDateBR(exec.executed_at)}</span>
                      <Badge variant="outline" className={RESULT_COLORS[exec.result] || ""}>
                        {RESULT_LABELS[exec.result] || exec.result}
                      </Badge>
                    </div>
                    {exec.observations && <p className="text-xs text-muted-foreground">{exec.observations}</p>}
                    <div className="flex items-center justify-between">
                      {exec.profiles?.full_name && (
                        <span className="text-[10px] text-muted-foreground">por {exec.profiles.full_name}</span>
                      )}
                      {(exec.result === "nao_conforme" || exec.result === "parcial") && (
                        <Button size="sm" variant="ghost" className="text-xs h-6" onClick={() => onCreateAction(exec.id)}>
                          <AlertTriangle className="h-3 w-3 mr-1" />Criar ação
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
