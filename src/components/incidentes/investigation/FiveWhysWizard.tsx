import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, ArrowRight, Target } from "lucide-react";
import { useOccurrenceCauses, useSaveCause, useDeleteCause } from "@/hooks/useInvestigation";
import { CATEGORY_6M } from "@/lib/investigation";

interface Props {
  occurrenceId: string;
  canEdit: boolean;
  disabled?: boolean;
}

export function FiveWhysWizard({ occurrenceId, canEdit, disabled }: Props) {
  const { data: causes = [], isLoading } = useOccurrenceCauses(occurrenceId);
  const save = useSaveCause();
  const del = useDeleteCause();
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState<string>("");

  const chain = useMemo(() => causes.filter((c: any) => c.source_method === "5whys").sort((a: any, b: any) => a.order_index - b.order_index), [causes]);

  const handleAdd = async () => {
    if (!draft.trim()) return;
    const parent = chain[chain.length - 1];
    const isRoot = chain.length >= 4; // 5th why = root
    await save.mutateAsync({
      occurrence_id: occurrenceId,
      cause_type: isRoot ? "root" : chain.length === 0 ? "immediate" : "basic",
      category_6m: category || null,
      description: draft.trim(),
      source_method: "5whys",
      parent_cause_id: parent?.id ?? null,
      order_index: chain.length,
    });
    setDraft("");
    setCategory("");
  };

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
        <Target className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <p>Pergunte <b>"por quê?"</b> a cada resposta. Continue até chegar à falha de gestão/sistema — normalmente na 5ª pergunta.</p>
      </div>

      <ol className="space-y-2">
        {chain.map((c: any, idx: number) => (
          <li key={c.id} className="flex items-start gap-2 border rounded-md p-3">
            <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{idx + 1}</div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs text-muted-foreground">{idx === 0 ? "Por que aconteceu?" : "Por quê?"}</p>
              <p className="text-sm">{c.description}</p>
              {c.category_6m && <Badge variant="outline" className="text-[10px]">{CATEGORY_6M.find(k => k.value === c.category_6m)?.label}</Badge>}
              {idx === chain.length - 1 && chain.length >= 5 && (
                <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px]">Causa raiz</Badge>
              )}
            </div>
            {canEdit && (
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del.mutate(c.id)} disabled={disabled}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </li>
        ))}
      </ol>

      {canEdit && chain.length < 7 && (
        <div className="space-y-2 border rounded-md p-3 bg-muted/20">
          <p className="text-xs font-semibold flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
            {chain.length === 0 ? "Por que o evento aconteceu?" : `Por quê? (${chain.length + 1}ª)`}
          </p>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Responda com o fato observado, não com uma opinião."
            className="min-h-[60px] text-sm"
            disabled={disabled}
          />
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory} disabled={disabled}>
              <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Categoria 6M (opcional)" /></SelectTrigger>
              <SelectContent>
                {CATEGORY_6M.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAdd} disabled={!draft.trim() || disabled || save.isPending}>
              <Plus className="h-3.5 w-3.5 mr-1" />Adicionar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}