import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupplierCategories, useCreateSupplierCategory, useUpdateSupplierCategory, useDeleteSupplierCategory } from "@/hooks/useSuppliers";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageSupplierCategoriesModal({ open, onOpenChange }: Props) {
  const { data: categories = [] } = useSupplierCategories();
  const createCategory = useCreateSupplierCategory();
  const updateCategory = useUpdateSupplierCategory();
  const deleteCategory = useDeleteSupplierCategory();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await createCategory.mutateAsync(newName.trim());
    setNewName("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await updateCategory.mutateAsync({ id: editingId, name: editName.trim() });
    setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Categorias de Fornecedor</DialogTitle></DialogHeader>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {categories.map((cat: any) => (
            <div key={cat.id} className="flex items-center gap-2">
              {editingId === cat.id ? (
                <>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" autoFocus />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveEdit}><Check className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{cat.name}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteCategory.mutate(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma categoria cadastrada.</p>}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nova categoria" className="flex-1" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <Button onClick={handleAdd} disabled={!newName.trim()}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
