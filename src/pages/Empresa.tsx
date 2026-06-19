import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export default function Empresa() {
  const { company } = useAuth();

  const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="h-10 px-3 flex items-center rounded-md border bg-muted/40 text-sm text-foreground">
        {value || <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Minha Empresa</h1>
        <p className="text-muted-foreground text-sm mt-1">Informações da empresa.</p>
      </div>

      <div className="lp-card rounded-xl p-6 space-y-4">
        <Field label="Nome da empresa" value={company?.name} />
        <Field label="CNPJ" value={company?.cnpj} />
        <Field label="Segmento" value={company?.segment} />

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 border rounded-md p-3">
          <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Os dados da empresa não podem ser alterados por aqui. Para solicitar mudanças, entre em
            contato com o suporte.
          </span>
        </div>
      </div>
    </div>
  );
}
