import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Play, CheckCircle2, Trash2, Pencil, ClipboardCheck, AlertTriangle, Calendar, User, DollarSign, Download } from "lucide-react";
import { getActionStatusInfo, formatDateTimeBR, formatDateBR } from "@/lib/occurrences";
import { CONTROL_HIERARCHY, EFFECTIVENESS_RESULTS, formatCurrencyBR, getControlHierarchyInfo, getEffectivenessInfo, isActionOverdue } from "@/lib/investigation";
import { useCorrectiveActions, useAddCorrectiveAction, useUpdateActionStatus, useDeleteCorrectiveAction } from "@/hooks/useOccurrences";
import { useOccurrenceCauses, useSaveActionDetails, useSaveEffectiveness } from "@/hooks/useInvestigation";
import { useEmployees } from "@/hooks/useTrainings";
import { useSignedUrls } from "@/hooks/useSignedUrl";

interface Props { occurrenceId: string; canEdit: boolean; disabled?: boolean; }

export function ActionPlan5W2H({ occurrenceId, canEdit, disabled }: Props) {
  const { data: actions = [] } = useCorrectiveActions(occurrenceId);
  const { data: causes = [] } = useOccurrenceCauses(occurrenceId);
  const { data: employees = [] } = useEmployees();
  const addAction = useAddCorrectiveAction();
  const updateAction = useUpdateActionStatus();
  const deleteAction = useDeleteCorrectiveAction();
  const saveDetails = useSaveActionDetails();
  const saveEfx = useSaveEffectiveness();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [efxId, setEfxId] = useState<string | null>(null);
  const [efxResult, setEfxResult] = useState("effective");
  const [efxDate, setEfxDate] = useState(new Date().toISOString().split("T")[0]);

  const evidenceUrls = actions.map((a: any) => a.evidence_url).filter(Boolean);
  const signedMap = useSignedUrls("occurrence-files", evidenceUrls);

  const rootCauses = causes.filter((c: any) => c.cause_type === "root");
  const completed = actions.filter((a: any) => a.status === "completed").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Plano de ação 5W2H</p>
          <p className="text-[11px] text-muted-foreground">
            {actions.length > 0 ? `${completed}/${actions.length} concluídas` : "Nenhuma ação registrada"}
            {rootCauses.length > 0 && ` · ${rootCauses.length} causa(s) raiz`}
          </p>
        </div>
        {canEdit && (
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} disabled={disabled}>
            <Plus className="h-3.5 w-3.5 mr-1" />Nova ação
          </Button>
        )}
      </div>

      {actions.length === 0 && !showAdd && (
        <div className="text-center py-6 border-2 border-dashed rounded-md">
          <ClipboardCheck className="h-8 w-8 mx-auto text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground mt-2">Adicione ações corretivas vinculadas às causas raiz.</p>
        </div>
      )}

      <div className="space-y-2">
        {actions.map((a: any) => (
          <ActionCard
            key={a.id}
            action={a}
            causes={causes}
            employees={employees}
            canEdit={canEdit}
            disabled={disabled}
            isEditing={editingId === a.id}
            onEdit={() => setEditingId(a.id)}
            onCancelEdit={() => setEditingId(null)}
            onSave={async (payload) => { await saveDetails.mutateAsync({ id: a.id, ...payload }); setEditingId(null); }}
            onStart={() => updateAction.mutate({ actionId: a.id, occurrenceId, newStatus: "in_progress" })}
            onComplete={() => setCompleteId(a.id)}
            onDelete={() => deleteAction.mutate({ actionId: a.id, occurrenceId })}
            onEffectiveness={() => { setEfxId(a.id); setEfxResult("effective"); setEfxDate(new Date().toISOString().split("T")[0]); }}
            signedMap={signedMap}
          />
        ))}
      </div>

      {/* Add new action */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova ação corretiva</DialogTitle></DialogHeader>
          <NewActionForm
            causes={causes}
            onSubmit={async (values) => {
              await addAction.mutateAsync({ occurrence_id: occurrenceId, description: values.description });
              // After creation, fetch newest and update details would need id — simplified: user edits after
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Complete action */}
      <Dialog open={!!completeId} onOpenChange={(o) => { if (!o) { setCompleteId(null); setCompletionNotes(""); setEvidenceFile(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Concluir ação</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Observações da conclusão</Label>
              <Textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} placeholder="Descreva o que foi feito..." />
            </div>
            <div className="space-y-1">
              <Label>Evidência (opcional)</Label>
              <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteId(null)}>Cancelar</Button>
            <Button onClick={() => {
              if (!completeId) return;
              updateAction.mutate({ actionId: completeId, occurrenceId, newStatus: "completed", completion_notes: completionNotes || null, evidenceFile });
              setCompleteId(null); setCompletionNotes(""); setEvidenceFile(null);
            }} disabled={updateAction.isPending}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Effectiveness verification */}
      <Dialog open={!!efxId} onOpenChange={(o) => { if (!o) setEfxId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Verificação de eficácia</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Data</Label>
              <Input type="date" value={efxDate} onChange={(e) => setEfxDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Resultado</Label>
              <Select value={efxResult} onValueChange={setEfxResult}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EFFECTIVENESS_RESULTS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEfxId(null)}>Cancelar</Button>
            <Button onClick={() => {
              if (!efxId) return;
              saveEfx.mutate({ id: efxId, effectiveness_result: efxResult, effectiveness_check_date: efxDate });
              setEfxId(null);
            }}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActionCard({ action, causes, employees, canEdit, disabled, isEditing, onEdit, onCancelEdit, onSave, onStart, onComplete, onDelete, onEffectiveness, signedMap }: any) {
  const status = getActionStatusInfo(action.status);
  const overdue = isActionOverdue(action.due_date, action.status);
  const cause = causes.find((c: any) => c.id === action.cause_id);
  const hierarchy = getControlHierarchyInfo(action.control_hierarchy);
  const efx = getEffectivenessInfo(action.effectiveness_result);

  const [form, setForm] = useState({
    description: action.description || "",
    cause_id: action.cause_id || "",
    why: action.why || "",
    where_location: action.where_location || "",
    due_date: action.due_date || "",
    responsible_employee_id: action.responsible_employee_id || "",
    how_method: action.how_method || "",
    cost_estimated: action.cost_estimated ?? "",
    control_hierarchy: action.control_hierarchy || "",
  });

  if (isEditing) {
    return (
      <div className="border rounded-md p-3 space-y-2 bg-muted/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-[11px]">What — Ação</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[50px] text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Why — Causa raiz</Label>
            <Select value={form.cause_id || "__none__"} onValueChange={(v) => setForm({ ...form, cause_id: v === "__none__" ? "" : v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Nenhuma —</SelectItem>
                {causes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.description.substring(0, 60)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Where — Local</Label>
            <Input value={form.where_location} onChange={(e) => setForm({ ...form, where_location: e.target.value })} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">When — Prazo</Label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Who — Responsável</Label>
            <Select value={form.responsible_employee_id || "__none__"} onValueChange={(v) => setForm({ ...form, responsible_employee_id: v === "__none__" ? "" : v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Colaborador" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Nenhum —</SelectItem>
                {employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-[11px]">How — Método</Label>
            <Textarea value={form.how_method} onChange={(e) => setForm({ ...form, how_method: e.target.value })} className="min-h-[40px] text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">How much — Custo (R$)</Label>
            <Input type="number" step="0.01" value={form.cost_estimated as any} onChange={(e) => setForm({ ...form, cost_estimated: e.target.value })} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Hierarquia de controle</Label>
            <Select value={form.control_hierarchy || "__none__"} onValueChange={(v) => setForm({ ...form, control_hierarchy: v === "__none__" ? "" : v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Nenhuma —</SelectItem>
                {CONTROL_HIERARCHY.map((h) => <SelectItem key={h.value} value={h.value}>{h.label} — {h.description}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancelEdit}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave({
            description: form.description,
            cause_id: form.cause_id || null,
            where_location: form.where_location || null,
            due_date: form.due_date || null,
            responsible_employee_id: form.responsible_employee_id || null,
            how_method: form.how_method || null,
            cost_estimated: form.cost_estimated === "" ? null : Number(form.cost_estimated),
            control_hierarchy: form.control_hierarchy || null,
          })}>Salvar</Button>
        </div>
      </div>
    );
  }

  const responsibleName = employees.find((e: any) => e.id === action.responsible_employee_id)?.full_name;

  return (
    <div className={`border rounded-md p-3 space-y-2 ${overdue ? "border-red-300 bg-red-50/50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm flex-1 font-medium">{action.description}</p>
        <div className="flex items-center gap-1 shrink-0">
          {overdue && <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px]"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />Atrasada</Badge>}
          <Badge className={status.color + " text-[10px]"}>{status.label}</Badge>
          {efx && <Badge className={efx.color + " text-[10px]"}>{efx.label}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {cause && <div className="col-span-2"><b>Por quê:</b> {cause.description.substring(0, 80)}</div>}
        {action.where_location && <div className="flex items-center gap-1"><span className="font-semibold">Onde:</span> {action.where_location}</div>}
        {action.due_date && <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDateBR(action.due_date)}</div>}
        {responsibleName && <div className="flex items-center gap-1"><User className="h-3 w-3" /> {responsibleName}</div>}
        {action.cost_estimated !== null && action.cost_estimated !== undefined && <div className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatCurrencyBR(Number(action.cost_estimated))}</div>}
        {hierarchy && <div className="col-span-2"><Badge variant="outline" className="text-[10px]">{hierarchy.label}</Badge></div>}
        {action.how_method && <div className="col-span-2"><b>Como:</b> {action.how_method}</div>}
      </div>

      {action.status === "completed" && (
        <div className="text-[11px] text-muted-foreground border-l-2 border-green-300 pl-2">
          Concluída em {formatDateTimeBR(action.completed_at)} por {action.completer?.full_name}
          {action.completion_notes && <div>"{action.completion_notes}"</div>}
          {action.evidence_url && (
            <a href={signedMap[action.evidence_url] || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 mt-0.5">
              <Download className="h-3 w-3" />{action.evidence_name || "Evidência"}
            </a>
          )}
        </div>
      )}

      {canEdit && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onEdit} disabled={disabled}><Pencil className="h-3 w-3 mr-1" />Editar 5W2H</Button>
          {action.status === "pending" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onStart} disabled={disabled}><Play className="h-3 w-3 mr-1" />Iniciar</Button>
          )}
          {(action.status === "pending" || action.status === "in_progress") && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onComplete} disabled={disabled}><CheckCircle2 className="h-3 w-3 mr-1" />Concluir</Button>
          )}
          {action.status === "completed" && !action.effectiveness_result && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onEffectiveness} disabled={disabled}>Verificar eficácia</Button>
          )}
          {action.status !== "completed" && (
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={onDelete} disabled={disabled}><Trash2 className="h-3 w-3" /></Button>
          )}
        </div>
      )}
    </div>
  );
}

function NewActionForm({ causes, onSubmit, onCancel }: any) {
  const [description, setDescription] = useState("");
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>O que será feito (What)</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição da ação corretiva..." className="min-h-[80px]" />
      </div>
      {causes.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          Depois de criar, você pode editar os campos <b>Why, Where, When, Who, How e How Much</b> e vincular à causa raiz.
        </p>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSubmit({ description: description.trim() })} disabled={!description.trim()}>Criar ação</Button>
      </DialogFooter>
    </div>
  );
}