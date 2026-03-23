import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSupplierCategories, useCreateSupplierCategory, useCreateSupplier, useUpdateSupplier, useRegeneratePortalToken } from "@/hooks/useSuppliers";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: any;
}

export function SupplierDrawer({ open, onOpenChange, supplier }: Props) {
  const isEdit = !!supplier;
  const { data: categories = [] } = useSupplierCategories();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const createCategory = useCreateSupplierCategory();
  const regenerateToken = useRegeneratePortalToken();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => {
    if (open) {
      if (supplier) {
        setName(supplier.name || "");
        setCategoryId(supplier.category_id || "");
        setContactName(supplier.contact_name || "");
        setContactPhone(supplier.contact_phone || "");
        setContactEmail(supplier.contact_email || "");
        setNotes(supplier.notes || "");
        setPortalEnabled(supplier.portal_enabled ?? true);
        setStatus(supplier.status || "active");
      } else {
        setName(""); setCategoryId(""); setContactName(""); setContactPhone("");
        setContactEmail(""); setNotes(""); setPortalEnabled(true); setStatus("active");
      }
    }
  }, [open, supplier]);

  const handleSave = async () => {
    if (!name.trim()) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await updateSupplier.mutateAsync({
          id: supplier.id, name, category_id: categoryId, contact_name: contactName,
          contact_phone: contactPhone, contact_email: contactEmail, notes, portal_enabled: portalEnabled, status,
        });
      } else {
        await createSupplier.mutateAsync({
          name, category_id: categoryId, contact_name: contactName,
          contact_phone: contactPhone, contact_email: contactEmail, notes, portal_enabled: portalEnabled,
        });
      }
      onOpenChange(false);
    } finally { setSaving(false); }
  };

  const portalLink = supplier ? `${window.location.origin}/portal/fornecedor/${supplier.portal_token}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalLink);
    toast({ title: "Link copiado!" });
  };

  const handleRegenerate = async () => {
    setConfirmRegenerate(false);
    await regenerateToken.mutateAsync(supplier.id);
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    await createCategory.mutateAsync(newCatName.trim());
    setNewCatName("");
    setNewCatModalOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEdit ? "Editar Fornecedor" : "Novo Fornecedor"}</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Identification */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identificação</h3>
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Razão social ou nome fantasia" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <div className="flex gap-2">
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setNewCatModalOpen(true)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              {isEdit && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contato</h3>
              <div className="space-y-2">
                <Label>Nome do contato</Label>
                <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nome" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@exemplo.com" type="email" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações..." rows={3} />
            </div>

            {/* Portal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Portal do Fornecedor</h3>
              <div className="flex items-center gap-3">
                <Switch checked={portalEnabled} onCheckedChange={setPortalEnabled} />
                <span className="text-sm">Portal ativo</span>
              </div>
              {isEdit && portalEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={portalLink} readOnly className="text-xs bg-muted" />
                    <Button variant="outline" size="icon" onClick={handleCopyLink}><Copy className="h-4 w-4" /></Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setConfirmRegenerate(true)}>
                    <RefreshCw className="h-3 w-3 mr-1" />Gerar novo link
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Compartilhe este link com o fornecedor para que ele possa enviar documentos diretamente.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar fornecedor"}</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmRegenerate} onOpenChange={setConfirmRegenerate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar novo link?</AlertDialogTitle>
            <AlertDialogDescription>
              Gerar um novo link irá invalidar o link anterior. O fornecedor não conseguirá mais acessar pelo link antigo. Confirmar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={newCatModalOpen} onOpenChange={setNewCatModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nome da categoria" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCatModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCategory} disabled={!newCatName.trim()}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
