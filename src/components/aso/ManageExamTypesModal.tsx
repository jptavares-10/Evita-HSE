import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { useAsoExamTypes, useSaveAsoExamType, useDeleteAsoExamType } from "@/hooks/useAso";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageExamTypesModal({ open, onOpenChange }: Props) {
  const { data: types = [] } = useAsoExamTypes();
  const save = useSaveAsoExamType();
  const remove = useDeleteAsoExamType();

  const [newName, setNewName] = useState("");
  const [newValidity, setNewValidity] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editValidity, setEditValidity] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    save.mutate({ name: newName.trim(), validity_months: newValidity ? parseInt(newValidity) : null });
    setNewName("");
    setNewValidity("");
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    save.mutate({ id, name: editName.trim(), validity_months: editValidity ? parseInt(editValidity) : null });
    setEditId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Tipos de Exame</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {types.map((t: any) => (
            <div key={t.id} className="flex items-center gap-2">
              {editId === t.id ? (
                <>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
                  <Input value={editValidity} onChange={(e) => setEditValidity(e.target.value)} placeholder="Meses" className="w-20" type="number" />
                  <Button size="sm" onClick={() => handleSaveEdit(t.id)}>OK</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>✕</Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">
                    {t.name}
                    {t.validity_months && <span className="text-muted-foreground ml-1">({t.validity_months}m)</span>}
                    {t.is_default && <span className="text-xs text-muted-foreground ml-1">(padrão)</span>}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => { setEditId(t.id); setEditName(t.name); setEditValidity(t.validity_months?.toString() || ""); }}>
                    Editar
                  </Button>
                  {!t.is_default && (
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(t.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}

          <div className="border-t pt-3 mt-3">
            <Label className="text-xs text-muted-foreground mb-2 block">Adicionar novo tipo</Label>
            <div className="flex gap-2">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do tipo" className="flex-1" />
              <Input value={newValidity} onChange={(e) => setNewValidity(e.target.value)} placeholder="Meses" className="w-20" type="number" />
              <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
