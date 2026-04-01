import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ComponentPropsWithoutRef } from "react";

interface Props extends ComponentPropsWithoutRef<typeof Button> {
  canEdit: boolean;
  tooltipMessage?: string;
}

/**
 * A button that is disabled with a tooltip when the user lacks edit permission.
 * Use for "create new" type buttons that should be disabled (not hidden).
 */
export function PermissionButton({ canEdit, tooltipMessage, disabled, children, ...props }: Props) {
  const isDisabled = disabled || !canEdit;
  const message = tooltipMessage || "Você tem acesso somente leitura neste módulo. Solicite ao administrador.";

  if (!canEdit) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button disabled {...props}>{children}</Button>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px]">{message}</TooltipContent>
      </Tooltip>
    );
  }

  return <Button disabled={isDisabled} {...props}>{children}</Button>;
}
