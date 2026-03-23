import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { useWasteCategories } from "@/hooks/useMTR";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { WASTE_PRESET_COLORS } from "@/lib/mtr";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ManageWasteCategoriesModal({ open, onOpenChange }: Props) {
  const { company } = useAuth();
  const { data: categories = [] } = useWasteCategories();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(WASTE_PRESET_COLORS[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  async function handleAdd() {
    if (!newName.trim() || !company) return;
    const { error } = await supabase.from("waste_categories").insert({ company_id: company.id, name: newName.trim(), color: newColor });
    if (error) { toast({ title: "Erro ao criar categoria", variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["waste-categories"] });
    setNewName("");
    toast({ title: "Categoria criada" });
  }

  async function handleSaveEdit() {
    if (!editId || !editName.trim()) return;
    const { error } = await supabase.from("waste_categories").update({ name: editName.trim(), color: editColor }).eq("id", editId);
    if (error) { toast({ title: "Erro ao atualizar", variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["waste-categories"] });
    setEditId(null);
  }

  async function handleDelete(id: string) {
    const { data: linked } = await supabase.from("mtr_waste_items").select("id").eq("waste_category_id", id).limit(1);
    if (linked && linked.length > 0) {
      toast({ title: "Existem MTRs vinculados a esta categoria.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("waste_categories").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir", variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["waste-categories"] });
    toast({ title: "Categoria excluída" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Categorias de Resíduo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {categories.map((cat: any) => (
            <div key={cat.id} className="flex items-center gap-2">
              {editId === cat.id ? (
                <>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 h-8 text-sm" />
                  <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0" />
                  <button onClick={handleSaveEdit}><Check className="h-4 w-4 text-green-600" /></button>
                  <button onClick={() => setEditId(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
                </>
              ) : (
                <>
                  <Badge style={{ backgroundColor: cat.color + "20", color: cat.color, borderColor: cat.color }} className="text-xs">{cat.name}</Badge>
                  <div className="flex-1" />
                  <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditColor(cat.color); }}><Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" /></button>
                  <button onClick={() => handleDelete(cat.id)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></button>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma categoria cadastrada.</p>}
        </div>

        <div className="border-t pt-4 mt-4 space-y-3">
          <p className="text-sm font-medium">Nova categoria</p>
          <div className="flex gap-2">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome da categoria" className="flex-1 h-8 text-sm" />
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WASTE_PRESET_COLORS.map((c) => (
              <button key={c} onClick={() => setNewColor(c)} className={`w-6 h-6 rounded-full border-2 ${newColor === c ? "border-foreground" : "border-transparent"}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <Button size="sm" onClick={handleAdd} disabled={!newName.trim()} className="w-full"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
