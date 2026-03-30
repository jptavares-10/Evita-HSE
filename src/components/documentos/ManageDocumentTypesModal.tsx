import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  types: { id: string; name: string; is_default: boolean }[];
}

export function ManageDocumentTypesModal({ open, onOpenChange, types }: Props) {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    if (!newName.trim() || !company) return;
    const { error } = await supabase.from("document_types").insert({ company_id: company.id, name: newName.trim() });
    if (error) { toast({ title: "Erro ao adicionar tipo", variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["document-types"] });
    setNewName("");
  };

  const handleDelete = async (id: string) => {
    const { data: docs } = await supabase.from("documents").select("id").eq("document_type_id", id).limit(1);
    if (docs && docs.length > 0) {
      toast({ title: "Existem documentos vinculados a este tipo.", variant: "destructive" });
      return;
    }
    await supabase.from("document_types").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["document-types"] });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await supabase.from("document_types").update({ name: editName.trim() }).eq("id", editingId);
    queryClient.invalidateQueries({ queryKey: ["document-types"] });
    setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Gerenciar Tipos de Documento</DialogTitle></DialogHeader>
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {types.map((t) => (
            <div key={t.id} className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
              {editingId === t.id ? (
                <>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 h-8" />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveEdit}><Check className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5" /></Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{t.name}</span>
                  {t.is_default && <Badge variant="secondary" className="text-[10px]">Padrão</Badge>}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(t.id); setEditName(t.name); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {!t.is_default && (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Input placeholder="Novo tipo" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button onClick={handleAdd} disabled={!newName.trim()}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
