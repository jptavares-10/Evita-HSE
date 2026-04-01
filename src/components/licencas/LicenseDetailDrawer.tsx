import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Download, ExternalLink, Calendar, Clock, User, Pencil, RotateCw } from "lucide-react";
import { computeLicenseStatus, getStatusBadgeInfo, getSphereBadgeInfo, getDaysRemainingInfo, formatDateBR, formatDateTimeBR } from "@/lib/licenses";
import { useLicenseRenewals } from "@/hooks/useLicenses";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { usePermission } from "@/hooks/usePermission";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  license: any | null;
  onEdit: () => void;
  onRenew: () => void;
  isExpired: boolean;
}

export function LicenseDetailDrawer({ open, onOpenChange, license, onEdit, onRenew, isExpired }: Props) {
  const { canEdit } = usePermission("environmental_licenses");
  const { data: renewals = [] } = useLicenseRenewals(license?.id ?? null);
  const signedUrl = useSignedUrl("environmental-licenses", license?.file_url);

  if (!license) return null;

  const status = computeLicenseStatus(license.has_expiry, license.expires_at, license.alert_days_before, license.status);
  const statusInfo = getStatusBadgeInfo(status);
  const sphereInfo = getSphereBadgeInfo(license.sphere);
  const daysInfo = getDaysRemainingInfo(license.has_expiry, license.expires_at, license.alert_days_before, license.status);
  const isPermanent = status === "permanent";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 flex-wrap">
            <span>{license.license_number}</span>
            <Badge variant="outline" className={statusInfo.className}>{statusInfo.label}</Badge>
            <Badge variant="outline" className={sphereInfo.className}>{sphereInfo.label}</Badge>
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{license.title}</p>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Histórico de Renovações</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-5 mt-4">
            <div className="space-y-3">
              <DetailRow label="Tipo de licença" value={license.license_types?.name || "Sem tipo"} />
              <DetailRow label="Órgão emissor" value={license.issuing_body} />
              <DetailRow label="Data de emissão" value={formatDateBR(license.issued_at)} />
              <DetailRow label="Data de vencimento" value={license.has_expiry ? formatDateBR(license.expires_at) : "Permanente"} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dias restantes</span>
                <span className={`font-semibold ${daysInfo.color}`}>{daysInfo.label}</span>
              </div>
              {license.has_expiry && (
                <DetailRow label="Alerta configurado" value={`${license.alert_days_before} dias antes`} />
              )}
            </div>

            {license.conditionants && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Condicionantes</p>
                <div className="text-sm bg-muted/50 rounded-lg p-3 whitespace-pre-wrap max-h-40 overflow-y-auto">{license.conditionants}</div>
              </div>
            )}

            {license.notes && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Observações</p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{license.notes}</p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Documento atual</p>
              {signedUrl ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />Visualizar
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={signedUrl} download={license.file_name}>
                      <Download className="h-4 w-4 mr-1" />Baixar
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Nenhum documento anexado</p>
              )}
            </div>

            {license.profiles && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                Registrado por {license.profiles.full_name} em {formatDateBR(license.created_at)}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button variant="outline" onClick={onEdit} disabled={isExpired}>
                      <Pencil className="h-4 w-4 mr-1" />Editar licença
                    </Button>
                  </div>
                </TooltipTrigger>
                {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button onClick={onRenew} disabled={isPermanent || isExpired}>
                      <RotateCw className="h-4 w-4 mr-1" />Registrar renovação
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isExpired ? "Seu plano expirou." : isPermanent ? "Licença permanente" : "Registrar nova renovação"}
                </TooltipContent>
              </Tooltip>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <RenewalTimeline renewals={renewals} currentLicenseNumber={license.license_number} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function RenewalTimeline({ renewals, currentLicenseNumber }: { renewals: any[]; currentLicenseNumber: string }) {
  if (renewals.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nenhum histórico de renovações registrado.</p>;
  }

  return (
    <div className="space-y-3">
      {renewals.map((r, idx) => {
        const isCurrent = idx === 0;
        const isOriginal = renewals.length > 1 && idx === renewals.length - 1;
        return (
          <RenewalCard key={r.id} renewal={r} isCurrent={isCurrent} isOriginal={isOriginal} />
        );
      })}
    </div>
  );
}

function RenewalCard({ renewal, isCurrent, isOriginal }: { renewal: any; isCurrent: boolean; isOriginal: boolean }) {
  const signedUrl = useSignedUrl("environmental-licenses", renewal.file_url);

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2">
        {isCurrent && <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">Atual</Badge>}
        {isOriginal && <Badge variant="outline" className="text-[10px]">Emissão original</Badge>}
        {!isCurrent && !isOriginal && <Badge variant="outline" className="text-[10px]">Anterior</Badge>}
      </div>
      {renewal.license_number && (
        <p className="text-sm font-medium">Nº {renewal.license_number}</p>
      )}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Emitida: {formatDateBR(renewal.issued_at)}</span>
        {renewal.expires_at && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Válida até: {formatDateBR(renewal.expires_at)}</span>}
      </div>
      {renewal.notes && <p className="text-xs italic text-muted-foreground">{renewal.notes}</p>}
      {signedUrl && (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <a href={signedUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="h-3 w-3 mr-1" />Visualizar
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <a href={signedUrl} download={renewal.file_name}>
              <Download className="h-3 w-3 mr-1" />Baixar
            </a>
          </Button>
        </div>
      )}
      {renewal.profiles && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <User className="h-3 w-3" />
          {renewal.profiles.full_name} em {formatDateTimeBR(renewal.registered_at)}
        </p>
      )}
    </div>
  );
}
