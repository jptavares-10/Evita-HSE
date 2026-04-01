import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { translateSupabaseError } from "@/lib/supabase-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      .rpc("validate_invitation_token", { p_token: token })
      .then(({ data, error: fetchError }) => {
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
    if (!invitation) return;

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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (authError || !authData.user) {
      setError(translateSupabaseError(authError?.message ?? "Erro ao criar conta."));
      setSubmitting(false);
      return;
    }

    // Wait for session to be active before inserting profile
    let activeSession = null;
    const start = Date.now();
    while (Date.now() - start < 5000) {
      const { data } = await supabase.auth.getSession();
      if (data.session) { activeSession = data.session; break; }
      await new Promise((r) => setTimeout(r, 500));
    }

    if (!activeSession) {
      setError("Erro ao iniciar sessão. Tente novamente.");
      setSubmitting(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      company_id: invitation.company_id,
      full_name: fullName.trim(),
      email: invitation.email,
      role: "member",
    });

    if (profileError) {
      setError("Erro ao criar perfil.");
      setSubmitting(false);
      return;
    }

    await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    toast({ title: "Conta criada com sucesso!", description: "Bem-vindo ao Evita HSE." });
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="bg-card rounded-lg border shadow-lg p-8 max-w-md w-full text-center">
          <Shield className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h1 className="text-lg font-semibold mb-2">Convite inválido</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button className="mt-4" onClick={() => navigate("/login")}>Ir para o login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="bg-card rounded-lg border shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Evita HSE</h1>
          </div>
          <h2 className="text-lg font-semibold text-center mb-2">Aceitar convite</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Você foi convidado para se juntar a uma empresa.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={invitation?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo *</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha *</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Criando conta..." : "Criar conta e entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
