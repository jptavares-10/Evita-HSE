import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EFFECTIVENESS_RESULTS } from "@/lib/investigation";
import { useSaveEffectiveness } from "@/hooks/useInvestigation";

interface Props {
  action: any | null;
  onClose: () => void;
  /** Chamado quando o resultado é "não efetiva" e o usuário quer abrir uma nova ação. */
  onCreateFollowUp?: (causeId: string | null) => void;
}

export function EffectivenessDialog({ action, onClose, onCreateFollowUp }: Props) {
  const save = useSaveEffectiveness();
  const [result, setResult] = useState("effective");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (action) {
      setResult(action.effectiveness_result || "effective");
      setDate(action.effectiveness_check_date || new Date().toISOString().split("T")[0]);
      setNotes(action.effectiveness_notes || "");
    }
  }, [action?.id]);

  const handleSubmit = async (followUp: boolean) => {
    if (!action) return;
    await save.mutateAsync({
      id: action.id,
      effectiveness_result: result,
      effectiveness_check_date: date,
      effectiveness_notes: notes.trim() || null,
    });
    onClose();
    if (followUp) onCreateFollowUp?.(action.cause_id ?? null);
  };

  const ineffective = result === "ineffective" || result === "reopened";

  return (
    <Dialog open={!!action} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Verificação de eficácia</DialogTitle>
          <DialogDescription className="line-clamp-2">{action?.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data da verificação</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Resultado</Label>
              <Select value={result} onValueChange={setResult}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EFFECTIVENESS_RESULTS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Comentário</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Como você comprovou que a ação funcionou (ou não)?" />
          </div>
          {ineffective && (
            <p className="text-xs text-warning">
              A ação não resolveu. O ideal é abrir uma nova ação para a mesma causa.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          {ineffective && onCreateFollowUp && (
            <Button variant="outline" onClick={() => handleSubmit(true)} disabled={save.isPending}>
              Registrar e criar nova ação
            </Button>
          )}
          <Button onClick={() => handleSubmit(false)} disabled={save.isPending}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
