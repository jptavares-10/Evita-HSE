import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, CheckCircle2, Trash2, Stamp, Link2 } from "lucide-react";
import { EvidenceFileLink } from "./EvidenceFileLink";
import {
  CRITICALITIES, EFFECTIVE_STATUS_META, deadlineTypeLabel, formatDateBR, daysRemainingLabel,
} from "@/lib/conditionants";
import { useConditionantCompliances, useDeleteCompliance, type ConditionantRow } from "@/hooks/useConditionants";
import { usePermission } from "@/hooks/usePermission";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conditionant: ConditionantRow | null;
  onEdit: () => void;
  onRegister: () => void;
  isDisabled: boolean;
}

export function ConditionantDetailDrawer({ open, onOpenChange, conditionant, onEdit, onRegister, isDisabled }: Props) {
  const { canEdit } = usePermission("environmental_licenses");
  const { data: compliances = [] } = useConditionantCompliances(conditionant?.id ?? null);
  const deleteCompliance = useDeleteCompliance();

  if (!conditionant) return null;

  const statusMeta = EFFECTIVE_STATUS_META[conditionant._status];
  const crit = CRITICALITIES.find((c) => c.value === conditionant.criticality);
  const days = daysRemainingLabel(conditionant._resolved_due, conditionant.alert_days_before);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex flex-wrap items-center gap-2">
            <span>{conditionant.item_code || "Condicionante"}</span>
            <Badge variant="outline" className={statusMeta.className}>{statusMeta.label}</Badge>
            {crit && <Badge variant="outline" className={crit.className}>{crit.label}</Badge>}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {conditionant.environmental_licenses?.license_number} — {conditionant.environmental_licenses?.title}
          </p>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Histórico ({compliances.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Exigência</p>
              <div className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">{conditionant.description}</div>
            </div>

            <div className="space-y-3">
              <Row label="Tipo de prazo" value={deadlineTypeLabel(conditionant.deadline_type, conditionant.recurrence, conditionant.days_before_license_expiry)} />
              <Row label="Vencimento" value={conditionant.deadline_type === "continuous" ? "Obrigação contínua" : formatDateBR(conditionant._resolved_due)} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prazo</span>
                <span className={`font-semibold ${days.color}`}>{conditionant.deadline_type === "continuous" ? "—" : days.label}</span>
              </div>
              <Row label="Responsável" value={conditionant.responsible?.full_name || "Sem responsável"} />
              {conditionant.deadline_type !== "continuous" && (
                <Row label="Alerta" value={`${conditionant.alert_days_before} dias antes`} />
              )}
            </div>

            {conditionant.notes && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Observações</p>
                <p className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">{conditionant.notes}</p>
              </div>
            )}

            {canEdit && (
              <div className="flex gap-2 pt-2">
                <Button onClick={onRegister} disabled={isDisabled} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Registrar cumprimento
                </Button>
                <Button variant="outline" onClick={onEdit} disabled={isDisabled} className="gap-1.5">
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-4">
            {compliances.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhum cumprimento registrado ainda.</p>
            ) : (
              compliances.map((c: any) => (
                <div key={c.id} className="space-y-2 rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Cumprido em {formatDateBR(c.fulfilled_at)}</p>
                      <p className="text-xs text-muted-foreground">
                        Prazo de referência: {formatDateBR(c.reference_due_date)} · por {c.registered?.full_name || "—"}
                      </p>
                    </div>
                    {canEdit && (
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        disabled={isDisabled || deleteCompliance.isPending}
                        onClick={() => deleteCompliance.mutate({ id: c.id, files: c.conditionant_evidence_files ?? [] })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {c.notes && <p className="text-sm whitespace-pre-wrap">{c.notes}</p>}

                  {c.protocol_number && (
                    <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2 text-xs">
                      <Stamp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        Protocolo {c.protocol_number}
                        {c.protocol_body ? ` · ${c.protocol_body}` : ""}
                        {c.protocol_date ? ` · ${formatDateBR(c.protocol_date)}` : ""}
                        {c.protocol_channel ? ` · ${c.protocol_channel}` : ""}
                      </span>
                    </div>
                  )}

                  {c.conditionant_evidence_files?.length > 0 && (
                    <div className="space-y-1.5">
                      {c.conditionant_evidence_files.map((f: any) => (
                        <EvidenceFileLink key={f.id} path={f.file_url} name={f.file_name} />
                      ))}
                    </div>
                  )}

                  {c.conditionant_document_links?.length > 0 && (
                    <div className="space-y-1">
                      {c.conditionant_document_links.map((l: any) => (
                        <p key={l.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Link2 className="h-3.5 w-3.5" />
                          {l.documents?.code ? `${l.documents.code} — ` : ""}{l.documents?.title || "Documento"}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}