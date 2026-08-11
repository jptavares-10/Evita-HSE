import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Download, Loader2, ShieldAlert, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportCompanyData, downloadJson } from "@/lib/company-data-export";
import { RETENTION } from "@/content/legal";
import { fetchStorageUsage, formatBytes, type StorageUsage } from "@/lib/storage-utils";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Empresa() {
  const { company, profile, refreshCompany } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const deletionRequestedAt = (company as any)?.deletion_requested_at as string | null | undefined;
  const termsAcceptedAt = (company as any)?.terms_accepted_at as string | null | undefined;
  const [usage, setUsage] = useState<StorageUsage | null>(null);

  useEffect(() => {
    fetchStorageUsage().then(setUsage);
  }, [company?.id]);

  const usagePct = usage && usage.limitBytes > 0
    ? Math.min(100, (usage.usedBytes / usage.limitBytes) * 100)
    : 0;

  const handleExport = async () => {
    setExporting(true);
    try {
      const payload = await exportCompanyData((p) => setProgress(`${p.current}/${p.total}`));
      const slug = (company?.name || "empresa").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      downloadJson(payload, `evita-hse-${slug}-${new Date().toISOString().slice(0, 10)}.json`);
      toast.success("Exportação concluída. O download foi iniciado.");
    } catch (e: any) {
      toast.error(e?.message ?? "Não foi possível exportar os dados.");
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  const handleRequestDeletion = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.rpc("request_account_deletion", { p_reason: null });
      const res = data as any;
      if (error || !res?.success) throw new Error(error?.message ?? res?.error ?? "Erro ao solicitar exclusão.");
      await refreshCompany?.();
      toast.success("Pedido de exclusão registrado. Você pode cancelar enquanto o prazo não terminar.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.rpc("cancel_account_deletion");
      const res = data as any;
      if (error || !res?.success) throw new Error(error?.message ?? res?.error ?? "Erro ao cancelar pedido.");
      await refreshCompany?.();
      toast.success("Pedido de exclusão cancelado.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

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

      <div className="lp-card rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold">Privacidade e dados (LGPD)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Portabilidade e exclusão dos dados desta empresa. Consulte os{" "}
            <Link to="/termos" target="_blank" className="text-primary hover:underline">Termos de Uso</Link> e a{" "}
            <Link to="/privacidade" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>.
          </p>
          {termsAcceptedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Termos aceitos em {new Date(termsAcceptedAt).toLocaleDateString("pt-BR")}.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Exportar meus dados</p>
          <p className="text-xs text-muted-foreground">
            Gera um arquivo JSON com todos os registros da empresa (colaboradores, treinamentos, exames, EPIs,
            inspeções, incidentes, resíduos, licenças, documentos e fornecedores).
          </p>
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {exporting ? `Exportando ${progress ?? ""}` : "Exportar dados (JSON)"}
          </Button>
        </div>

        <div className="border-t pt-5 space-y-2">
          <p className="text-sm font-medium">Excluir conta e dados</p>
          <p className="text-xs text-muted-foreground">
            O pedido é registrado e a exclusão definitiva ocorre em até {RETENTION.accountDays} dias, período em que o
            pedido pode ser cancelado. Registros fiscais são mantidos por {RETENTION.billingYears} anos por obrigação
            legal. Exporte seus dados antes de solicitar.
          </p>

          {!isAdmin ? (
            <p className="text-xs text-muted-foreground bg-muted/40 border rounded-md p-3">
              Apenas administradores podem solicitar a exclusão da conta.
            </p>
          ) : deletionRequestedAt ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                <ShieldAlert className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Exclusão solicitada em {new Date(deletionRequestedAt).toLocaleDateString("pt-BR")}. A conta será
                  eliminada após o prazo de {RETENTION.accountDays} dias.
                </span>
              </div>
              <Button variant="outline" onClick={handleCancelDeletion} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Undo2 className="h-4 w-4 mr-2" />}
                Cancelar pedido de exclusão
              </Button>
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>Solicitar exclusão da conta</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Solicitar exclusão da conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todos os dados da empresa serão eliminados em até {RETENTION.accountDays} dias, incluindo documentos
                    e anexos. A assinatura deve ser cancelada separadamente na página de Planos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRequestDeletion}>Confirmar pedido</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
