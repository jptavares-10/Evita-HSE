import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSuppliers, useSupplierCategories, useDeleteSupplier, useAllSupplierDocumentCounts } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, FolderOpen, Copy, Pencil, Trash2, Phone, Users, FileText, AlertTriangle, UserPlus, Globe } from "lucide-react";
import { ModuleOnboarding, OnboardingStep } from "@/components/ModuleOnboarding";
import { SupplierDrawer } from "@/components/fornecedores/SupplierDrawer";
import { ManageSupplierCategoriesModal } from "@/components/fornecedores/ManageSupplierCategoriesModal";
import { DeleteSupplierDialog } from "@/components/fornecedores/DeleteSupplierDialog";
import { SupplierKpiCards } from "@/components/fornecedores/SupplierKpiCards";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatPhone } from "@/lib/suppliers";
import { usePageTitle } from "@/hooks/usePageTitle";
import { TableSkeleton } from "@/components/TableSkeleton";
import { usePermission } from "@/hooks/usePermission";
import { ViewerBadge } from "@/components/ViewerBadge";

export default function Fornecedores() {
  usePageTitle("Fornecedores — Evita HSE");
  const { company } = useAuth();
  const { data: suppliers = [], isLoading } = useSuppliers();
  const { data: categories = [] } = useSupplierCategories();
  const navigate = useNavigate();
  const { toast } = useToast();
  const planExpired = company?.plan === "expired";
  const { canEdit } = usePermission("suppliers");
  const isDisabled = planExpired || !canEdit;

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const { data: docCounts = {} } = useAllSupplierDocumentCounts();

  const filtered = useMemo(() => {
    let result = [...suppliers];
    if (search) result = result.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== "all") result = result.filter((s: any) => s.category_id === categoryFilter);
    if (statusFilter !== "all") result = result.filter((s: any) => s.status === statusFilter);
    return result;
  }, [suppliers, search, categoryFilter, statusFilter]);

  const activeCount = suppliers.filter((s: any) => s.status === "active").length;

  const copyPortalLink = (token: string) => {
    const url = `${window.location.origin}/portal/fornecedor/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setDrawerOpen(true);
  };

  const handleNew = () => {
    setEditingSupplier(null);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie seus fornecedores e documentos</p>
        </div>
      </div>

      <SupplierKpiCards suppliers={suppliers} docCounts={docCounts} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setCategoriesModalOpen(true)}>Categorias</Button>
        <div className="ml-auto">
          {planExpired ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled><Plus className="h-4 w-4 mr-2" />Novo Fornecedor</Button>
              </TooltipTrigger>
              <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>
            </Tooltip>
          ) : (
            <Button onClick={handleNew}><Plus className="h-4 w-4 mr-2" />Novo Fornecedor</Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton columns={7} />
      ) : suppliers.length === 0 ? (
        <ModuleOnboarding
          title="Fornecedores"
          description="Gerencie seus fornecedores, documentos e portal de autoatendimento."
          icon={Users}
          steps={[
            { title: "Cadastrar primeiro fornecedor", description: "Registre nome, contato e categoria do fornecedor", icon: UserPlus, actionLabel: "Cadastrar", action: handleNew, completed: false },
            { title: "Ativar portal do fornecedor", description: "Após cadastrar, ative o portal para que o fornecedor envie documentos", icon: Globe, actionLabel: "Cadastrar primeiro", action: handleNew, completed: false },
          ] as OnboardingStep[]}
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Users className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground">Nenhum fornecedor encontrado com os filtros aplicados.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-center">Documentos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    {s.supplier_categories ? (
                      <Badge variant="outline">{(s.supplier_categories as any).name}</Badge>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    {s.contact_name ? (
                      <div className="text-sm">
                        <span>{s.contact_name}</span>
                        {s.contact_phone && <span className="text-muted-foreground ml-2">{formatPhone(s.contact_phone)}</span>}
                      </div>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="tabular-nums text-sm">{docCounts[s.id] || 0}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>
                      {s.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/fornecedores/${s.id}`)}>
                            <FolderOpen className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver documentos</TooltipContent>
                      </Tooltip>
                      {s.portal_enabled && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyPortalLink(s.portal_token)} disabled={planExpired}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{planExpired ? "Plano expirado" : "Copiar link do portal"}</TooltipContent>
                        </Tooltip>
                      )}
                      {planExpired ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled><Pencil className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
                      )}
                      {planExpired ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled><Trash2 className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Seu plano expirou. Faça upgrade para continuar.</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(s)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <SupplierDrawer open={drawerOpen} onOpenChange={setDrawerOpen} supplier={editingSupplier} />
      <ManageSupplierCategoriesModal open={categoriesModalOpen} onOpenChange={setCategoriesModalOpen} />
      <DeleteSupplierDialog supplier={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
}
