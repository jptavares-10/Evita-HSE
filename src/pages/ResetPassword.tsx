import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="bg-card rounded-lg border shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Evita HSE</h1>
          </div>
          <h2 className="text-lg font-semibold text-center mb-6">Redefinir senha</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label>Confirmar nova senha</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
