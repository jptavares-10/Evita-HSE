import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmployeeDeliveries } from "@/hooks/useEpiFicha";
import { useEmployees } from "@/hooks/useTrainings";
import { formatDateBR } from "@/lib/epi";
import { useSignedUrls } from "@/hooks/useSignedUrl";
import { Plus, Download, X, FileImage } from "lucide-react";
import { DeliveryDrawer } from "@/components/epi/DeliveryDrawer";
import { AddAttachmentModal } from "@/components/epi/AddAttachmentModal";

interface Props {
  employeeId: string | null;
  onClose: () => void;
}

export function EpiFichaDrawer({ employeeId, onClose }: Props) {
  const { data: employees = [] } = useEmployees();
  const { data: deliveries = [] } = useEmployeeDeliveries(employeeId);
  const [deliveryDrawerOpen, setDeliveryDrawerOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [attachModalDeliveryId, setAttachModalDeliveryId] = useState<string | null>(null);

  const employee = useMemo(() => {
    if (!employeeId) return null;
    return employees.find((e: any) => e.id === employeeId) || null;
  }, [employees, employeeId]);

  // Group deliveries by EPI type
  const grouped = useMemo(() => {
    const map = new Map<string, { epiName: string; caNumber: string | null; unit: string; deliveries: any[] }>();
    deliveries.forEach((d: any) => {
      const key = d.epi_type_id;
      if (!map.has(key)) {
        map.set(key, {
          epiName: d.epi_types?.name || "—",
          caNumber: d.epi_types?.ca_number || null,
          unit: d.epi_types?.unit || "un",
          deliveries: [],
        });
      }
      map.get(key)!.deliveries.push(d);
    });
    // Sort groups by most recent delivery first
    return Array.from(map.values()).sort((a, b) => {
      const aDate = a.deliveries[0]?.delivered_at || "";
      const bDate = b.deliveries[0]?.delivered_at || "";
      return bDate > aDate ? 1 : -1;
    });
  }, [deliveries]);

  // Collect all attachment URLs for signed URL resolution
  const attachmentUrls = useMemo(() => {
    return deliveries
      .filter((d: any) => d.attachment_url)
      .map((d: any) => d.attachment_url as string);
  }, [deliveries]);

  const signedUrls = useSignedUrls("epi-files", attachmentUrls);

  const totalEpis = grouped.length;

  return (
    <>
      <Sheet open={!!employeeId} onOpenChange={(v) => { if (!v) onClose(); }}>
        <SheetContent className="sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="text-xl">{employee?.name || "Colaborador"}</SheetTitle>
            <div className="text-sm text-muted-foreground">
              {employee?.job_positions?.name || "—"} • {employee?.sector || "—"}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{totalEpis} EPIs entregues</Badge>
              {employee?.status === "inactive" && <Badge variant="outline">Inativo</Badge>}
            </div>
          </SheetHeader>

          <Separator className="my-4" />

          <ScrollArea className="flex-1 px-6 pb-4">
            {grouped.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma entrega registrada.</p>
            ) : (
              <div className="space-y-6">
                {grouped.map((group, gi) => (
                  <div key={gi} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{group.epiName}</span>
                      {group.caNumber && (
                        <Badge variant="outline" className="text-xs font-normal">CA: {group.caNumber}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Entregas:</p>
                    <div className="space-y-4">
                      {group.deliveries.map((d: any) => {
                        const signedUrl = d.attachment_url ? signedUrls[d.attachment_url] : null;
                        return (
                          <div key={d.id} className="flex gap-3">
                            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-[13px] font-bold">{formatDateBR(d.delivered_at)}</p>
                              <p className="text-sm text-muted-foreground">
                                Qtd: {d.quantity} {group.unit}
                                {d.reason && <> &nbsp;|&nbsp; Motivo: {d.reason}</>}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Entregue por: {d.profiles?.full_name || "—"}
                              </p>
                              {signedUrl && (
                                <button
                                  type="button"
                                  onClick={() => setLightboxUrl(signedUrl)}
                                  className="mt-1 rounded border overflow-hidden w-20 h-20 hover:opacity-80 transition-opacity"
                                >
                                  <img src={signedUrl} alt="Comprovante" className="w-full h-full object-cover" />
                                </button>
                              )}
                              {!d.attachment_url && (
                                <button
                                  type="button"
                                  onClick={() => setAttachModalDeliveryId(d.id)}
                                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                >
                                  <FileImage className="h-3 w-3" /> Adicionar comprovante
                                </button>
                              )}
                              {d.notes && (
                                <p className="text-sm italic text-muted-foreground">{d.notes}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t">
            <Button className="w-full" onClick={() => setDeliveryDrawerOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Nova entrega para este colaborador
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-[90%] max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxUrl} alt="Comprovante" className="max-w-full max-h-[80vh] rounded-lg" />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button size="icon" variant="secondary" asChild>
                <a href={lightboxUrl} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
              </Button>
              <Button size="icon" variant="secondary" onClick={() => setLightboxUrl(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeliveryDrawer
        open={deliveryDrawerOpen}
        onOpenChange={setDeliveryDrawerOpen}
        defaultEmployeeId={employeeId || undefined}
      />

      <AddAttachmentModal
        deliveryId={attachModalDeliveryId}
        onClose={() => setAttachModalDeliveryId(null)}
      />
    </>
  );
}
