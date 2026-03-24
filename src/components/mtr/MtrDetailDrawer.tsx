import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateBR, getCdfStatusInfo, formatTons } from "@/lib/mtr";
import { Download, Edit, FileText, User, Calendar } from "lucide-react";
import { useSignedUrls } from "@/hooks/useSignedUrl";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mtr: any;
  onEdit: () => void;
}

export function MtrDetailDrawer({ open, onOpenChange, mtr, onEdit }: Props) {
  const fileUrls = useMemo(() => {
    if (!mtr) return [];
    return [mtr.mtr_file_url, mtr.cdf_file_url].filter(Boolean);
  }, [mtr?.mtr_file_url, mtr?.cdf_file_url]);
  const signedMap = useSignedUrls("mtr-files", fileUrls);

  if (!mtr) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>MTR {mtr.mtr_number}</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-5 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Número MTR</span>
                <span className="font-medium">{mtr.mtr_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data de emissão</span>
                <span>{formatDateBR(mtr.issued_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transportadora</span>
                <span>{mtr.transporter || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prazo CDF</span>
                <span>{formatDateBR(mtr.cdf_deadline_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status CDF</span>
                <Badge className={statusInfo.badgeClass}>{statusInfo.label}</Badge>
              </div>
            </div>

            {/* Waste items */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Categorias de Resíduo</h4>
              <div className="space-y-1.5">
                {(mtr.mtr_waste_items || []).map((wi: any) => (
                  <div key={wi.id} className="flex items-center justify-between text-sm">
                    <Badge style={{ backgroundColor: wi.waste_categories?.color + "20", color: wi.waste_categories?.color, borderColor: wi.waste_categories?.color }} className="text-xs">
                      {wi.waste_categories?.name}
                    </Badge>
                    <span>{wi.quantity_tons != null ? formatTons(wi.quantity_tons) + " ton" : "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Files */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Documentos</h4>
              {mtr.mtr_file_url ? (
                <a href={mtr.mtr_file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />{mtr.mtr_file_name || "Arquivo MTR"}<Download className="h-3.5 w-3.5" />
                </a>
              ) : <p className="text-sm text-muted-foreground">Nenhum arquivo MTR anexado.</p>}
              {mtr.cdf_file_url ? (
                <a href={mtr.cdf_file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />{mtr.cdf_file_name || "Arquivo CDF"}<Download className="h-3.5 w-3.5" />
                </a>
              ) : mtr.cdf_status === "received" ? <p className="text-sm text-muted-foreground">Nenhum arquivo CDF anexado.</p> : null}
            </div>

            {/* CDF info */}
            {mtr.cdf_status === "received" && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Dados do CDF</h4>
                <div className="text-sm space-y-1">
                  <p>Número: {mtr.cdf_number}</p>
                  <p>Recebido em: {formatDateBR(mtr.cdf_received_at)}</p>
                  {mtr.cdf_notes && <p>Observações: {mtr.cdf_notes}</p>}
                </div>
              </div>
            )}

            {mtr.notes && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Observações</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{mtr.notes}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5" />Registrado por {mtr.profiles?.full_name || "—"} em {formatDateBR(mtr.created_at?.split("T")[0])}
            </div>

            <Button variant="outline" className="w-full" onClick={onEdit}><Edit className="h-4 w-4 mr-2" />Editar MTR</Button>
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-4">
            <div className="border-l-2 border-muted pl-4 space-y-4">
              {mtr.cdf_status === "received" && (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500" />
                  <p className="text-sm font-medium">CDF registrado</p>
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="inline h-3 w-3 mr-1" />{formatDateBR(mtr.cdf_received_at)} · CDF nº {mtr.cdf_number}
                  </p>
                </div>
              )}
              {mtr.mtr_file_url && (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <p className="text-sm font-medium">Arquivo MTR anexado</p>
                  <p className="text-xs text-muted-foreground">{mtr.mtr_file_name}</p>
                </div>
              )}
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-muted-foreground" />
                <p className="text-sm font-medium">MTR criado</p>
                <p className="text-xs text-muted-foreground">
                  por {mtr.profiles?.full_name || "—"} em {formatDateBR(mtr.created_at?.split("T")[0])}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
