import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAsoRecords } from "@/hooks/useAso";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { usePermission } from "@/hooks/usePermission";
import { computeAsoStatus, getAsoStatusBadge, getResultBadge, formatDateBR } from "@/lib/aso";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  Pencil,
  FileText,
  Download,
  ExternalLink,
  Stethoscope,
  Plus,
  Trash2,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee: any | null;
  onEdit: (record: any | null) => void;
  onDelete: (record: any) => void;
}

function formatDateTimeBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function AsoDetailDrawer({ open, onOpenChange, employee, onEdit, onDelete }: Props) {
  const { canEdit } = usePermission("aso");
  const { data: allRecords = [] } = useAsoRecords();

  const employeeRecords = useMemo(() => {
    if (!employee) return [];
    return allRecords
      .filter((r: any) => r.employee_id === employee.id)
      .sort((a: any, b: any) => b.exam_date.localeCompare(a.exam_date));
  }, [allRecords, employee]);

  const latestWithExpiry = employeeRecords.find((r: any) => r.expires_at);
  const currentStatus = latestWithExpiry
    ? computeAsoStatus(latestWithExpiry.expires_at)
    : employeeRecords.length > 0
    ? "no_expiry"
    : null;

  if (!employee) return null;

  const statusInfo = currentStatus ? getAsoStatusBadge(currentStatus as any) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 flex-wrap">
            <span>{employee.name}</span>
            {statusInfo && (
              <Badge variant="outline" className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
            )}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {employee.job_positions?.name || "Sem cargo"}
            {employee.sectors?.name ? ` · ${employee.sectors.name}` : ""}
          </p>
        </SheetHeader>

        <Tabs defaultValue="history" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1">
              Histórico de ASOs
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1">
              Resumo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4 space-y-3">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onEdit(null)}
              >
                <Plus className="h-4 w-4 mr-1" /> Novo ASO
              </Button>
            )}

            {employeeRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum ASO registrado para este colaborador.
              </p>
            ) : (
              employeeRecords.map((record: any, idx: number) => (
                <AsoHistoryCard
                  key={record.id}
                  record={record}
                  isCurrent={idx === 0}
                  canEdit={canEdit}
                  onEdit={() => onEdit(record)}
                  onDelete={() => onDelete(record)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="space-y-3">
              <DetailRow label="Colaborador" value={employee.name} />
              <DetailRow
                label="Cargo"
                value={employee.job_positions?.name || "—"}
              />
              <DetailRow
                label="Setor"
                value={employee.sectors?.name || "—"}
              />
              <DetailRow
                label="Total de ASOs"
                value={String(employeeRecords.length)}
              />
              {latestWithExpiry && (
                <>
                  <DetailRow
                    label="Último exame"
                    value={formatDateBR(latestWithExpiry.exam_date)}
                  />
                  <DetailRow
                    label="Vencimento"
                    value={formatDateBR(latestWithExpiry.expires_at)}
                  />
                </>
              )}
            </div>
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

function AsoHistoryCard({
  record,
  isCurrent,
  canEdit,
  onEdit,
  onDelete,
}: {
  record: any;
  isCurrent: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const signedUrl = useSignedUrl("aso-files", record.file_url);
  const resultInfo = getResultBadge(record.result);
  const examTypeName = record.aso_exam_types?.name || "—";

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {isCurrent && (
          <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
            Atual
          </Badge>
        )}
        {!isCurrent && (
          <Badge variant="outline" className="text-[10px]">
            Anterior
          </Badge>
        )}
        <Badge variant="outline" className={resultInfo.className + " text-[10px]"}>
          {resultInfo.label}
        </Badge>
      </div>

      <p className="text-sm font-medium flex items-center gap-1.5">
        <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
        {examTypeName}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Exame: {formatDateBR(record.exam_date)}
        </span>
        {record.expires_at && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Vence: {formatDateBR(record.expires_at)}
          </span>
        )}
      </div>

      {(record.doctor_name || record.crm) && (
        <p className="text-xs text-muted-foreground">
          {record.doctor_name && `Dr(a). ${record.doctor_name}`}
          {record.crm && ` — CRM ${record.crm}`}
        </p>
      )}

      {record.notes && (
        <p className="text-xs italic text-muted-foreground">{record.notes}</p>
      )}

      {signedUrl && (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <a href={signedUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="h-3 w-3 mr-1" />
              Visualizar
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <a href={signedUrl} download={record.file_name}>
              <Download className="h-3 w-3 mr-1" />
              Baixar
            </a>
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        {record.profiles && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {record.profiles.full_name} em {formatDateTimeBR(record.created_at)}
          </p>
        )}
        {canEdit && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onEdit}>
              <Pencil className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Excluir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
