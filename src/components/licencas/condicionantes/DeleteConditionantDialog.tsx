import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  description: string;
  complianceCount: number;
  onConfirm: () => void;
  loading: boolean;
}

export function DeleteConditionantDialog({ open, onOpenChange, description, complianceCount, onConfirm, loading }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir condicionante?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block font-medium text-foreground line-clamp-3">{description}</span>
            {complianceCount > 0
              ? ` Esta condicionante possui ${complianceCount} registro(s) de cumprimento. Todo o histórico e as evidências anexadas serão excluídos permanentemente.`
              : " Esta ação não pode ser desfeita."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirm(); }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}