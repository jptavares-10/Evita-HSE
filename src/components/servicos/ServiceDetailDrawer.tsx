import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useServiceAttachments, useServiceHistory } from "@/hooks/useServices";
import { formatDateBR, getFrequencyLabel, getStatusInfo, FILE_TYPE_LABELS, FILE_TYPE_BADGE_COLORS } from "@/lib/services";
import { ExternalLink, Pencil, FileText, Clock } from "lucide-react";

interface Service {
  id: string;
  name: string;
  category_id: string | null;
  frequency_type: string;
  frequency_preset: string | null;
  frequency_days: number | null;
  last_done_at: string;
  next_due_at: string;
  alert_days_before: number;
  supplier: string | null;
  notes: string | null;
  service_categories: { id: string; name: string; color: string } | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service: Service | null;
  onEdit: () => void;
}

export function ServiceDetailDrawer({ open, onOpenChange, service, onEdit }: Props) {
  const { data: attachments = [] } = useServiceAttachments(service?.id ?? null);
  const { data: history = [] } = useServiceHistory(service?.id ?? null);

  if (!service) return null;
  const statusInfo = getStatusInfo(service.next_due_at, service.alert_days_before);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {service.name}
            <Badge variant="outline" className={statusInfo.color}>{statusInfo.label}</Badge>
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Categoria</p>
                {service.service_categories && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: service.service_categories.color }} />
                    {service.service_categories.name}
                  </span>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Frequência</p>
                <p>{getFrequencyLabel(service.frequency_type, service.frequency_preset, service.frequency_days)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Última realização</p>
                <p>{formatDateBR(service.last_done_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Próxima data</p>
                <p>{formatDateBR(service.next_due_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fornecedor</p>
                <p>{service.supplier || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Alerta antecipado</p>
                <p>{service.alert_days_before} dias</p>
              </div>
            </div>
            {service.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Observações</p>
                <p className="whitespace-pre-wrap">{service.notes}</p>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Anexos</p>
                {attachments.map((att: any) => (
                  <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 text-sm bg-muted/50 px-3 py-2 rounded-md hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-primary">{att.file_name}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1.5 pl-6 text-xs">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${FILE_TYPE_BADGE_COLORS[att.file_type] || FILE_TYPE_BADGE_COLORS.other}`}>
                        {FILE_TYPE_LABELS[att.file_type] || att.file_type}
                      </Badge>
                      {att.reference_date && (
                        <span className="text-muted-foreground">· {formatDateBR(att.reference_date)}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}

            <Button variant="outline" onClick={onEdit} className="w-full">
              <Pencil className="h-4 w-4 mr-2" /> Editar serviço
            </Button>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Nenhuma realização registrada ainda
              </div>
            ) : (
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                {history.map((h: any) => {
                  const historyAttachments = attachments.filter((att: any) => att.reference_date === h.done_at);
                  return (
                    <div key={h.id} className="relative">
                      <div className="absolute -left-6 top-1 h-[18px] w-[18px] rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                        <Clock className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <p className="text-sm font-medium">{formatDateBR(h.done_at)}</p>
                        {h.supplier && <p className="text-xs text-muted-foreground">Fornecedor: {h.supplier}</p>}
                        {h.notes && <p className="text-xs text-muted-foreground">{h.notes}</p>}
                        <p className="text-xs text-muted-foreground">
                          Por: {h.profiles?.full_name || "—"}
                        </p>
                        {historyAttachments.length > 0 && (
                          <div className="mt-2 space-y-1 border-t pt-2">
                            {historyAttachments.map((att: any) => (
                              <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                                <FileText className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{att.file_name}</span>
                                <Badge variant="outline" className={`text-[9px] px-1 py-0 ${FILE_TYPE_BADGE_COLORS[att.file_type] || FILE_TYPE_BADGE_COLORS.other}`}>
                                  {FILE_TYPE_LABELS[att.file_type] || att.file_type}
                                </Badge>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
