import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiTone = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

const toneStyles: Record<KpiTone, { icon: string; iconBg: string; value: string }> = {
  neutral: { icon: "text-muted-foreground", iconBg: "bg-muted", value: "text-foreground" },
  primary: { icon: "text-primary", iconBg: "bg-primary/10", value: "text-foreground" },
  success: { icon: "text-success", iconBg: "bg-success/10", value: "text-success" },
  warning: { icon: "text-warning", iconBg: "bg-warning/10", value: "text-warning" },
  danger: { icon: "text-destructive", iconBg: "bg-destructive/10", value: "text-destructive" },
  info: { icon: "text-[hsl(var(--info))]", iconBg: "bg-[hsl(var(--info))]/10", value: "text-foreground" },
};

export interface KpiProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: KpiTone;
  /** When provided the card becomes a filter toggle. */
  onClick?: () => void;
  active?: boolean;
  /** When provided the card becomes a link (mutually exclusive with onClick). */
  href?: string;
  className?: string;
  /** Optional secondary content rendered below the value (chips, badges, etc). */
  children?: React.ReactNode;
}

export function Kpi({ label, value, icon: Icon, tone = "neutral", onClick, active, href, className, children }: KpiProps) {
  const t = toneStyles[tone];
  const interactive = !!(onClick || href);
  const base = cn(
    "lp-card rounded-xl px-4 py-4 text-left block transition-all",
    interactive && "lp-interactive cursor-pointer",
    active && "ring-2 ring-primary/60 border-primary/50",
    className,
  );
  const inner = (
    <>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", t.iconBg)}>
            <Icon className={cn("h-5 w-5", t.icon)} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className={cn("text-2xl font-display font-semibold tabular-nums leading-none", t.value)}>{value}</p>
          <p className="text-xs text-muted-foreground mt-1.5 truncate">{label}</p>
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </>
  );
  if (href) return <Link to={href} className={base}>{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} aria-pressed={active} className={cn(base, "w-full")}>{inner}</button>;
  return <div className={base}>{inner}</div>;
}

export function KpiGrid({ children, cols = 4, className }: { children: React.ReactNode; cols?: 3 | 4 | 5; className?: string }) {
  const colsClass = cols === 5 ? "lg:grid-cols-5" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return <div className={cn("grid grid-cols-2 gap-3", colsClass, className)}>{children}</div>;
}