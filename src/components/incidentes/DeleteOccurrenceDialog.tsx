import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteOccurrence } from "@/hooks/useOccurrences";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occurrence: any;
}

export function DeleteOccurrenceDialog({ open, onOpenChange, occurrence }: Props) {
  const deleteMutation = useDeleteOccurrence();

  if (!occurrence) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir ocorrência</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir esta ocorrência? Todas as evidências e ações corretivas serão removidas permanentemente.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={() => deleteMutation.mutate({ id: occurrence.id, status: occurrence.status }, { onSuccess: () => onOpenChange(false) })} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
