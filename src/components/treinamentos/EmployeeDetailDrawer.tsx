import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrainings, useTrainingMatrix, useEmployeeRecords } from "@/hooks/useTrainings";
import { useAuth } from "@/contexts/AuthContext";
import { getRecordStatus, getRecordStatusInfo, MISSING_STATUS_INFO, formatDateBR } from "@/lib/trainings";
import { Pencil, Plus, FileText, Download, Trash2 } from "lucide-react";
import { useDeleteEmployee } from "@/hooks/useTrainings";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RegisterCertificateModal } from "./RegisterCertificateModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getSignedUrl } from "@/lib/storage-utils";
import { usePermission } from "@/hooks/usePermission";

function CertificateLink({ url, label = "Certificado" }: { url: string; label?: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    getSignedUrl("training-certificates", url).then((u) => { if (!cancelled) setSignedUrl(u); });
    return () => { cancelled = true; };
  }, [url]);
  if (!signedUrl) return <span className="text-xs text-muted-foreground ml-2">Carregando...</span>;
  return (
    <a href={signedUrl} target="_blank" rel="noreferrer" className="ml-2 text-xs text-primary hover:underline inline-flex items-center gap-1">
      <Download className="h-3 w-3" />{label}
    </a>
  );
}

interface Props {
  employee: any;
  onClose: () => void;
  onEdit: (emp: any) => void;
}

export function EmployeeDetailDrawer({ employee, onClose, onEdit }: Props) {
  const { company } = useAuth();
  const isExpired = company?.plan === "expired";
  const { canEdit } = usePermission("trainings");
  const { data: trainings = [] } = useTrainings();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: records = [] } = useEmployeeRecords(employee?.id ?? null);
  const deleteEmployee = useDeleteEmployee();
  const [certModal, setCertModal] = useState<{ trainingId: string; trainingName: string; validityMonths: number; hasExpiry: boolean } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
    if (t?.has_expiry === false) {
      return { status: "ok" as const, label: "Sem vencimento", color: "text-green-600", badgeClass: "bg-green-100 text-green-700 border-green-200" };
    }
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
      <Sheet open={!!employee} onOpenChange={(v) => !v && onClose()}>
        <SheetContent side="right" className="sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between pr-8">
              <div>
                <SheetTitle>{employee?.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{employee?.job_positions?.name} {employee?.job_positions?.sectors?.name ? `· ${employee.job_positions.sectors.name}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <ActionBtn variant="outline" onClick={() => onEdit(employee)}><Pencil className="h-3.5 w-3.5 mr-1" />Editar</ActionBtn>
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" disabled={isExpired}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir colaborador?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O colaborador <strong>{employee?.name}</strong> e todos os seus registros de treinamento serão excluídos permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => {
                          deleteEmployee.mutate(employee.id, {
                            onSuccess: () => { setDeleteOpen(false); onClose(); },
                          });
                        }}
                      >Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </SheetHeader>

          <Tabs defaultValue="trainings" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6">
              <TabsTrigger value="trainings">Treinamentos</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="trainings" className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
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
                            Realizado: {formatDateBR(latest.done_at)}{t.has_expiry !== false ? ` · Vence: ${formatDateBR(latest.expires_at)}` : ""}
                            {latest.certificate_url && (
                              <CertificateLink url={latest.certificate_url} />
                            )}
                          </div>
                        )}
                        <ActionBtn variant="outline" size="sm" onClick={() => setCertModal({ trainingId: tid, trainingName: t.name, validityMonths: t.validity_months, hasExpiry: t.has_expiry !== false })}>
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
                  const available = trainings.filter((t: any) => !requiredTrainingIds.includes(t.id) && !extraRecordTrainingIds.includes(t.id));
                  if (available.length > 0) {
                   setCertModal({ trainingId: available[0].id, trainingName: available[0].name, validityMonths: available[0].validity_months, hasExpiry: available[0].has_expiry !== false });
                  }
                }}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Adicionar treinamento extra
                </ActionBtn>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto px-6 pb-4">
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
                        <CertificateLink url={r.certificate_url} label={r.certificate_name || "Certificado"} />
                      )}
                      <p className="text-[11px] text-muted-foreground">👤 Registrado por {r.profiles?.full_name || "—"}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {certModal && employee && (
        <RegisterCertificateModal
          open={!!certModal}
          onOpenChange={(v) => !v && setCertModal(null)}
          employeeId={employee.id}
          trainingId={certModal.trainingId}
          trainingName={certModal.trainingName}
          validityMonths={certModal.validityMonths}
          hasExpiry={certModal.hasExpiry}
        />
      )}
    </>
  );
}
