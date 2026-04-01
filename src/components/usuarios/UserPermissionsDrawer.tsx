import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, ShieldCheck, ShieldOff, Loader2, Bell, ClipboardCheck, AlertTriangle, GraduationCap, Stethoscope, Recycle, FileText, Handshake, BookOpen } from "lucide-react";
import type { ModuleKey } from "@/hooks/usePermission";
import { clearPermissionsCache } from "@/hooks/usePermission";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Props {
  user: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveUser: (userId: string) => void;
  currentUserId?: string;
}

const MODULE_GROUPS = [
  {
    label: "SEGURANÇA",
    modules: [
      { key: "periodic_services" as ModuleKey, label: "Serviços Periódicos", icon: Bell },
      { key: "inspections" as ModuleKey, label: "Inspeções", icon: ClipboardCheck },
      { key: "ic_nc" as ModuleKey, label: "IC & NC", icon: AlertTriangle },
    ],
  },
  {
    label: "SAÚDE",
    modules: [
      { key: "trainings" as ModuleKey, label: "Treinamentos", icon: GraduationCap },
      { key: "aso" as ModuleKey, label: "ASO", icon: Stethoscope },
    ],
  },
  {
    label: "MEIO AMBIENTE",
    modules: [
      { key: "mtr" as ModuleKey, label: "Gestão de MTR", icon: Recycle },
      { key: "environmental_licenses" as ModuleKey, label: "Licenças Ambientais", icon: FileText },
      { key: "suppliers" as ModuleKey, label: "Fornecedores", icon: Handshake },
    ],
  },
  {
    label: "GERAL",
    modules: [
      { key: "document_library" as ModuleKey, label: "Biblioteca de Documentos", icon: BookOpen },
    ],
  },
];

const ALL_MODULES = MODULE_GROUPS.flatMap((g) => g.modules.map((m) => m.key));

export function UserPermissionsDrawer({ user, open, onOpenChange, onRemoveUser, currentUserId }: Props) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const isTargetAdmin = user?.role === "admin";

  const [permissions, setPermissions] = useState<Record<ModuleKey, string>>({} as any);
  const [loading, setLoading] = useState(false);
  const [updatingModule, setUpdatingModule] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<"grant" | "revoke" | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const fetchPermissions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("get_user_permissions", { p_user_id: user.id });
    if (!error && data && typeof data === "object" && !(data as any).error) {
      setPermissions(data as Record<ModuleKey, string>);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (open && user) fetchPermissions();
  }, [open, user, fetchPermissions]);

  const handleToggle = async (module: ModuleKey, newPerm: string) => {
    if (!user) return;
    setUpdatingModule(module);
    const { data, error } = await supabase.rpc("set_user_permission", {
      p_user_id: user.id,
      p_module: module,
      p_permission: newPerm,
    });
    if (error || !(data as any)?.success) {
      toast.error((data as any)?.error || "Erro ao atualizar permissão.");
    } else {
      setPermissions((prev) => ({ ...prev, [module]: newPerm }));
      clearPermissionsCache(user.id);
      toast.success("Permissão atualizada");
    }
    setUpdatingModule(null);
  };

  const handleBulk = async (perm: "editor" | "viewer") => {
    if (!user) return;
    setConfirmBulk(null);
    for (const mod of ALL_MODULES) {
      if (permissions[mod] !== perm) {
        await handleToggle(mod, perm);
      }
    }
  };

  if (!user) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{user.full_name}</SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
              {isAdmin && <TabsTrigger value="permissions" className="flex-1">Permissões</TabsTrigger>}
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="text-sm font-medium">{user.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Função</p>
                  <Badge variant="outline" className="capitalize">{user.role}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entrada</p>
                  <p className="text-sm">{format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              </div>
              {isAdmin && user.id !== currentUserId && (
                <>
                  <Separator />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setRemoveDialogOpen(true)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover da empresa
                  </Button>
                </>
              )}
            </TabsContent>

            {isAdmin && (
              <TabsContent value="permissions" className="space-y-4 mt-4">
                {isTargetAdmin && (
                  <div className="bg-muted/50 border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      Este usuário é administrador e tem acesso total a todos os módulos. As permissões abaixo não se aplicam a administradores.
                    </p>
                  </div>
                )}

                {!isTargetAdmin && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setConfirmBulk("grant")}>
                      <ShieldCheck className="h-4 w-4 mr-1.5" />
                      Dar acesso total
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmBulk("revoke")}>
                      <ShieldOff className="h-4 w-4 mr-1.5" />
                      Revogar edição
                    </Button>
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    {MODULE_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          {group.label}
                        </p>
                        <div className="space-y-1">
                          {group.modules.map((mod) => {
                            const perm = permissions[mod.key] || "viewer";
                            const isEditor = perm === "editor";
                            const isUpdating = updatingModule === mod.key;
                            const Icon = mod.icon;
                            return (
                              <div
                                key={mod.key}
                                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{mod.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs ${!isEditor ? "text-muted-foreground font-medium" : "text-muted-foreground/50"}`}>
                                    Viewer
                                  </span>
                                  {isUpdating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Switch
                                      checked={isEditor}
                                      onCheckedChange={(checked) =>
                                        handleToggle(mod.key, checked ? "editor" : "viewer")
                                      }
                                      disabled={isTargetAdmin}
                                    />
                                  )}
                                  <span className={`text-xs ${isEditor ? "text-primary font-medium" : "text-muted-foreground/50"}`}>
                                    Editor
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {user.full_name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onRemoveUser(user.id); setRemoveDialogOpen(false); onOpenChange(false); }}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmBulk} onOpenChange={() => setConfirmBulk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmBulk === "grant" ? "Dar acesso total" : "Revogar edição"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmBulk === "grant"
                ? `Definir permissão de Editor em todos os módulos para ${user.full_name}?`
                : `Definir permissão de Viewer (somente leitura) em todos os módulos para ${user.full_name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleBulk(confirmBulk === "grant" ? "editor" : "viewer")}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
