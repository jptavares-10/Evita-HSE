import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useOccurrenceCauses, useSaveCause, useDeleteCause } from "@/hooks/useInvestigation";
import { CAUSE_TYPES, CATEGORY_6M, getCauseTypeInfo, getCategory6mInfo } from "@/lib/investigation";

interface Props { occurrenceId: string; canEdit: boolean; disabled?: boolean; }

export function CausesSummary({ occurrenceId, canEdit, disabled }: Props) {
  const { data: causes = [] } = useOccurrenceCauses(occurrenceId);
  const save = useSaveCause();
  const del = useDeleteCause();
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ description: "", cause_type: "root", category_6m: "" });

  const grouped: Record<string, any[]> = { immediate: [], basic: [], root: [] };
  causes.forEach((c: any) => { if (grouped[c.cause_type]) grouped[c.cause_type].push(c); });

  const handleAdd = async () => {
    if (!draft.description.trim()) return;
    await save.mutateAsync({
      occurrence_id: occurrenceId,
      cause_type: draft.cause_type,
      category_6m: draft.category_6m || null,
      description: draft.description.trim(),
      source_method: "manual",
    });
    setDraft({ description: "", cause_type: "root", category_6m: "" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Todas as causas identificadas (5 Porquês, Ishikawa, Bow-Tie e manuais). As <b>causas raiz</b> devem ser usadas para gerar as ações corretivas.
      </p>

      {CAUSE_TYPES.map((t) => (
        <div key={t.value} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge className={t.color + " text-[10px]"}>{t.label}</Badge>
            <p className="text-[11px] text-muted-foreground">{t.description}</p>
          </div>
          {grouped[t.value].length === 0 ? (
            <p className="text-xs text-muted-foreground italic pl-2">Nenhuma causa {t.label.toLowerCase()} registrada.</p>
          ) : (
            <ul className="space-y-1 pl-2">
              {grouped[t.value].map((c: any) => {
                const cat = getCategory6mInfo(c.category_6m);
                return (
                  <li key={c.id} className="flex items-start gap-2 text-sm border-l-2 pl-2 py-1" style={{ borderColor: t.value === "root" ? "hsl(0 84% 60%)" : t.value === "basic" ? "hsl(38 92% 50%)" : "hsl(217 91% 60%)" }}>
                    <span className="flex-1">{c.description}</span>
                    {cat && <Badge variant="outline" className="text-[10px] shrink-0">{cat.label}</Badge>}
                    {c.source_method && c.source_method !== "manual" && <Badge variant="outline" className="text-[10px] shrink-0">{c.source_method}</Badge>}
                    {canEdit && (
                      <button onClick={() => del.mutate(c.id)} disabled={disabled} className="text-destructive"><Trash2 className="h-3 w-3" /></button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}

      {canEdit && !showAdd && (
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} disabled={disabled}>
          <Plus className="h-3.5 w-3.5 mr-1" />Adicionar causa manualmente
        </Button>
      )}

      {showAdd && (
        <div className="border rounded-md p-3 space-y-2 bg-muted/30">
          <Input value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Descrição da causa" disabled={disabled} />
          <div className="flex gap-2">
            <Select value={draft.cause_type} onValueChange={(v) => setDraft((d) => ({ ...d, cause_type: v }))} disabled={disabled}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CAUSE_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={draft.category_6m} onValueChange={(v) => setDraft((d) => ({ ...d, category_6m: v }))} disabled={disabled}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Categoria 6M" /></SelectTrigger>
              <SelectContent>
                {CATEGORY_6M.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAdd} disabled={!draft.description.trim() || disabled || save.isPending}>Adicionar</Button>
          </div>
        </div>
      )}
    </div>
  );
}