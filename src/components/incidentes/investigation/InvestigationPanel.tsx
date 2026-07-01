import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { FiveWhysWizard } from "./FiveWhysWizard";
import { IshikawaEditor } from "./IshikawaEditor";
import { BowTieEditor } from "./BowTieEditor";
import { CausesSummary } from "./CausesSummary";
import { WitnessesEditor } from "./WitnessesEditor";
import { canUseMethod } from "@/lib/investigation";
import { usePlan } from "@/hooks/usePlan";

interface Props { occurrenceId: string; canEdit: boolean; disabled?: boolean; }

export function InvestigationPanel({ occurrenceId, canEdit, disabled }: Props) {
  const { plan, status } = usePlan();
  const canWhys = canUseMethod("five_whys", plan, status);
  const canIshi = canUseMethod("ishikawa", plan, status);
  const canBow = canUseMethod("bowtie", plan, status);

  return (
    <div className="space-y-4">
      <WitnessesEditor occurrenceId={occurrenceId} canEdit={canEdit} disabled={disabled} />

      <Tabs defaultValue="5whys" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="5whys">5 Porquês</TabsTrigger>
          <TabsTrigger value="ishikawa">Ishikawa</TabsTrigger>
          <TabsTrigger value="bowtie">Bow-Tie</TabsTrigger>
          <TabsTrigger value="causes">Causas</TabsTrigger>
        </TabsList>

        <TabsContent value="5whys" className="pt-3">
          {canWhys ? (
            <FiveWhysWizard occurrenceId={occurrenceId} canEdit={canEdit} disabled={disabled} />
          ) : (
            <PlanGate label="5 Porquês" plan="Professional" />
          )}
        </TabsContent>
        <TabsContent value="ishikawa" className="pt-3">
          {canIshi ? (
            <IshikawaEditor occurrenceId={occurrenceId} canEdit={canEdit} disabled={disabled} />
          ) : (
            <PlanGate label="Ishikawa (6M)" plan="Enterprise" />
          )}
        </TabsContent>
        <TabsContent value="bowtie" className="pt-3">
          {canBow ? (
            <BowTieEditor occurrenceId={occurrenceId} canEdit={canEdit} disabled={disabled} />
          ) : (
            <PlanGate label="Bow-Tie" plan="Enterprise" />
          )}
        </TabsContent>
        <TabsContent value="causes" className="pt-3">
          <CausesSummary occurrenceId={occurrenceId} canEdit={canEdit} disabled={disabled} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlanGate({ label, plan }: { label: string; plan: string }) {
  return (
    <Alert>
      <Lock className="h-4 w-4" />
      <AlertDescription>
        <b>{label}</b> está disponível no plano <b>{plan}</b>. Faça upgrade em <a href="/planos" className="underline text-primary">Planos</a>.
      </AlertDescription>
    </Alert>
  );
}