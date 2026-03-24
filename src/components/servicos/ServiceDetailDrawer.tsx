import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useServiceAttachments, useServiceHistory } from "@/hooks/useServices";
import { formatDateBR, getFrequencyLabel, getStatusInfo, FILE_TYPE_LABELS, FILE_TYPE_BADGE_COLORS } from "@/lib/services";
import { ExternalLink, Pencil, FileText, Clock, X, Check, Download, Calendar, Building2, Bell, MessageSquare, Paperclip, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSignedUrls } from "@/hooks/useSignedUrl";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

function formatDateTimeBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}

function exportHistoryCSV(history: any[], serviceName: string) {
  const rows = [["Data", "Tipo", "Fornecedor", "Observação", "Motivo da falha", "Registrado por"]];
  for (const h of history) {
    rows.push([
      formatDateBR(h.done_at),
      h.realization_type === "corrective" ? "Corretivo" : "Programado",
      h.supplier || "",
      h.notes || "",
      h.failure_description || "",
      h.profiles?.full_name || "",
    ]);
  }
  const csv = rows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = serviceName.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, "_").substring(0, 40);
  a.href = url;
  a.download = `historico_${safeName}_${format(new Date(), "dd-MM-yyyy")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ServiceDetailDrawer({ open, onOpenChange, service, onEdit }: Props) {
  const { data: attachments = [] } = useServiceAttachments(service?.id ?? null);
  const { data: history = [] } = useServiceHistory(service?.id ?? null);
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  // Resolve signed URLs for all attachments
  const attachmentUrls = useMemo(() => attachments.map((a: any) => a.file_url).filter(Boolean), [attachments]);
  const signedMap = useSignedUrls("service-attachments", attachmentUrls);

  if (!service) return null;
  const statusInfo = getStatusInfo(service.next_due_at, service.alert_days_before);

  const generalAttachments = attachments.filter((att: any) => !att.reference_date);

  const handleSaveNote = async (historyId: string) => {
    if (!profile) return;
    const { error } = await supabase
      .from("service_history")
      .update({
        notes: editingNoteText || null,
        notes_edited_at: new Date().toISOString(),
        notes_edited_by: profile.id,
      })
      .eq("id", historyId);

    if (error) {
      toast({ title: "Erro ao atualizar observação", variant: "destructive" });
    } else {
      toast({ title: "Observação atualizada" });
      queryClient.invalidateQueries({ queryKey: ["service-history"] });
    }
    setEditingNoteId(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="flex items-center gap-2 flex-wrap">
            {service.name}
            {service.service_categories && (
              <Badge variant="outline" className="text-xs">
                <span className="h-2 w-2 rounded-full mr-1.5 inline-block" style={{ backgroundColor: service.service_categories.color }} />
                {service.service_categories.name}
              </Badge>
            )}
            <Badge variant="outline" className={statusInfo.color}>{statusInfo.label}</Badge>
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 w-auto">
            <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-1.5">
              Histórico
              {history.length > 0 && (
                <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[10px]">{history.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Frequência</p>
                <p className="font-medium">{getFrequencyLabel(service.frequency_type, service.frequency_preset, service.frequency_days)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alerta antecipado</p>
                <p className="font-medium flex items-center gap-1.5"><Bell className="h-3.5 w-3.5 text-muted-foreground" />{service.alert_days_before} dias</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Última realização</p>
                <p className="font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />{formatDateBR(service.last_done_at)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Próxima data</p>
                <p className="font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />{formatDateBR(service.next_due_at)}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fornecedor</p>
                <p className="font-medium flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{service.supplier || "—"}</p>
              </div>
            </div>

            <div className="space-y-1.5 border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />Observação geral do serviço
              </p>
              {service.notes ? (
                <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3">{service.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground/60 italic">Nenhuma observação geral</p>
              )}
              <p className="text-[11px] text-muted-foreground/60">
                Esta observação descreve o serviço em geral. Observações de cada realização ficam no Histórico.
              </p>
            </div>

            {generalAttachments.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5" />Anexos gerais
                </p>
                {generalAttachments.map((att: any) => (
                  <a key={att.id} href={signedMap[att.file_url] || "#"} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 text-sm bg-muted/50 px-3 py-2 rounded-md hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-primary">{att.file_name}</span>
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1.5 pl-6 text-xs">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${FILE_TYPE_BADGE_COLORS[att.file_type] || FILE_TYPE_BADGE_COLORS.other}`}>
                        {FILE_TYPE_LABELS[att.file_type] || att.file_type}
                      </Badge>
                    </div>
                  </a>
                ))}
              </div>
            )}

            <Button variant="outline" onClick={onEdit} className="w-full">
              <Pencil className="h-4 w-4 mr-2" /> Editar serviço
            </Button>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
            {/* Export button */}
            {history.length > 0 && (
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={() => exportHistoryCSV(history, service.name)}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Exportar histórico
                </Button>
              </div>
            )}

            {history.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma realização registrada ainda.</p>
                <p className="text-xs text-muted-foreground/60">Use o botão "Registrar realização" para começar.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                {history.map((h: any) => {
                  const historyAttachments = attachments.filter((att: any) => att.reference_date === h.done_at);
                  const isEditing = editingNoteId === h.id;
                  const isCorrective = h.realization_type === "corrective";

                  return (
                    <div key={h.id} className="relative">
                      <div className="absolute -left-6 top-1.5 h-[18px] w-[18px] rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                        <Clock className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        {/* Type badge + date */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={isCorrective ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-green-100 text-green-700 border-green-200"} variant="outline">
                            {isCorrective ? (
                              <><AlertTriangle className="h-3 w-3 mr-1" />Corretivo</>
                            ) : (
                              <><Calendar className="h-3 w-3 mr-1" />Programado</>
                            )}
                          </Badge>
                          <span className="text-sm font-semibold">📅 {formatDateBR(h.done_at)}</span>
                        </div>

                        {/* Supplier */}
                        {h.supplier && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            🏢 Fornecedor: <span className="font-medium text-foreground">{h.supplier}</span>
                          </p>
                        )}

                        {/* Failure description for corrective */}
                        {isCorrective && h.failure_description && (
                          <p className="text-xs italic text-orange-700 bg-orange-50 rounded px-2 py-1.5">
                            ⚠️ Motivo: {h.failure_description}
                          </p>
                        )}

                        {/* Notes */}
                        <div className="text-xs space-y-1">
                          <p className="text-muted-foreground font-medium">📝 Observação:</p>
                          {isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                rows={3}
                                className="text-xs"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSaveNote(h.id)}>
                                  <Check className="h-3 w-3 mr-1" /> Salvar
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingNoteId(null)}>
                                  <X className="h-3 w-3 mr-1" /> Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="group flex items-start gap-1">
                              {h.notes ? (
                                <p className="text-foreground/80 whitespace-pre-wrap flex-1 bg-background/50 rounded px-2 py-1.5">"{h.notes}"</p>
                              ) : (
                                <p className="text-muted-foreground/60 italic flex-1">Nenhuma observação registrada</p>
                              )}
                              <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted mt-0.5"
                                onClick={() => {
                                  setEditingNoteId(h.id);
                                  setEditingNoteText(h.notes || "");
                                }}
                                title="Editar observação"
                              >
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </div>
                          )}

                          {h.notes_edited_at && !isEditing && (
                            <p className="text-muted-foreground/60 italic pl-2">
                              Editado por {h.notes_editor?.full_name || "—"} {formatDateTimeBR(h.notes_edited_at)}
                            </p>
                          )}
                        </div>

                        {/* Attachments */}
                        {historyAttachments.length > 0 && (
                          <div className="space-y-1.5 border-t pt-2">
                            <p className="text-xs text-muted-foreground font-medium">📎 Anexos desta realização:</p>
                            {historyAttachments.map((att: any) => (
                              <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs hover:bg-muted/80 rounded px-2 py-1 transition-colors">
                                <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                <span className="truncate text-primary font-medium">{att.file_name}</span>
                                <Badge variant="outline" className={`text-[9px] px-1 py-0 ${FILE_TYPE_BADGE_COLORS[att.file_type] || FILE_TYPE_BADGE_COLORS.other}`}>
                                  {FILE_TYPE_LABELS[att.file_type] || att.file_type}
                                </Badge>
                                {att.reference_date && (
                                  <span className="text-muted-foreground">· {formatDateBR(att.reference_date)}</span>
                                )}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Registered by */}
                        <p className="text-[11px] text-muted-foreground border-t pt-2">
                          👤 Registrado por {h.profiles?.full_name || "—"} {formatDateTimeBR(h.created_at)}
                        </p>
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
