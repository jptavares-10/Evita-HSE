import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, MapPin, Calendar, Tag } from "lucide-react";
import { useLessonsLearned } from "@/hooks/useInvestigation";
import { getTypeInfo, getSeverityInfo, formatDateBR } from "@/lib/occurrences";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function LicoesAprendidas() {
  usePageTitle("Lições Aprendidas", { description: "Biblioteca de aprendizados de HSE.", noindex: true });
  const { data: lessons = [], isLoading } = useLessonsLearned();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    lessons.forEach((l: any) => (l.lesson_tags || []).forEach((t: string) => s.add(t)));
    return Array.from(s).sort();
  }, [lessons]);

  const filtered = useMemo(() => {
    return lessons.filter((l: any) => {
      if (tag && !(l.lesson_tags || []).includes(tag)) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        (l.lesson_title || "").toLowerCase().includes(needle) ||
        (l.lesson_summary || "").toLowerCase().includes(needle) ||
        (l.description || "").toLowerCase().includes(needle) ||
        (l.location || "").toLowerCase().includes(needle)
      );
    });
  }, [lessons, q, tag]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Lições Aprendidas</h1>
          <p className="text-sm text-muted-foreground">Biblioteca de aprendizados extraídos de incidentes e não-conformidades investigados.</p>
        </div>
      </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título, resumo, local..." className="pl-9" />
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setTag(null)} className={`text-xs px-2 py-1 rounded-full border ${!tag ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Todas</button>
            {allTags.map((t) => (
              <button key={t} onClick={() => setTag(tag === t ? null : t)} className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${tag === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <Tag className="h-3 w-3" />{t}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mt-3">
              {lessons.length === 0
                ? "Nenhuma lição publicada ainda. Publique aprendizados na aba \"Lição\" das ocorrências."
                : "Nenhum resultado para o filtro atual."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((l: any) => {
              const t = getTypeInfo(l.type);
              const s = getSeverityInfo(l.severity);
              return (
                <Card key={l.id} className="p-4 space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge className={t.color + " text-[10px]"}>{t.label}</Badge>
                    <Badge className={s.color + " text-[10px]"}>{s.label}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm">{l.lesson_title || "(Sem título)"}</h3>
                  {l.lesson_summary && <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">{l.lesson_summary}</p>}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateBR(l.occurred_at)}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{l.location}</span>
                  </div>
                  {(l.lesson_tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {l.lesson_tags.map((tg: string) => (
                        <button key={tg} onClick={() => setTag(tg)} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10">#{tg}</button>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
      )}
    </div>
  );
}