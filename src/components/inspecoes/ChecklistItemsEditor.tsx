import { useState } from "react";
import { useChecklistItems, useSaveChecklistItem, useDeleteChecklistItem } from "@/hooks/useInspectionsField";
import { RESPONSE_TYPES } from "@/lib/inspection-qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, GripVertical, AlertTriangle, Camera } from "lucide-react";

interface Props {
  modelId: string;
}

export function ChecklistItemsEditor({ modelId }: Props) {
  const { data: items = [] } = useChecklistItems(modelId);
  const save = useSaveChecklistItem();
  const del = useDeleteChecklistItem();

  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [question, setQuestion] = useState("");
  const [responseType, setResponseType] = useState("yes_no_na");
  const [isCritical, setIsCritical] = useState(false);
  const [photoRequired, setPhotoRequired] = useState(false);
  const [reference, setReference] = useState("");
  const [expected, setExpected] = useState("");
  const [helpText, setHelpText] = useState("");

  const resetForm = () => {
    setQuestion(""); setResponseType("yes_no_na"); setIsCritical(false); setPhotoRequired(false);
    setReference(""); setExpected(""); setHelpText("");
    setEditing(null);
  };

  const startEdit = (it: any) => {
    setEditing(it);
    setQuestion(it.question);
    setResponseType(it.response_type);
    setIsCritical(it.is_critical);
    setPhotoRequired(it.photo_required);
    setReference(it.reference || "");
    setExpected(it.expected_answer || "");
    setHelpText(it.help_text || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!question.trim()) return;
    const nextPosition = editing?.position ?? items.length;
    await save.mutateAsync({
      id: editing?.id,
      model_id: modelId,
      position: nextPosition,
      question: question.trim(),
      response_type: responseType,
      is_critical: isCritical,
      photo_required: photoRequired,
      reference: reference || null,
      expected_answer: expected || null,
      help_text: helpText || null,
    });
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum item cadastrado. Adicione perguntas para o inspetor responder em campo.
        </p>
      )}

      {items.map((it: any, i: number) => (
        <div key={it.id} className="border rounded-lg p-3 bg-muted/30 space-y-1.5">
          <div className="flex items-start gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                {it.is_critical && <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />Crítico</Badge>}
                {it.photo_required && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200"><Camera className="h-2.5 w-2.5 mr-0.5" />Foto obrigatória</Badge>}
                <Badge variant="outline" className="text-[10px]">{RESPONSE_TYPES[it.response_type] || it.response_type}</Badge>
              </div>
              <p className="text-sm font-medium mt-1">{it.question}</p>
              {it.reference && <p className="text-xs text-muted-foreground">Ref: {it.reference}</p>}
              {it.expected_answer && <p className="text-xs text-muted-foreground">Esperado: {it.expected_answer}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(it)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del.mutate({ id: it.id, model_id: modelId })}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="border rounded-lg p-4 bg-background space-y-3">
          <div className="space-y-1.5">
            <Label>Pergunta / item a verificar *</Label>
            <Textarea rows={2} placeholder="Ex: O manômetro do extintor está na faixa verde?" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo de resposta</Label>
              <Select value={responseType} onValueChange={setResponseType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RESPONSE_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Referência (NR / norma)</Label>
              <Input placeholder="Ex: NR-23 item 23.7" value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Resposta esperada (opcional)</Label>
            <Input placeholder="Ex: Sim, ou valor > 12 bar" value={expected} onChange={(e) => setExpected(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Ajuda / instrução ao inspetor</Label>
            <Textarea rows={2} placeholder="Explique o que observar..." value={helpText} onChange={(e) => setHelpText(e.target.value)} />
          </div>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} className="rounded" />
              Item crítico (reprova a inspeção se não conforme)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={photoRequired} onChange={(e) => setPhotoRequired(e.target.checked)} className="rounded" />
              Exigir foto
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => { resetForm(); setShowForm(false); }}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={!question.trim() || save.isPending}>
              {save.isPending ? "Salvando..." : editing ? "Atualizar item" : "Adicionar item"}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar item ao checklist
        </Button>
      )}
    </div>
  );
}
