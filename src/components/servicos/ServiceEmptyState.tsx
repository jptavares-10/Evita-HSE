import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onCreateFirst: () => void;
  isExpired: boolean;
}

export function ServiceEmptyState({ onCreateFirst, isExpired }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <ClipboardList className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Nenhum serviço cadastrado ainda</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Cadastre seus serviços periódicos para acompanhar vencimentos e manter a conformidade.
      </p>
      <Button onClick={onCreateFirst} disabled={isExpired}>
        <Plus className="h-4 w-4 mr-1" /> Criar primeiro serviço
      </Button>
    </div>
  );
}
