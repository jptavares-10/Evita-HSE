import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { translateSupabaseError } from "@/lib/supabase-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthShell } from "@/components/landing/AuthShell";

async function waitForSession(maxMs = 5000, intervalMs = 500) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return null;
}

function translateInvitationAcceptanceError(error?: string) {
  switch (error) {
    case "not_authenticated":
      return "Erro ao iniciar sessão. Tente novamente.";
    case "invalid_token":
    case "invitation_not_found":
      return "Convite não encontrado ou já utilizado.";
    case "invitation_expired":
      return "Este convite expirou. Solicite um novo convite.";
    case "email_mismatch":
      return "Este convite pertence a outro e-mail. Entre com a conta convidada.";
    case "account_already_linked_other_company":
      return "Esta conta já está vinculada a outra empresa.";
    case "profile_already_exists":
      return "Esta conta já possui um perfil. Faça login para continuar.";
    default:
      return "Não foi possível concluir o convite. Tente novamente.";
  }
}

export default function Convite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Link de convite inválido.");
      setLoading(false);
      return;
    }

    supabase
      .rpc("validate_invitation_token" as any, { p_token: token })
      .then(({ data, error: fetchError }: any) => {
        if (fetchError || !data || !data.valid) {
          const reason = data?.error;
          if (reason === "expired") {
            setError("Este convite expirou. Solicite um novo convite.");
          } else {
            setError("Convite não encontrado ou já utilizado.");
          }
        } else {
          setInvitation(data);
        }
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !token) return;

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const invitedEmail = String(invitation.email ?? "").trim().toLowerCase();
      const { data: currentSessionData } = await supabase.auth.getSession();
      let activeSession = currentSessionData.session;

      if (activeSession?.user.email?.trim().toLowerCase() !== invitedEmail) {
        if (activeSession) {
          await supabase.auth.signOut();
          activeSession = null;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: invitation.email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });

        if (authError) {
          const alreadyRegistered = /already registered/i.test(authError.message);

          if (!alreadyRegistered) {
            setError(translateSupabaseError(authError.message));
            setSubmitting(false);
            return;
          }

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: invitation.email,
            password,
          });

          if (signInError) {
            setError("Este e-mail já está cadastrado. Faça login com a senha definida para concluir o convite.");
            setSubmitting(false);
            return;
          }

          activeSession = signInData.session ?? await waitForSession();
        } else {
          activeSession = authData.session ?? await waitForSession();
        }
      }

      if (!activeSession) {
        setError("Erro ao iniciar sessão. Tente novamente.");
        setSubmitting(false);
        return;
      }

      const { data, error: acceptError } = await supabase.rpc("accept_invitation_membership" as any, {
        p_token: token,
        p_full_name: fullName.trim(),
      });

      if (acceptError) {
        setError(translateSupabaseError(acceptError.message));
        setSubmitting(false);
        return;
      }

      const result = data as any;
      if (!result?.success) {
        setError(translateInvitationAcceptanceError(result?.error));
        setSubmitting(false);
        return;
      }

      toast({ title: "Conta criada com sucesso!", description: "Bem-vindo ao Evita HSE." });
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Não foi possível concluir o convite. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lp-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-lp-emerald border-t-transparent" />
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <AuthShell title="Convite inválido">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-sm text-lp-muted">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 rounded-lg bg-lp-emerald text-lp-bg font-medium hover:bg-lp-emerald-glow transition-all lp-glow"
          >
            Ir para o login
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Aceitar convite" subtitle="Você foi convidado para se juntar a uma empresa.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-lp-ink">E-mail</Label>
          <Input value={invitation?.email ?? ""} disabled className="bg-lp-cream border-lp-border text-lp-muted" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-lp-ink">Nome completo *</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required
            className="bg-lp-surface border-lp-border text-lp-ink focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-lp-ink">Senha *</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="bg-lp-surface border-lp-border text-lp-ink focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-lp-ink">Confirmar senha *</Label>
          <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            className="bg-lp-surface border-lp-border text-lp-ink focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40" />
        </div>

        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-lp-emerald text-lp-bg font-medium hover:bg-lp-emerald-glow transition-all lp-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Criando conta..." : "Criar conta e entrar"}
        </button>
      </form>
    </AuthShell>
  );
}
