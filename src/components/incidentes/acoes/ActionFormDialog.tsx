import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { useCompanyMembers } from "@/hooks/useCompanyMembers";
import { useSaveCorrectiveAction } from "@/hooks/useOccurrences";
import { ACTION_PRIORITIES } from "@/lib/occurrences";
import { CONTROL_HIERARCHY } from "@/lib/investigation";

const NONE = "__none__";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  occurrenceId: string;
  /** Ação existente para edição; null cria uma nova. */
  action?: any | null;
  causes: any[];
  /** Causa pré-selecionada (usado ao criar ação após eficácia não efetiva). */
  defaultCauseId?: string | null;
}

export function ActionFormDialog({ open, onOpenChange, occurrenceId, action, causes, defaultCauseId }: Props) {
  const { data: members = [] } = useCompanyMembers();
  const save = useSaveCorrectiveAction();
  const [showMore, setShowMore] = useState(false);

  const [form, setForm] = useState({
    description: "",
    responsible_profile_id: NONE,
    due_date: "",
    priority: "medium",
    cause_id: NONE,
    control_hierarchy: NONE,
    where_location: "",
    how_method: "",
    cost_estimated: "",
  });

  useEffect(() => {
    if (!open) return;
    setShowMore(false);
    setForm({
      description: action?.description ?? "",
      responsible_profile_id: action?.responsible_profile_id ?? NONE,
      due_date: action?.due_date ?? "",
      priority: action?.priority ?? "medium",
      cause_id: action?.cause_id ?? defaultCauseId ?? NONE,
      control_hierarchy: action?.control_hierarchy ?? NONE,
      where_location: action?.where_location ?? "",
      how_method: action?.how_method ?? "",
      cost_estimated: action?.cost_estimated ?? "",
    });
  }, [open, action?.id, defaultCauseId]);

  const missing: string[] = [];
  if (!form.description.trim()) missing.push("o que será feito");
  if (form.responsible_profile_id === NONE) missing.push("responsável");
  if (!form.due_date) missing.push("prazo");

  const handleSubmit = async () => {
    if (missing.length > 0) return;
    await save.mutateAsync({
      id: action?.id,
      occurrence_id: occurrenceId,
      description: form.description.trim(),
      responsible_profile_id: form.responsible_profile_id === NONE ? null : form.responsible_profile_id,
      due_date: form.due_date || null,
      priority: form.priority,
      cause_id: form.cause_id === NONE ? null : form.cause_id,
      control_hierarchy: form.control_hierarchy === NONE ? null : form.control_hierarchy,
      where_location: form.where_location.trim() || null,
      how_method: form.how_method.trim() || null,
      cost_estimated: form.cost_estimated === "" ? null : Number(form.cost_estimated),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{action ? "Editar ação corretiva" : "Nova ação corretiva"}</DialogTitle>
          <DialogDescription>
            Toda ação precisa de responsável e prazo — é assim que ela sai do papel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>O que será feito *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Ex: instalar proteção fixa na polia do transportador."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Responsável *</Label>
              <Select
                value={form.responsible_profile_id}
                onValueChange={(v) => setForm({ ...form, responsible_profile_id: v })}
              >
                <SelectTrigger><SelectValue placeholder="Escolha um usuário" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>— Sem responsável —</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.full_name || "Usuário sem nome"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prazo *</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Causa que a ação resolve</Label>
              <Select value={form.cause_id} onValueChange={(v) => setForm({ ...form, cause_id: v })}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>— Nenhuma —</SelectItem>
                  {causes.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{String(c.description).substring(0, 60)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de controle</Label>
            <Select value={form.control_hierarchy} onValueChange={(v) => setForm({ ...form, control_hierarchy: v })}>
              <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— Não definido —</SelectItem>
                {CONTROL_HIERARCHY.map((h) => (
                  <SelectItem key={h.value} value={h.value}>{h.label} — {h.description}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Eliminar ou proteger na fonte resolve melhor do que treinar e entregar EPI.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`} />
            {showMore ? "Ocultar detalhes" : "Detalhes (onde, como, custo)"}
          </button>

          {showMore && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
              <div className="space-y-1.5">
                <Label>Onde</Label>
                <Input value={form.where_location} onChange={(e) => setForm({ ...form, where_location: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Custo estimado (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.cost_estimated as any}
                  onChange={(e) => setForm({ ...form, cost_estimated: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Como será feito</Label>
                <Textarea value={form.how_method} onChange={(e) => setForm({ ...form, how_method: e.target.value })} rows={2} />
              </div>
            </div>
          )}

          {missing.length > 0 && (
            <p className="text-xs text-warning">Falta informar: {missing.join(", ")}.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={missing.length > 0 || save.isPending}>
            {save.isPending ? "Salvando..." : action ? "Salvar" : "Criar ação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
