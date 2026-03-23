import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { translateSupabaseError } from "@/lib/supabase-errors";
import { formatCNPJ, isValidCNPJFormat } from "@/lib/cnpj";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function Cadastro() {
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [segment, setSegment] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

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

    setLoading(true);

    // 1. Create auth user
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

    const userId = authData.user.id;

    // 2. Create company
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: companyName.trim(),
        cnpj: cnpj || null,
        segment: segment || null,
        plan: "trial",
        max_users: 2,
      })
      .select()
      .single();

    if (companyError || !companyData) {
      setError("Erro ao criar empresa. Tente novamente.");
      setLoading(false);
      return;
    }

    // 3. Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      company_id: companyData.id,
      full_name: fullName.trim(),
      email: email.trim(),
      role: "admin",
    });

    if (profileError) {
      setError("Erro ao criar perfil. Tente novamente.");
      setLoading(false);
      return;
    }

    toast({
      title: "Bem-vindo ao Evita HSE!",
      description: "Seu trial de 14 dias começou.",
    });

    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="bg-card rounded-lg border shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Evita HSE</h1>
          </div>

          <h2 className="text-lg font-semibold text-center mb-6">Criar conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 border-b pb-4 mb-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dados da empresa</p>
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
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dados do responsável</p>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo *</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline underline-offset-2">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
