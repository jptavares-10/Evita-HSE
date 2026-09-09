import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OccurrenceStage } from "@/lib/occurrences";

interface Props {
  stages: OccurrenceStage[];
  active: OccurrenceStage["key"];
  onSelect: (key: OccurrenceStage["key"]) => void;
}

export function OccurrenceStepper({ stages, active, onSelect }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {stages.map((s, i) => {
        const isActive = s.key === active;
        return (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className={cn(
              "rounded-xl border p-3 text-left transition-colors",
              isActive ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/50",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  s.done ? "bg-primary text-primary-foreground" : "border bg-background text-muted-foreground",
                )}
              >
                {s.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="truncate text-sm font-medium">{s.label}</span>
            </div>
            <p className={cn("mt-1.5 line-clamp-2 text-[11px]", s.pending ? "text-warning" : "text-muted-foreground")}>
              {s.pending ?? (s.optional && !s.done ? "não obrigatória" : "tudo em ordem")}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function StageProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{value}% concluído</span>
    </div>
  );
}

export function StageEmpty({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed py-8 px-4 text-sm text-muted-foreground">
      <Circle className="h-4 w-4" />
      {text}
    </div>
  );
}
