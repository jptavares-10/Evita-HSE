import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCNPJ, isValidCNPJFormat } from "@/lib/cnpj";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const SEGMENTS = [
  "Construção Civil", "Indústria", "Facilities", "Mineração",
  "Óleo e Gás", "Saúde", "Logística", "Outro",
];

export default function Empresa() {
  const { company, refreshCompany } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [segment, setSegment] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isExpired = company?.plan === "expired";

  useEffect(() => {
    if (company) {
      setName(company.name);
      setCnpj(company.cnpj ?? "");
      setSegment(company.segment ?? "");
    }
  }, [company]);

  const handleSave = async () => {
    if (!company) return;
    if (cnpj && !isValidCNPJFormat(cnpj)) {
      toast({ title: "CNPJ inválido", description: "Use o formato XX.XXX.XXX/XXXX-XX.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("update_company_safe_fields", {
      p_name: name.trim(),
      p_cnpj: cnpj || null,
      p_segment: segment || null,
      p_logo_url: company.logo_url,
    });

    if (error) {
      toast({ title: "Erro", description: "Erro ao atualizar dados.", variant: "destructive" });
    } else {
      toast({ title: "Dados atualizados com sucesso!" });
      await refreshCompany();
    }
    setLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!company || !e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const ext = file.name.split(".").pop();
    const path = `${company.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Erro", description: "Erro ao enviar logo.", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("company-logos").getPublicUrl(path);

    await supabase.from("companies").update({ logo_url: publicUrl }).eq("id", company.id);
    toast({ title: "Logo atualizada!" });
    await refreshCompany();
    setUploading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold">Minha Empresa</h1>
        <p className="text-muted-foreground text-sm mt-1">Informações da empresa.</p>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <Label htmlFor="logo" className="cursor-pointer text-sm text-primary font-medium hover:underline underline-offset-2">
              {uploading ? "Enviando..." : "Alterar logo"}
            </Label>
            <input id="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
            <p className="text-xs text-muted-foreground">JPG, PNG. Máx 2MB.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nome da empresa</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>CNPJ</Label>
          <Input
            placeholder="XX.XXX.XXX/XXXX-XX"
            value={cnpj}
            onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
            maxLength={18}
          />
        </div>

        <div className="space-y-2">
          <Label>Segmento</Label>
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {SEGMENTS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button onClick={handleSave} disabled={loading || isExpired}>
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </TooltipTrigger>
          {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
        </Tooltip>
      </div>
    </div>
  );
}
