import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { useUpdateOccurrenceExtras } from "@/hooks/useInvestigation";

interface Props { occurrence: any; canEdit: boolean; disabled?: boolean; }

export function LessonPublisher({ occurrence, canEdit, disabled }: Props) {
  const update = useUpdateOccurrenceExtras();
  const [published, setPublished] = useState(!!occurrence.published_as_lesson);
  const [title, setTitle] = useState(occurrence.lesson_title || "");
  const [summary, setSummary] = useState(occurrence.lesson_summary || "");
  const [tags, setTags] = useState((occurrence.lesson_tags || []).join(", "));

  useEffect(() => {
    setPublished(!!occurrence.published_as_lesson);
    setTitle(occurrence.lesson_title || "");
    setSummary(occurrence.lesson_summary || "");
    setTags((occurrence.lesson_tags || []).join(", "));
  }, [occurrence.id]);

  const handleSave = () => {
    update.mutate({
      id: occurrence.id,
      published_as_lesson: published,
      lesson_title: title || null,
      lesson_summary: summary || null,
      lesson_tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
        <BookOpen className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <p>Compartilhe o aprendizado desta ocorrência com toda a empresa. Lições publicadas aparecem na <b>Biblioteca de Lições Aprendidas</b>.</p>
      </div>

      <div className="flex items-center justify-between border rounded-md p-3">
        <div>
          <Label htmlFor="publish-lesson" className="text-sm">Publicar como lição aprendida</Label>
          {published && <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 text-[10px]">Publicada</Badge>}
        </div>
        <Switch id="publish-lesson" checked={published} onCheckedChange={setPublished} disabled={!canEdit || disabled} />
      </div>

      {published && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Bloqueio de energia é obrigatório antes de manutenção" disabled={!canEdit || disabled} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Resumo / Recomendação</Label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="O que aconteceu, causa raiz e o que aprendemos..." className="min-h-[80px]" disabled={!canEdit || disabled} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tags (separadas por vírgula)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Ex.: LOTO, manutenção, elétrica" disabled={!canEdit || disabled} />
          </div>
        </div>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={disabled || update.isPending}>Salvar</Button>
        </div>
      )}
    </div>
  );
}