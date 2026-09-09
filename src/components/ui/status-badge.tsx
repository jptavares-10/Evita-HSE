import { Badge } from "@/components/ui/badge";
import { STATUS_META, STATUS_LABEL_SINGULAR, StatusKey } from "@/lib/status";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: StatusKey;
  /** Override the default label (e.g. "Vencido há 3 dias"). */
  label?: string;
  showIcon?: boolean;
  className?: string;
}

/** Standard status badge: same label, colour and icon in every module. */
export function StatusBadge({ status, label, showIcon = true, className }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 text-[11px] font-medium", meta.badgeClass, className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label ?? STATUS_LABEL_SINGULAR[status]}
    </Badge>
  );
}
