import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDeleteSupplier } from "@/hooks/useSuppliers";

interface Props {
  supplier: any;
  onClose: () => void;
}

export function DeleteSupplierDialog({ supplier, onClose }: Props) {
  const deleteMut = useDeleteSupplier();

  const handleConfirm = async () => {
    await deleteMut.mutateAsync(supplier);
    onClose();
  };

  return (
    <AlertDialog open={!!supplier} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir fornecedor</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {supplier?.name}? Todas as pastas e documentos serão removidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
