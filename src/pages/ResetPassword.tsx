import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AuthShell } from "@/components/landing/AuthShell";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("A senha deve ter no mínimo 8 caracteres."); return; }
    if (password !== confirmPassword) { setError("As senhas não coincidem."); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("Erro ao atualizar senha. Tente novamente.");
    } else {
      toast({ title: "Senha atualizada com sucesso!" });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <AuthShell title="Redefinir senha" subtitle="Escolha uma nova senha segura para sua conta.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-lp-ink">Nova senha</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="bg-lp-surface border-lp-border text-lp-ink focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40" />
        </div>
        <div className="space-y-2">
          <Label className="text-lp-ink">Confirmar nova senha</Label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            className="bg-lp-surface border-lp-border text-lp-ink focus-visible:ring-lp-emerald/40 focus-visible:border-lp-emerald/40" />
        </div>
        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-lp-emerald text-lp-bg font-medium hover:bg-lp-emerald-glow transition-all lp-glow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Atualizando..." : "Atualizar senha"}
        </button>
      </form>
    </AuthShell>
  );
}
