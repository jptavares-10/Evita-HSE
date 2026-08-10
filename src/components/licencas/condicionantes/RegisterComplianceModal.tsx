import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X, FileText, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useRegisterCompliance, type ConditionantRow } from "@/hooks/useConditionants";
import { useDocuments } from "@/hooks/useDocuments";
import { EVIDENCE_ALLOWED_TYPES, EVIDENCE_MAX_SIZE, PROTOCOL_CHANNELS, nextRecurringDueDate } from "@/lib/conditionants";

interface Props {
  conditionant: ConditionantRow | null;
  onClose: () => void;
}

const NONE = "__none__";

export function RegisterComplianceModal({ conditionant, onClose }: Props) {
  const { toast } = useToast();
  const register = useRegisterCompliance();
  const { data: documents = [] } = useDocuments();

  const [fulfilledAt, setFulfilledAt] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [docIds, setDocIds] = useState<string[]>([]);
  const [docSearch, setDocSearch] = useState("");
  const [protocolNumber, setProtocolNumber] = useState("");
  const [protocolDate, setProtocolDate] = useState<Date | undefined>();
  const [protocolBody, setProtocolBody] = useState("");
  const [protocolChannel, setProtocolChannel] = useState(NONE);
  const [markFulfilled, setMarkFulfilled] = useState(true);

  useEffect(() => {
    if (conditionant) {
      setFulfilledAt(new Date());
      setNotes(""); setFiles([]); setDocIds([]); setDocSearch("");
      setProtocolNumber(""); setProtocolDate(undefined); setProtocolBody(""); setProtocolChannel(NONE);
      setMarkFulfilled(true);
    }
  }, [conditionant]);

  const filteredDocs = useMemo(() => {
    const q = docSearch.toLowerCase();
    const list = (documents as any[]).filter((d) =>
      !q || d.title?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q),
    );
    return list.slice(0, 8);
  }, [documents, docSearch]);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    Array.from(list).forEach((f) => {
      if (!EVIDENCE_ALLOWED_TYPES.includes(f.type)) {
        toast({ title: `${f.name}: formato não permitido (PDF, JPG, PNG ou WEBP).`, variant: "destructive" });
        return;
      }
      if (f.size > EVIDENCE_MAX_SIZE) {
        toast({ title: `${f.name}: arquivo acima de 20MB.`, variant: "destructive" });
        return;
      }
      accepted.push(f);
    });
    setFiles((prev) => [...prev, ...accepted]);
  };

  const nextDue = conditionant?.deadline_type === "recurring"
    ? nextRecurringDueDate(format(fulfilledAt, "yyyy-MM-dd"), conditionant.recurrence)
    : null;

  const hasEvidence = files.length > 0 || docIds.length > 0 || protocolNumber.trim().length > 0;

  const handleSubmit = async () => {
    if (!conditionant) return;
    await register.mutateAsync({
      conditionant,
      fulfilled_at: format(fulfilledAt, "yyyy-MM-dd"),
      notes: notes.trim() || null,
      protocol_number: protocolNumber.trim() || null,
      protocol_date: protocolDate ? format(protocolDate, "yyyy-MM-dd") : null,
      protocol_body: protocolBody.trim() || null,
      protocol_channel: protocolChannel === NONE ? null : protocolChannel,
      files,
      documentIds: docIds,
      markFulfilled,
    });
    onClose();
  };

  return (
    <Dialog open={!!conditionant} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar cumprimento</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {conditionant?.item_code ? `${conditionant.item_code} — ` : ""}{conditionant?.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data do cumprimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />{format(fulfilledAt, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fulfilledAt} onSelect={(d) => d && setFulfilledAt(d)} locale={ptBR} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>Prazo de referência</Label>
              <Input readOnly value={conditionant?._resolved_due ? conditionant._resolved_due.split("-").reverse().join("/") : "Sem prazo"} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição do que foi feito</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Ex: relatório de automonitoramento do 2º semestre enviado ao órgão." />
          </div>

          {/* Evidências: arquivos */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Evidências (arquivos)</Label>
            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed py-6 text-sm text-muted-foreground hover:bg-muted/50">
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              Clique para anexar PDF ou imagem (até 20MB cada)
            </label>
            {files.length > 0 && (
              <div className="space-y-1.5">
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 truncate"><FileText className="h-4 w-4 shrink-0" />{f.name}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidências: documentos da biblioteca */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" /> Vincular documentos da biblioteca</Label>
            <Input value={docSearch} onChange={(e) => setDocSearch(e.target.value)} placeholder="Buscar documento por título ou código..." />
            <div className="space-y-1">
              {filteredDocs.length === 0 && <p className="text-xs text-muted-foreground">Nenhum documento encontrado.</p>}
              {filteredDocs.map((d: any) => (
                <label key={d.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={docIds.includes(d.id)}
                    onCheckedChange={(v) => setDocIds(v ? [...docIds, d.id] : docIds.filter((x) => x !== d.id))}
                  />
                  <span className="truncate">{d.code ? `${d.code} — ` : ""}{d.title}</span>
                </label>
              ))}
            </div>
            {docIds.length > 0 && <Badge variant="outline" className="text-[10px]">{docIds.length} documento(s) vinculado(s)</Badge>}
          </div>

          {/* Protocolo no órgão */}
          <div className="space-y-2 rounded-lg border p-3">
            <Label>Protocolo no órgão ambiental</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input value={protocolNumber} onChange={(e) => setProtocolNumber(e.target.value)} placeholder="Nº do protocolo / ofício" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !protocolDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />{protocolDate ? format(protocolDate, "dd/MM/yyyy") : "Data do envio"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={protocolDate} onSelect={setProtocolDate} locale={ptBR} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              <Input value={protocolBody} onChange={(e) => setProtocolBody(e.target.value)} placeholder="Órgão (ex: IBAMA, CETESB)" />
              <Select value={protocolChannel} onValueChange={setProtocolChannel}>
                <SelectTrigger><SelectValue placeholder="Canal de envio" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sem canal informado</SelectItem>
                  {PROTOCOL_CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {conditionant?.deadline_type === "recurring" ? (
            <p className="text-xs text-muted-foreground">
              Condicionante recorrente: ao salvar, o próximo vencimento será {nextDue ? nextDue.split("-").reverse().join("/") : "recalculado"}.
            </p>
          ) : conditionant?.deadline_type === "continuous" ? (
            <p className="text-xs text-muted-foreground">Condicionante contínua: o registro entra no histórico e a obrigação segue em monitoramento.</p>
          ) : (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={markFulfilled} onCheckedChange={(v) => setMarkFulfilled(!!v)} />
              Marcar a condicionante como cumprida
            </label>
          )}

          {!hasEvidence && (
            <p className="text-xs text-warning">Recomendado: anexe pelo menos uma evidência (arquivo, documento ou protocolo).</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={register.isPending}>
            {register.isPending ? "Registrando..." : "Registrar cumprimento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}