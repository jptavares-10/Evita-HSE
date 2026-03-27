import { useState } from "react";
import { useJobPositions, useSaveJobPosition, useSectors } from "@/hooks/useTrainings";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TreinamentosCargos() {
  const { company } = useAuth();
  const { data: positions = [], isLoading } = useJobPositions();
  const { data: sectors = [] } = useSectors();
  const save = useSaveJobPosition();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isExpired = company?.plan === "expired";

  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newSectorId, setNewSectorId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingSectorId, setEditingSectorId] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const filtered = positions.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newName.trim()) return;
    save.mutate({ name: newName.trim(), sector_id: newSectorId || null }, {
      onSuccess: () => {
        setNewName("");
        setNewSectorId("");
        toast({ title: "Cargo cadastrado com sucesso" });
      },
    });
  };

  const handleEditSave = () => {
    if (!editingId || !editingName.trim()) return;
    save.mutate({ id: editingId, name: editingName.trim(), sector_id: editingSectorId || null }, {
      onSuccess: () => {
        setEditingId(null);
        setEditingName("");
        setEditingSectorId("");
        toast({ title: "Cargo atualizado" });
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { count: empCount } = await supabase.from("employees").select("id", { count: "exact", head: true }).eq("job_position_id", deleteTarget.id);
    const { count: matCount } = await supabase.from("training_matrix").select("id", { count: "exact", head: true }).eq("job_position_id", deleteTarget.id);

    if ((empCount ?? 0) > 0 || (matCount ?? 0) > 0) {
      toast({ title: "Não é possível excluir", description: "Existem colaboradores ou vínculos na matriz associados a este cargo. Remova-os primeiro.", variant: "destructive" });
      setDeleteTarget(null);
      return;
    }

    const { error } = await supabase.from("job_positions").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Erro ao excluir cargo", variant: "destructive" });
    } else {
      qc.invalidateQueries({ queryKey: ["job-positions"] });
      toast({ title: "Cargo excluído" });
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cargo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Input placeholder="Nome do novo cargo" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} disabled={isExpired} className="w-48" />
          {sectors.length > 0 && (
            <Select value={newSectorId} onValueChange={setNewSectorId}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Setor padrão" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {sectors.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button onClick={handleAdd} disabled={!newName.trim() || save.isPending || isExpired}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </span>
            </TooltipTrigger>
            {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
          </Tooltip>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">{search ? "Nenhum cargo encontrado para esta busca." : "Nenhum cargo cadastrado ainda."}</p>
          {!search && <p className="text-sm text-muted-foreground/60">Adicione cargos para montar a matriz de treinamentos.</p>}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do cargo</TableHead>
                <TableHead>Setor padrão</TableHead>
                <TableHead className="w-40">Criado em</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((pos: any) => (
                <TableRow key={pos.id}>
                  <TableCell>
                    {editingId === pos.id ? (
                      <div className="flex gap-2 items-center">
                        <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleEditSave(); if (e.key === "Escape") setEditingId(null); }} className="h-8" autoFocus />
                        {sectors.length > 0 && (
                          <Select value={editingSectorId} onValueChange={setEditingSectorId}>
                            <SelectTrigger className="w-36 h-8"><SelectValue placeholder="Setor" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Nenhum</SelectItem>
                              {sectors.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                        <Button size="sm" variant="ghost" onClick={handleEditSave} disabled={!editingName.trim() || save.isPending}>Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                      </div>
                    ) : (
                      <span className="font-medium">{pos.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pos.sectors?.name ? (
                      <Badge variant="outline" className="text-xs">{pos.sectors.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(pos.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId !== pos.id && (
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={isExpired} onClick={() => { setEditingId(pos.id); setEditingName(pos.name); setEditingSectorId(pos.sector_id || ""); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" disabled={isExpired} onClick={() => setDeleteTarget(pos)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
                        </Tooltip>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cargo</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir o cargo "{deleteTarget?.name}"? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
