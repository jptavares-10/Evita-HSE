import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Shield, AlertTriangle } from "lucide-react";
import { useBowtieNodes, useSaveBowtieNode, useDeleteBowtieNode, useUpdateBowtieHazard } from "@/hooks/useInvestigation";

interface Props { occurrenceId: string; canEdit: boolean; disabled?: boolean; }

export function BowTieEditor({ occurrenceId, canEdit, disabled }: Props) {
  const { data: nodes = [] } = useBowtieNodes(occurrenceId);
  const save = useSaveBowtieNode();
  const del = useDeleteBowtieNode();
  const updateHazard = useUpdateBowtieHazard();

  const hazard = useMemo(() => nodes.find((n: any) => n.hazard)?.hazard ?? "", [nodes]);
  const [hazardDraft, setHazardDraft] = useState(hazard);
  useMemo(() => setHazardDraft(hazard), [hazard]);

  const threats = nodes.filter((n: any) => n.node_type === "threat");
  const consequences = nodes.filter((n: any) => n.node_type === "consequence");
  const prevBarriers = nodes.filter((n: any) => n.node_type === "preventive_barrier");
  const mitBarriers = nodes.filter((n: any) => n.node_type === "mitigating_barrier");

  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const add = async (type: string) => {
    const text = drafts[type]?.trim();
    if (!text) return;
    await save.mutateAsync({
      occurrence_id: occurrenceId,
      node_type: type,
      description: text,
      hazard: hazardDraft || null,
    });
    setDrafts((d) => ({ ...d, [type]: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Perigo central</p>
        <div className="flex gap-2">
          <Input
            value={hazardDraft}
            onChange={(e) => setHazardDraft(e.target.value)}
            placeholder="Ex.: Contato com peça em movimento"
            className="h-8"
            disabled={!canEdit || disabled}
          />
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => updateHazard.mutate({ occurrence_id: occurrenceId, hazard: hazardDraft })} disabled={disabled}>
              Salvar
            </Button>
          )}
        </div>
      </div>

      {/* Diagram */}
      <BowTieDiagram hazard={hazardDraft} threats={threats.length} consequences={consequences.length} prev={prevBarriers.length} mit={mitBarriers.length} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <NodeColumn title="Ameaças (o que pode causar)" icon={AlertTriangle} color="text-amber-600" nodes={threats} type="threat" draft={drafts.threat || ""} onDraft={(v) => setDrafts((d) => ({ ...d, threat: v }))} onAdd={() => add("threat")} onDelete={(id) => del.mutate(id)} canEdit={canEdit} disabled={disabled} />
        <NodeColumn title="Consequências (impacto potencial)" icon={AlertTriangle} color="text-red-600" nodes={consequences} type="consequence" draft={drafts.consequence || ""} onDraft={(v) => setDrafts((d) => ({ ...d, consequence: v }))} onAdd={() => add("consequence")} onDelete={(id) => del.mutate(id)} canEdit={canEdit} disabled={disabled} />
        <NodeColumn title="Barreiras preventivas (evitam o evento)" icon={Shield} color="text-green-600" nodes={prevBarriers} type="preventive_barrier" draft={drafts.preventive_barrier || ""} onDraft={(v) => setDrafts((d) => ({ ...d, preventive_barrier: v }))} onAdd={() => add("preventive_barrier")} onDelete={(id) => del.mutate(id)} canEdit={canEdit} disabled={disabled} />
        <NodeColumn title="Barreiras mitigadoras (reduzem o impacto)" icon={Shield} color="text-blue-600" nodes={mitBarriers} type="mitigating_barrier" draft={drafts.mitigating_barrier || ""} onDraft={(v) => setDrafts((d) => ({ ...d, mitigating_barrier: v }))} onAdd={() => add("mitigating_barrier")} onDelete={(id) => del.mutate(id)} canEdit={canEdit} disabled={disabled} />
      </div>
    </div>
  );
}

function NodeColumn({ title, icon: Icon, color, nodes, draft, onDraft, onAdd, onDelete, canEdit, disabled }: any) {
  return (
    <div className="border rounded-md p-3 space-y-2">
      <p className="text-sm font-semibold flex items-center gap-1.5"><Icon className={`h-4 w-4 ${color}`} />{title}</p>
      <ul className="space-y-1">
        {nodes.map((n: any) => (
          <li key={n.id} className="flex items-start gap-1.5 text-xs">
            <span className="text-muted-foreground shrink-0">•</span>
            <span className="flex-1">{n.description}</span>
            {canEdit && (
              <button onClick={() => onDelete(n.id)} disabled={disabled} className="text-destructive shrink-0"><Trash2 className="h-3 w-3" /></button>
            )}
          </li>
        ))}
      </ul>
      {canEdit && (
        <div className="flex gap-1.5">
          <Input value={draft} onChange={(e) => onDraft(e.target.value)} placeholder="Adicionar..." className="h-7 text-xs" disabled={disabled} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }} />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onAdd} disabled={disabled || !draft.trim()}><Plus className="h-3.5 w-3.5" /></Button>
        </div>
      )}
    </div>
  );
}

function BowTieDiagram({ hazard, threats, consequences, prev, mit }: { hazard: string; threats: number; consequences: number; prev: number; mit: number }) {
  return (
    <div className="w-full overflow-x-auto border rounded-md bg-muted/20 p-2">
      <svg viewBox="0 0 600 200" className="w-full h-auto max-h-[200px]">
        {/* Left triangle (threats) */}
        <polygon points="20,20 260,100 20,180" fill="currentColor" className="text-amber-500/10" stroke="currentColor" strokeWidth="1" />
        <text x="60" y="105" fontSize="11" className="fill-current text-amber-700 font-semibold">Ameaças ({threats})</text>
        {/* Right triangle (consequences) */}
        <polygon points="580,20 340,100 580,180" fill="currentColor" className="text-red-500/10" stroke="currentColor" strokeWidth="1" />
        <text x="440" y="105" fontSize="11" className="fill-current text-red-700 font-semibold">Consequências ({consequences})</text>
        {/* Center hazard */}
        <circle cx="300" cy="100" r="40" fill="currentColor" className="text-primary/20" stroke="currentColor" strokeWidth="2" />
        <text x="300" y="98" fontSize="9" textAnchor="middle" className="fill-current text-foreground font-semibold">PERIGO</text>
        <foreignObject x="255" y="105" width="90" height="30">
          <div style={{ fontSize: 9, textAlign: "center", color: "hsl(var(--foreground))", lineHeight: 1.1 }}>{hazard || "—"}</div>
        </foreignObject>
        {/* Barrier tick marks */}
        <text x="150" y="45" fontSize="9" className="fill-current text-green-700">Prev: {prev}</text>
        <text x="420" y="45" fontSize="9" className="fill-current text-blue-700">Mit: {mit}</text>
      </svg>
    </div>
  );
}