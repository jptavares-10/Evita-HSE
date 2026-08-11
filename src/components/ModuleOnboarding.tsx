import { LucideIcon, Check, ArrowRight, Rocket, Info, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface OnboardingStep {
  title: string;
  description: string;
  /** Por que este passo importa (mostrado apenas no passo atual). */
  hint?: string;
  /** Passo opcional — pode ser feito depois. */
  optional?: boolean;
  action: () => void;
  actionLabel: string;
  completed: boolean;
  icon: LucideIcon;
}

interface ModuleOnboardingProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Contexto legal/normativo ou explicação geral do módulo. */
  note?: string;
  steps: OnboardingStep[];
}

export function ModuleOnboarding({ title, description, icon: Icon, note, steps }: ModuleOnboardingProps) {
  const required = steps.filter((s) => !s.optional);
  const completedCount = required.filter((s) => s.completed).length;
  const progress = required.length > 0 ? Math.round((completedCount / required.length) * 100) : 0;

  // Find first incomplete step
  const firstIncompleteIdx = steps.findIndex((s) => !s.completed);

  return (
    <Card className="max-w-3xl mx-auto border-dashed">
      <CardHeader className="text-center pb-2 pt-8">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardHeader>
      <CardContent className="space-y-5 pb-8">
        {note && (
          <div className="flex gap-2.5 rounded-lg bg-muted/50 p-3 text-left">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedCount} de {required.length} passos essenciais concluídos</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCurrent = idx === firstIncompleteIdx;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  step.completed
                    ? "bg-muted/30 border-transparent"
                    : isCurrent
                    ? "bg-primary/5 border-primary/20"
                    : "bg-background border-transparent"
                }`}
              >
                {/* Step number / check */}
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium ${
                    step.completed
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.completed ? <Check className="h-4 w-4" /> : idx + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${step.completed ? "line-through text-muted-foreground" : ""}`}>
                      {step.title}
                    </p>
                    {step.optional && (
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground border rounded px-1.5 py-0.5">
                        Opcional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  {isCurrent && step.hint && (
                    <p className="text-xs text-primary/90 mt-1.5 flex items-start gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-px" />
                      <span>{step.hint}</span>
                    </p>
                  )}
                </div>

                {/* Action */}
                {!step.completed && (
                  <Button
                    size="sm"
                    variant={isCurrent ? "default" : "outline"}
                    onClick={step.action}
                    className="shrink-0"
                  >
                    {step.actionLabel}
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {completedCount === required.length && required.length > 0 && (
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-2 text-sm text-primary font-medium">
              <Rocket className="h-4 w-4" />
              Tudo pronto! Seu módulo está configurado.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
