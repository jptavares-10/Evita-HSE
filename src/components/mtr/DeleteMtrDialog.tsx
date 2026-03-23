import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDeleteMtr } from "@/hooks/useMTR";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mtr: any;
}

export function DeleteMtrDialog({ open, onOpenChange, mtr }: Props) {
  const deleteMtr = useDeleteMtr();

  async function handleDelete() {
    if (!mtr) return;
    await deleteMtr.mutateAsync({ id: mtr.id, company_id: mtr.company_id });
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir MTR</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o MTR {mtr?.mtr_number}? Todos os arquivos e dados serão removidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
