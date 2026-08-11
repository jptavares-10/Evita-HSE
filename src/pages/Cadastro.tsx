import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { translateSupabaseError } from "@/lib/supabase-errors";
import { formatCNPJ, isValidCNPJFormat } from "@/lib/cnpj";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AuthShell } from "@/components/landing/AuthShell";
import { Checkbox } from "@/components/ui/checkbox";
import { LEGAL_VERSION } from "@/content/legal";

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

async function waitForSession(maxMs = 5000, intervalMs = 500) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}

export default function Cadastro() {
  usePageTitle("Criar conta — Evita HSE", {
    description: "Crie sua conta grátis no Evita HSE. 14 dias de teste com acesso completo a todos os módulos de gestão de SST e meio ambiente.",
  });
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [segment, setSegment] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  // Track if auth was created but RPC failed — allow retry without new signUp
  const [authCreated, setAuthCreated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const callRpc = async () => {
    const { data, error: rpcError } = await supabase.rpc("create_company_and_admin", {
      p_company_name: companyName.trim(),
      p_cnpj: cnpj || null,
      p_segment: segment || null,
      p_full_name: fullName.trim(),
      p_email: email.trim(),
    });

    if (rpcError) {
      throw new Error(translateSupabaseError(rpcError.message));
    }

    const result = data as any;
    if (!result?.success) {
      throw new Error(result?.error ?? "Erro ao criar empresa. Tente novamente.");
    }

    return result;
  };

  const handleRetry = async () => {
    setError("");
    setLoading(true);
    try {
      await callRpc();
      await supabase.rpc("accept_terms", { p_version: LEGAL_VERSION });
      toast({
        title: "Bem-vindo ao Evita HSE!",
        description: "Seu trial de 14 dias começou.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (cnpj && !isValidCNPJFormat(cnpj)) {
      setError("CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!acceptedTerms) {
      setError("É necessário aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create auth user (skip if already created from a previous failed attempt)
      if (!authCreated) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });

        if (authError || !authData.user) {
          setError(translateSupabaseError(authError?.message ?? "Erro ao criar conta."));
          setLoading(false);
          return;
        }

        setAuthCreated(true);
      }

      // 2. Wait for session to be active
      const session = await waitForSession();
      if (!session) {
        setError("Erro ao iniciar sessão. Tente novamente.");
        setLoading(false);
        return;
      }

      // 3. Call RPC to create company + profile atomically
      const rpcResult = await callRpc();

      // 3.1 Register terms acceptance (date + version)
      await supabase.rpc("accept_terms", { p_version: LEGAL_VERSION });

      // 4. Verify profile was created before redirecting
      const { data: profileCheck } = await supabase
        .from("profiles")
        .select("id, company_id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profileCheck?.company_id) {
        setError("Erro ao finalizar cadastro. Tente novamente.");
        setLoading(false);
        return;
      }

      toast({
        title: "Bem-vindo ao Evita HSE!",
        description: "Seu trial de 14 dias começou.",
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Criar conta"
      subtitle="14 dias grátis, sem cartão de crédito."
      width="lg"
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="text-lp-emerald font-medium hover:underline underline-offset-2">Entrar</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-lp-emerald">Dados da empresa</span>
            <span className="flex-1 h-px bg-lp-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-lp-ink">Nome da empresa *</Label>
            <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required disabled={authCreated}
              className="bg-lp-surface border-lp-border text-lp-ink focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj" className="text-lp-ink">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="XX.XXX.XXX/XXXX-XX"
              value={cnpj}
              onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
              maxLength={18}
              disabled={authCreated}
              className="bg-lp-surface border-lp-border text-lp-ink placeholder:text-lp-muted focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-lp-ink">Segmento</Label>
            <Select value={segment} onValueChange={setSegment} disabled={authCreated}>
              <SelectTrigger className="bg-lp-surface border-lp-border text-lp-ink focus:ring-lp-emerald/40"><SelectValue placeholder="Selecione o segmento" /></SelectTrigger>
              <SelectContent>
                {SEGMENTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-lp-emerald">Dados do responsável</span>
            <span className="flex-1 h-px bg-lp-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-lp-ink">Nome completo *</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={authCreated}
              className="bg-lp-surface border-lp-border text-lp-ink focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-lp-ink">E-mail *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={authCreated}
              className="bg-lp-surface border-lp-border text-lp-ink focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lp-ink">Senha *</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} disabled={authCreated}
                className="bg-lp-surface border-lp-border text-lp-ink focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-lp-ink">Confirmar senha *</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={authCreated}
                className="bg-lp-surface border-lp-border text-lp-ink focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40" />
            </div>
          </div>
        </div>

        {!authCreated && (
          <div className="flex items-start gap-3 rounded-lg border border-lp-border bg-lp-surface/60 p-3">
            <Checkbox
              id="acceptTerms"
              checked={acceptedTerms}
              onCheckedChange={(v) => setAcceptedTerms(v === true)}
              className="mt-0.5 border-lp-border data-[state=checked]:bg-lp-emerald data-[state=checked]:border-lp-emerald"
            />
            <Label htmlFor="acceptTerms" className="text-xs leading-relaxed text-lp-muted font-normal cursor-pointer">
              Li e aceito os{" "}
              <Link to="/termos" target="_blank" className="text-lp-emerald hover:underline underline-offset-2">Termos de Uso</Link>{" "}
              e a{" "}
              <Link to="/privacidade" target="_blank" className="text-lp-emerald hover:underline underline-offset-2">Política de Privacidade</Link>{" "}
              do Evita HSE. *
            </Label>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            {authCreated && (
              <Button type="button" variant="outline" className="w-full" onClick={handleRetry} disabled={loading}>
                {loading ? "Tentando novamente..." : "Tentar novamente"}
              </Button>
            )}
          </div>
        )}

        {!authCreated && (
          <button
            type="submit"
            disabled={loading || !acceptedTerms}
            className="w-full py-2.5 rounded-lg bg-lp-emerald text-lp-bg font-medium hover:bg-lp-emerald-glow transition-all lp-glow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Criando conta..." : "Criar conta grátis"}
          </button>
        )}
      </form>
    </AuthShell>
  );
}
