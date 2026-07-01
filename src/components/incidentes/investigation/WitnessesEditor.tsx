import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Users } from "lucide-react";
import { useWitnesses, useAddWitness, useDeleteWitness } from "@/hooks/useInvestigation";

interface Props { occurrenceId: string; canEdit: boolean; disabled?: boolean; }

export function WitnessesEditor({ occurrenceId, canEdit, disabled }: Props) {
  const { data: witnesses = [] } = useWitnesses(occurrenceId);
  const add = useAddWitness();
  const del = useDeleteWitness();
  const [name, setName] = useState("");
  const [statement, setStatement] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
        <Users className="h-3.5 w-3.5" />Testemunhas ({witnesses.length})
      </div>
      <ul className="space-y-1.5">
        {witnesses.map((w: any) => (
          <li key={w.id} className="border rounded-md p-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{w.witness_name}</span>
              {canEdit && (
                <button onClick={() => del.mutate(w.id)} disabled={disabled} className="text-destructive"><Trash2 className="h-3 w-3" /></button>
              )}
            </div>
            {w.statement && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">"{w.statement}"</p>}
          </li>
        ))}
      </ul>
      {canEdit && !show && (
        <Button size="sm" variant="outline" onClick={() => setShow(true)} disabled={disabled}>
          <Plus className="h-3.5 w-3.5 mr-1" />Adicionar testemunha
        </Button>
      )}
      {show && (
        <div className="border rounded-md p-2 space-y-2 bg-muted/20">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className="h-8 text-sm" />
          <Textarea value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Relato (opcional)" className="min-h-[60px] text-sm" />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => { setShow(false); setName(""); setStatement(""); }}>Cancelar</Button>
            <Button size="sm" onClick={async () => { if (!name.trim()) return; await add.mutateAsync({ occurrence_id: occurrenceId, witness_name: name.trim(), statement: statement || null }); setName(""); setStatement(""); setShow(false); }} disabled={!name.trim() || add.isPending}>Salvar</Button>
          </div>
        </div>
      )}
    </div>
  );
}