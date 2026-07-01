import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GitBranch } from "lucide-react";
import { useOccurrenceCauses, useSaveCause, useDeleteCause } from "@/hooks/useInvestigation";
import { CATEGORY_6M } from "@/lib/investigation";

interface Props { occurrenceId: string; canEdit: boolean; disabled?: boolean; }

export function IshikawaEditor({ occurrenceId, canEdit, disabled }: Props) {
  const { data: causes = [] } = useOccurrenceCauses(occurrenceId);
  const save = useSaveCause();
  const del = useDeleteCause();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const byCategory = useMemo(() => {
    const map: Record<string, any[]> = {};
    CATEGORY_6M.forEach((c) => (map[c.value] = []));
    causes.filter((c: any) => c.source_method === "ishikawa").forEach((c: any) => {
      if (c.category_6m && map[c.category_6m]) map[c.category_6m].push(c);
    });
    return map;
  }, [causes]);

  const handleAdd = async (cat: string) => {
    const text = drafts[cat]?.trim();
    if (!text) return;
    await save.mutateAsync({
      occurrence_id: occurrenceId,
      cause_type: "basic",
      category_6m: cat,
      description: text,
      source_method: "ishikawa",
    });
    setDrafts((d) => ({ ...d, [cat]: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
        <GitBranch className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <p>Espinha de peixe (6M): liste causas contribuintes em cada categoria. Depois consolide as principais como <b>causa raiz</b> na aba "Causas".</p>
      </div>

      {/* Diagrama simplificado */}
      <IshikawaDiagram byCategory={byCategory} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORY_6M.map((cat) => (
          <div key={cat.value} className="border rounded-md p-3 space-y-2">
            <div>
              <p className="text-sm font-semibold">{cat.label}</p>
              <p className="text-[11px] text-muted-foreground">{cat.description}</p>
            </div>
            <ul className="space-y-1">
              {byCategory[cat.value].map((c: any) => (
                <li key={c.id} className="flex items-start gap-1.5 text-xs">
                  <span className="text-muted-foreground shrink-0">•</span>
                  <span className="flex-1">{c.description}</span>
                  {canEdit && (
                    <button onClick={() => del.mutate(c.id)} disabled={disabled} className="text-destructive shrink-0">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {canEdit && (
              <div className="flex gap-1.5">
                <Input
                  value={drafts[cat.value] || ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [cat.value]: e.target.value }))}
                  placeholder="Adicionar causa..."
                  className="h-7 text-xs"
                  disabled={disabled}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(cat.value); } }}
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleAdd(cat.value)} disabled={disabled || !drafts[cat.value]?.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IshikawaDiagram({ byCategory }: { byCategory: Record<string, any[]> }) {
  // SVG simplified fishbone: horizontal spine with 6 diagonal branches (3 top / 3 bottom)
  const positions = [
    { key: "man", x: 120, side: "top", offset: 0 },
    { key: "machine", x: 260, side: "top", offset: 1 },
    { key: "method", x: 400, side: "top", offset: 2 },
    { key: "material", x: 120, side: "bottom", offset: 0 },
    { key: "environment", x: 260, side: "bottom", offset: 1 },
    { key: "measurement", x: 400, side: "bottom", offset: 2 },
  ];
  return (
    <div className="w-full overflow-x-auto border rounded-md bg-muted/20 p-2">
      <svg viewBox="0 0 560 260" className="w-full h-auto max-h-[240px]">
        {/* Spine */}
        <line x1="40" y1="130" x2="500" y2="130" stroke="currentColor" strokeWidth="2" className="text-primary" />
        {/* Head (problem) */}
        <polygon points="500,120 540,130 500,140" fill="currentColor" className="text-primary" />
        <text x="490" y="115" fontSize="10" textAnchor="end" className="fill-current text-foreground font-semibold">Evento</text>
        {positions.map((p) => {
          const y2 = p.side === "top" ? 40 : 220;
          const count = byCategory[p.key]?.length ?? 0;
          const label = CATEGORY_6M.find((c) => c.value === p.key)?.label ?? p.key;
          return (
            <g key={p.key}>
              <line x1={p.x} y1="130" x2={p.x + 60} y2={y2} stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
              <rect x={p.x + 40} y={y2 - 12} width="90" height="20" rx="4" fill="currentColor" className="text-primary/10" />
              <text x={p.x + 85} y={y2 + 2} fontSize="10" textAnchor="middle" className="fill-current text-foreground font-semibold">{label}</text>
              <text x={p.x + 85} y={y2 + 14} fontSize="9" textAnchor="middle" className="fill-current text-muted-foreground">{count} causa(s)</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}