import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  types: { id: string; name: string }[];
}

export function ManageLicenseTypesModal({ open, onOpenChange, types }: Props) {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function handleAdd() {
    if (!newName.trim() || !company) return;
    const { error } = await supabase.from("license_types").insert({ company_id: company.id, name: newName.trim() });
    if (error) { toast({ title: "Erro ao criar tipo", variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["license-types"] });
    setNewName("");
    toast({ title: "Tipo criado" });
  }

  async function handleSaveEdit() {
    if (!editId || !editName.trim()) return;
    const { error } = await supabase.from("license_types").update({ name: editName.trim() }).eq("id", editId);
    if (error) { toast({ title: "Erro ao atualizar", variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["license-types"] });
    setEditId(null);
  }

  async function handleDelete(id: string) {
    const { data: linked } = await supabase.from("environmental_licenses").select("id").eq("license_type_id", id).limit(1);
    if (linked && linked.length > 0) {
      toast({ title: "Existem licenças vinculadas a este tipo.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("license_types").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir", variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["license-types"] });
    toast({ title: "Tipo excluído" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tipos de Licença</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {types.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              {editId === t.id ? (
                <>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 h-8 text-sm" />
                  <button onClick={handleSaveEdit}><Check className="h-4 w-4 text-green-600" /></button>
                  <button onClick={() => setEditId(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
                </>
              ) : (
                <>
                  <span className="text-sm flex-1">{t.name}</span>
                  <button onClick={() => { setEditId(t.id); setEditName(t.name); }}><Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" /></button>
                  <button onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></button>
                </>
              )}
            </div>
          ))}
          {types.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum tipo cadastrado.</p>}
        </div>
        <div className="border-t pt-4 mt-4 space-y-3">
          <p className="text-sm font-medium">Novo tipo</p>
          <div className="flex gap-2">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Licença de Operação" className="flex-1 h-8 text-sm" />
          </div>
          <Button size="sm" onClick={handleAdd} disabled={!newName.trim()} className="w-full"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
