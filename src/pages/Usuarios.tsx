import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { UserPlus, Trash2, Copy, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  token: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export default function Usuarios() {
  const { profile, company } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isExpired = company?.plan === "expired";
  const isAdmin = profile?.role === "admin";

  const fetchData = async () => {
    if (!profile?.company_id) return;
    const { data: usersData } = await supabase.from("profiles").select("*").eq("company_id", profile.company_id);
    setUsers(usersData ?? []);

    if (profile.role === "admin") {
      const { data: invData } = await supabase.from("invitations").select("*").eq("company_id", profile.company_id).eq("status", "pending");
      setInvitations(invData ?? []);
    }
  };

  useEffect(() => { fetchData(); }, [profile?.company_id]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !profile || !company) return;
    setLoading(true);

    // Check user limit
    const totalUsers = users.length;
    if (totalUsers >= company.max_users) {
      toast({ title: "Limite atingido", description: "Limite de usuários do seu plano atingido. Faça upgrade para convidar mais.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check if email already in company
    if (users.some((u) => u.email === inviteEmail.trim())) {
      toast({ title: "Erro", description: "Este e-mail já faz parte da sua empresa.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("invitations")
      .insert({
        company_id: profile.company_id,
        email: inviteEmail.trim(),
        invited_by: profile.id,
      })
      .select()
      .single();

    if (error || !data) {
      toast({ title: "Erro", description: "Erro ao criar convite.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const link = `${window.location.origin}/convite?token=${data.token}`;
    setInviteLink(link);
    setInviteEmail("");
    setLoading(false);
    fetchData();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({ title: "Link copiado!" });
  };

  const handleCancelInvite = async (id: string) => {
    await supabase.from("invitations").update({ status: "expired" }).eq("id", id);
    toast({ title: "Convite cancelado." });
    fetchData();
  };

  const handleRemoveUser = async (userId: string) => {
    const { data, error } = await supabase.rpc("remove_member", { p_member_id: userId });
    const result = data as any;
    if (error) {
      toast({ title: "Erro", description: error.message || "Erro ao remover usuário.", variant: "destructive" });
      return;
    }
    if (!result?.success) {
      toast({ title: "Erro", description: result?.error || "Erro ao remover usuário.", variant: "destructive" });
      return;
    }
    toast({ title: "Usuário removido." });
    fetchData();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} de {company?.max_users} usuários
          </p>
        </div>
        {isAdmin && (
          <Dialog open={inviteOpen} onOpenChange={(o) => { setInviteOpen(o); if (!o) { setInviteLink(""); setInviteEmail(""); } }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DialogTrigger asChild>
                    <Button disabled={isExpired}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Convidar usuário
                    </Button>
                  </DialogTrigger>
                </div>
              </TooltipTrigger>
              {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
            </Tooltip>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar usuário</DialogTitle>
              </DialogHeader>
              {inviteLink ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Compartilhe este link com o convidado:</p>
                  <div className="flex gap-2">
                    <Input value={inviteLink} readOnly className="text-xs" />
                    <Button size="sm" variant="outline" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full">Fechar</Button>
                  </DialogClose>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>E-mail do convidado</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleInvite} disabled={loading || !inviteEmail.trim()}>
                      {loading ? "Enviando..." : "Gerar convite"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Users table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">E-mail</th>
              <th className="text-left px-4 py-3 font-medium">Função</th>
              <th className="text-left px-4 py-3 font-medium">Entrada</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-3">{u.full_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium bg-muted px-2 py-1 rounded capitalize">{u.role}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(u.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== profile?.id && (
                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-block">
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" disabled={isExpired}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                          </div>
                        </TooltipTrigger>
                        {isExpired && <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>}
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover usuário</AlertDialogTitle>
                          <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveUser(u.id)}>Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending invitations */}
      {isAdmin && invitations.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Convites pendentes</h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between bg-card border rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-warning" />
                  <div>
                    <p className="text-sm font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">Aguardando aceite</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleCancelInvite(inv.id)}>
                  Cancelar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
