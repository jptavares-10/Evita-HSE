import { useState, useMemo } from "react";
import { useTrainings, useDeleteTraining, useTrainingMatrix, useAllRecords } from "@/hooks/useTrainings";
import { useAuth } from "@/contexts/AuthContext";
import { formatValidityLabel } from "@/lib/trainings";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Search, Pencil, Trash2, GraduationCap } from "lucide-react";
import { TrainingDrawer } from "@/components/treinamentos/TrainingDrawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function TreinamentosCatalogo() {
  const { company } = useAuth();
  const isExpired = company?.plan === "expired";
  const { data: trainings = [] } = useTrainings();
  const { data: matrix = [] } = useTrainingMatrix();
  const { data: allRecords = [] } = useAllRecords();
  const deleteTraining = useDeleteTraining();

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTraining, setEditTraining] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const enriched = useMemo(() => {
    return trainings.map((t: any) => {
      const positionCount = new Set(matrix.filter((m: any) => m.training_id === t.id).map((m: any) => m.job_position_id)).size;
      const pendingCount = allRecords.filter((r: any) => r.training_id === t.id && r.employees?.status === "active").length;
      return { ...t, positionCount, pendingCount };
    });
  }, [trainings, matrix, allRecords]);

  const filtered = useMemo(() => {
    if (!search) return enriched;
    return enriched.filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [enriched, search]);

  const ActionButton = ({ children, onClick, ...props }: any) => {
    if (isExpired) {
      return (
        <Tooltip><TooltipTrigger asChild><span><Button disabled {...props}>{children}</Button></span></TooltipTrigger>
        <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent></Tooltip>
      );
    }
    return <Button onClick={onClick} {...props}>{children}</Button>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar treinamento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <ActionButton onClick={() => { setEditTraining(null); setDrawerOpen(true); }}><Plus className="h-4 w-4 mr-1" />Novo treinamento</ActionButton>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">Nenhum treinamento cadastrado</p>
          <ActionButton onClick={() => { setEditTraining(null); setDrawerOpen(true); }}>Cadastrar primeiro treinamento</ActionButton>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Cargos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{formatValidityLabel(t.validity_months)}</TableCell>
                  <TableCell>{t.alert_days_before} dias antes</TableCell>
                  <TableCell>{t.positionCount} cargo{t.positionCount !== 1 ? "s" : ""}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <ActionButton variant="ghost" size="icon" onClick={() => { setEditTraining(t); setDrawerOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </ActionButton>
                    <ActionButton variant="ghost" size="icon" onClick={() => setDeleteId(t.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TrainingDrawer open={drawerOpen} onOpenChange={setDrawerOpen} training={editTraining} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir treinamento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteId) deleteTraining.mutate(deleteId); setDeleteId(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
