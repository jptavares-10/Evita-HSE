import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { translateSupabaseError } from "@/lib/supabase-errors";
import { formatCNPJ, isValidCNPJFormat } from "@/lib/cnpj";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const SEGMENTS = [
  "Construção Civil",
  "Indústria",
  "Facilities",
  "Mineração",
  "Óleo e Gás",
  "Saúde",
  "Logística",
  "Outro",
];

export default function CompletarCadastro() {
  const { user, session, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [segment, setSegment] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  // On mount, check directly in the DB if profile already exists with company_id
  useEffect(() => {
    if (loading) return;

    if (!session || !user) {
      navigate("/login", { replace: true });
      return;
    }

    const checkProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.company_id) {
        // Profile already complete — refresh context and go to dashboard
        await refreshProfile();
        navigate("/dashboard", { replace: true });
      } else {
        const { data: invitationData } = await supabase.rpc("get_pending_invitation_for_current_user" as any);
        const invitation = invitationData as any;

        if (invitation?.found && invitation?.token) {
          navigate(`/convite?token=${invitation.token}`, { replace: true });
          return;
        }

        setChecking(false);
      }
    };

    checkProfile();
  }, [loading, session, user]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!companyName.trim() || !fullName.trim()) {
      setError("Preencha os campos obrigatórios.");
      return;
    }

    if (cnpj && !isValidCNPJFormat(cnpj)) {
      setError("CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX.");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: rpcError } = await supabase.rpc("create_company_and_admin", {
        p_company_name: companyName.trim(),
        p_cnpj: cnpj || null,
        p_segment: segment || null,
        p_full_name: fullName.trim(),
        p_email: user?.email ?? "",
      });

      if (rpcError) throw new Error(translateSupabaseError(rpcError.message));

      const result = data as any;
      if (!result?.success) throw new Error(result?.error ?? "Erro ao finalizar cadastro.");

      await refreshProfile();

      toast({ title: "Cadastro finalizado com sucesso!" });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md animate-fade-up">
        <div className="bg-card rounded-lg border shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Evita HSE</h1>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold">Seu cadastro está incompleto</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha os dados abaixo para finalizar a configuração da sua conta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da empresa *</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                placeholder="XX.XXX.XXX/XXXX-XX"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                maxLength={18}
              />
            </div>
            <div className="space-y-2">
              <Label>Segmento</Label>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger><SelectValue placeholder="Selecione o segmento" /></SelectTrigger>
                <SelectContent>
                  {SEGMENTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo *</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Finalizando..." : "Finalizar cadastro"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
