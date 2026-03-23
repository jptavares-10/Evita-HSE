import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Check, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { PRESET_COLORS } from "@/lib/services";
import { cn } from "@/lib/utils";

interface Category { id: string; name: string; color: string; }

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
}

export function ManageCategoriesModal({ open, onOpenChange, categories }: Props) {
  const { company } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["service-categories"] });

  const handleAdd = async () => {
    if (!newName.trim() || !company) return;
    setLoading(true);
    const { error } = await supabase.from("service_categories").insert({
      company_id: company.id,
      name: newName.trim(),
      color: newColor,
    });
    if (error) {
      toast({ title: "Erro ao criar categoria", variant: "destructive" });
    } else {
      setNewName("");
      refresh();
    }
    setLoading(false);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("service_categories").update({ name: editName.trim(), color: editColor }).eq("id", editingId);
    if (error) toast({ title: "Erro ao atualizar", variant: "destructive" });
    else refresh();
    setEditingId(null);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    // Check if category has services
    const { count } = await supabase.from("periodic_services").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (count && count > 0) {
      toast({ title: "Existem serviços vinculados a esta categoria. Remova-os primeiro.", variant: "destructive" });
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("service_categories").delete().eq("id", id);
    if (error) toast({ title: "Erro ao excluir", variant: "destructive" });
    else refresh();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              {editingId === cat.id ? (
                <>
                  <ColorPicker value={editColor} onChange={setEditColor} />
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 h-8" />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveEdit} disabled={loading}><Check className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5" /></Button>
                </>
              ) : (
                <>
                  <span className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm">{cat.name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditColor(cat.color); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(cat.id)} disabled={loading}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="border-t pt-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Nova categoria</p>
          <div className="flex items-center gap-2">
            <ColorPicker value={newColor} onChange={setNewColor} />
            <Input placeholder="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1 h-8" />
            <Button size="sm" onClick={handleAdd} disabled={loading || !newName.trim()}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [showCustom, setShowCustom] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="h-6 w-6 rounded-full border-2 border-background shadow-sm cursor-pointer"
        style={{ backgroundColor: value }}
      />
      {showCustom && (
        <div className="absolute top-8 left-0 z-50 bg-card border rounded-lg p-2 shadow-lg flex flex-wrap gap-1.5 w-[140px]">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { onChange(c); setShowCustom(false); }}
              className={cn("h-6 w-6 rounded-full border-2 transition-transform hover:scale-110", value === c ? "border-foreground" : "border-transparent")}
              style={{ backgroundColor: c }}
            />
          ))}
          <input type="color" value={value} onChange={(e) => { onChange(e.target.value); setShowCustom(false); }} className="h-6 w-6 cursor-pointer rounded" />
        </div>
      )}
    </div>
  );
}
