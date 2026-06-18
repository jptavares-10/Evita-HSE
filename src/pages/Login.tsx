import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { translateSupabaseError } from "@/lib/supabase-errors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AuthShell } from "@/components/landing/AuthShell";

export default function Login() {
  usePageTitle("Entrar — Evita HSE", { noindex: true });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(translateSupabaseError(authError.message));
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({
        title: "Informe seu e-mail",
        description: "Digite seu e-mail no campo acima para receber o link de redefinição.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ title: "Erro", description: translateSupabaseError(error.message), variant: "destructive" });
    } else {
      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }
  };

  return (
    <AuthShell
      title="Entrar na sua conta"
      footer={
        <>
          Não tem conta?{" "}
          <Link to="/cadastro" className="text-lp-emerald font-medium hover:underline underline-offset-2">
            Criar conta grátis
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-lp-ink">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-lp-surface border-lp-border text-lp-ink placeholder:text-lp-muted focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-lp-ink">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-lp-surface border-lp-border text-lp-ink placeholder:text-lp-muted focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-lp-emerald text-lp-bg font-medium hover:bg-lp-emerald-glow transition-all lp-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="w-full text-center text-xs text-lp-muted hover:text-lp-emerald transition-colors mt-2"
        >
          Esqueci minha senha
        </button>
      </form>
    </AuthShell>
  );
}
