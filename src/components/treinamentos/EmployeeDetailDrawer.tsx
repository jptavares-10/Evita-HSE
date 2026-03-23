import { useState, useMemo } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrainings, useTrainingMatrix, useEmployeeRecords } from "@/hooks/useTrainings";
import { useAuth } from "@/contexts/AuthContext";
import { getRecordStatus, getRecordStatusInfo, MISSING_STATUS_INFO, formatDateBR } from "@/lib/trainings";
import { Pencil, Plus, FileText, Download } from "lucide-react";
import { RegisterCertificateModal } from "./RegisterCertificateModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  employee: any;
  onClose: () => void;
  onEdit: (emp: any) => void;
}

export function EmployeeDetailDrawer({ employee, onClose, onEdit }: Props) {
  const { company } = useAuth();
  const isExpired = company?.plan === "expired";
  const { data: trainings = [] } = useTrainings();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: records = [] } = useEmployeeRecords(employee?.id ?? null);
  const [certModal, setCertModal] = useState<{ trainingId: string; trainingName: string; validityMonths: number } | null>(null);

  const requiredTrainingIds = useMemo(() => {
    if (!employee) return [];
    return matrix.filter((m: any) => m.job_position_id === employee.job_position_id).map((m: any) => m.training_id);
  }, [matrix, employee]);

  const extraRecordTrainingIds = useMemo(() => {
    const required = new Set(requiredTrainingIds);
    return [...new Set(records.map((r: any) => r.training_id).filter((id: string) => !required.has(id)))];
  }, [records, requiredTrainingIds]);

  const getLatestRecord = (trainingId: string) => {
    return records
      .filter((r: any) => r.training_id === trainingId)
      .sort((a: any, b: any) => b.expires_at.localeCompare(a.expires_at))[0];
  };

  const getStatusForTraining = (trainingId: string) => {
    const latest = getLatestRecord(trainingId);
    if (!latest) return MISSING_STATUS_INFO;
    const t = trainings.find((t: any) => t.id === trainingId);
    return getRecordStatusInfo(latest.expires_at, t?.alert_days_before ?? 30);
  };

  const ActionBtn = ({ children, onClick, ...props }: any) => {
    if (isExpired) {
      return <Tooltip><TooltipTrigger asChild><span><Button disabled size="sm" {...props}>{children}</Button></span></TooltipTrigger><TooltipContent>Plano expirado</TooltipContent></Tooltip>;
    }
    return <Button onClick={onClick} size="sm" {...props}>{children}</Button>;
  };

  return (
    <>
      <Drawer open={!!employee} onOpenChange={(v) => !v && onClose()} direction="right">
        <DrawerContent className="fixed right-0 top-0 bottom-0 w-full max-w-lg rounded-none border-l flex flex-col">
          <DrawerHeader className="flex items-center justify-between">
            <div>
              <DrawerTitle>{employee?.name}</DrawerTitle>
              <p className="text-sm text-muted-foreground">{employee?.job_positions?.name} {employee?.sector ? `· ${employee.sector}` : ""}</p>
            </div>
            <ActionBtn variant="outline" onClick={() => onEdit(employee)}><Pencil className="h-3.5 w-3.5 mr-1" />Editar</ActionBtn>
          </DrawerHeader>

          <Tabs defaultValue="trainings" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4">
              <TabsTrigger value="trainings">Treinamentos</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="trainings" className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {requiredTrainingIds.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Obrigatórios</h4>
                  {requiredTrainingIds.map((tid: string) => {
                    const t = trainings.find((t: any) => t.id === tid);
                    if (!t) return null;
                    const statusInfo = getStatusForTraining(tid);
                    const latest = getLatestRecord(tid);
                    return (
                      <div key={tid} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{t.name}</span>
                          <Badge variant="outline" className={statusInfo.badgeClass}>{statusInfo.label}</Badge>
                        </div>
                        {latest && (
                          <div className="text-xs text-muted-foreground">
                            Realizado: {formatDateBR(latest.done_at)} · Vence: {formatDateBR(latest.expires_at)}
                            {latest.certificate_url && (
                              <a href={latest.certificate_url} target="_blank" rel="noreferrer" className="ml-2 text-primary hover:underline inline-flex items-center gap-1">
                                <Download className="h-3 w-3" />Certificado
                              </a>
                            )}
                          </div>
                        )}
                        <ActionBtn variant="outline" size="sm" onClick={() => setCertModal({ trainingId: tid, trainingName: t.name, validityMonths: t.validity_months })}>
                          <Plus className="h-3 w-3 mr-1" />Registrar certificado
                        </ActionBtn>
                      </div>
                    );
                  })}
                </div>
              )}

              {extraRecordTrainingIds.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Treinamentos adicionais</h4>
                  {extraRecordTrainingIds.map((tid: string) => {
                    const t = trainings.find((t: any) => t.id === tid);
                    if (!t) return null;
                    const statusInfo = getStatusForTraining(tid);
                    const latest = getLatestRecord(tid);
                    return (
                      <div key={tid} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{t.name}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Extra</Badge>
                            <Badge variant="outline" className={statusInfo.badgeClass}>{statusInfo.label}</Badge>
                          </div>
                        </div>
                        {latest && (
                          <div className="text-xs text-muted-foreground">
                            Realizado: {formatDateBR(latest.done_at)} · Vence: {formatDateBR(latest.expires_at)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2">
                <ActionBtn variant="outline" onClick={() => {
                  // Open cert modal with a picker — simplified: use first available training
                  const available = trainings.filter((t: any) => !requiredTrainingIds.includes(t.id) && !extraRecordTrainingIds.includes(t.id));
                  if (available.length > 0) {
                    setCertModal({ trainingId: available[0].id, trainingName: available[0].name, validityMonths: available[0].validity_months });
                  }
                }}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Adicionar treinamento extra
                </ActionBtn>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto px-4 pb-4">
              {records.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum certificado registrado ainda.</p>
              ) : (
                <div className="space-y-3">
                  {records.map((r: any) => (
                    <div key={r.id} className="border-l-2 border-primary/30 pl-4 py-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{r.trainings?.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        📅 Realizado: {formatDateBR(r.done_at)} · Vence: {formatDateBR(r.expires_at)}
                      </div>
                      {r.notes && <p className="text-xs text-muted-foreground italic">📝 {r.notes}</p>}
                      {r.certificate_url && (
                        <a href={r.certificate_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                          <FileText className="h-3 w-3" />{r.certificate_name || "Certificado"}
                        </a>
                      )}
                      <p className="text-[11px] text-muted-foreground">👤 Registrado por {r.profiles?.full_name || "—"}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DrawerContent>
      </Drawer>

      {certModal && employee && (
        <RegisterCertificateModal
          open={!!certModal}
          onOpenChange={(v) => !v && setCertModal(null)}
          employeeId={employee.id}
          trainingId={certModal.trainingId}
          trainingName={certModal.trainingName}
          validityMonths={certModal.validityMonths}
        />
      )}
    </>
  );
}
