import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSectors, useSaveSector, useDeleteSector } from "@/hooks/useTrainings";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageSectorsModal({ open, onOpenChange }: Props) {
  const { data: sectors = [] } = useSectors();
  const save = useSaveSector();
  const deleteSector = useDeleteSector();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    save.mutate({ name: newName.trim() }, { onSuccess: () => setNewName("") });
  };

  const handleEditSave = () => {
    if (!editingId || !editingName.trim()) return;
    save.mutate({ id: editingId, name: editingName.trim() }, { onSuccess: () => { setEditingId(null); setEditingName(""); } });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Gerenciar Setores</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Nome do novo setor" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
              <Button onClick={handleAdd} disabled={!newName.trim() || save.isPending} size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {sectors.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between px-3 py-2 border rounded-md">
                  {editingId === s.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleEditSave(); if (e.key === "Escape") setEditingId(null); }} className="h-8" autoFocus />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleEditSave} disabled={!editingName.trim()}><Check className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium">{s.name}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(s.id); setEditingName(s.name); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(s)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {sectors.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum setor cadastrado</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir setor</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir o setor "{deleteTarget?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteTarget) deleteSector.mutate(deleteTarget.id); setDeleteTarget(null); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
