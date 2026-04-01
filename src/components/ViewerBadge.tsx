import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ViewerBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] text-muted-foreground cursor-default">
          <Eye className="h-3 w-3" />
          Somente leitura
        </div>
      </TooltipTrigger>
      <TooltipContent>Solicite ao administrador para obter permissão de edição.</TooltipContent>
    </Tooltip>
  );
}
