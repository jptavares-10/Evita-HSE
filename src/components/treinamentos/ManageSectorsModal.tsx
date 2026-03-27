import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSectors, useSaveSector, useDeleteSector } from "@/hooks/useTrainings";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageSectorsModal({ open, onOpenChange }: Props) {
  const { data: sectors = [] } = useSectors();
  const save = useSaveSector();
  const del = useDeleteSector();
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    save.mutate({ name: newName.trim() }, { onSuccess: () => setNewName("") });
  };

  const handleEditSave = () => {
    if (!editId || !editName.trim()) return;
    save.mutate({ id: editId, name: editName.trim() }, { onSuccess: () => setEditId(null) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Gerenciar Setores</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Nome do setor"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button size="sm" onClick={handleAdd} disabled={!newName.trim() || save.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {sectors.map((s: any) => (
              <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50">
                {editId === s.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleEditSave(); if (e.key === "Escape") setEditId(null); }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleEditSave}><Check className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditId(null)}><X className="h-3.5 w-3.5" /></Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{s.name}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditId(s.id); setEditName(s.name); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del.mutate(s.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
            {sectors.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum setor cadastrado</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
