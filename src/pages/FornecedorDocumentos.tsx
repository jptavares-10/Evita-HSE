import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSignedUrl } from "@/lib/storage-utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSuppliers, useSupplierFolders, useSupplierDocuments, useCreateSupplierFolder, useUploadSupplierDocument, useDeleteSupplierDocument, useDeleteSupplierFolder } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, FolderPlus, Upload, Folder, FolderOpen, ChevronRight, Eye, Download, Trash2, FileText, Copy, Pencil } from "lucide-react";
import { formatDateBR, getFileIcon, getFileExtension } from "@/lib/suppliers";
import { useToast } from "@/hooks/use-toast";
import { SupplierDrawer } from "@/components/fornecedores/SupplierDrawer";
import { usePermission } from "@/hooks/usePermission";

export default function FornecedorDocumentos() {
  const { id: supplierId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const { toast } = useToast();
  const planExpired = company?.plan === "expired";
  const { canEdit } = usePermission("suppliers");

  const { data: suppliers = [] } = useSuppliers();
  const supplier = suppliers.find((s: any) => s.id === supplierId);
  const { data: folders = [] } = useSupplierFolders(supplierId || null);
  const { data: documents = [] } = useSupplierDocuments(supplierId || null);
  const createFolder = useCreateSupplierFolder();
  const uploadDoc = useUploadSupplierDocument();
  const deleteDoc = useDeleteSupplierDocument();
  const deleteFolder = useDeleteSupplierFolder();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParent, setNewFolderParent] = useState<string>("root");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadReference, setUploadReference] = useState("");
  const [uploadFolderId, setUploadFolderId] = useState<string>("root");
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const rootFolders = folders.filter((f: any) => !f.parent_folder_id);
  const getSubFolders = (parentId: string) => folders.filter((f: any) => f.parent_folder_id === parentId);

  const filteredDocs = useMemo(() => {
    if (!selectedFolderId) return documents;
    return documents.filter((d: any) => d.folder_id === selectedFolderId);
  }, [documents, selectedFolderId]);

  const docCountForFolder = (folderId: string) => {
    const subIds = getSubFolders(folderId).map((f: any) => f.id);
    return documents.filter((d: any) => d.folder_id === folderId || subIds.includes(d.folder_id)).length;
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !supplierId) return;
    const parentId = newFolderParent === "root" ? null : newFolderParent;
    await createFolder.mutateAsync({ supplier_id: supplierId, name: newFolderName.trim(), parent_folder_id: parentId });
    setNewFolderName("");
    setNewFolderParent("root");
    setNewFolderOpen(false);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadDescription.trim() || !supplierId) return;
    setUploading(true);
    try {
      await uploadDoc.mutateAsync({
        supplier_id: supplierId,
        folder_id: uploadFolderId === "root" ? null : uploadFolderId,
        description: uploadDescription.trim(),
        reference_name: uploadReference.trim() || null,
        file: uploadFile,
      });
      setUploadFile(null);
      setUploadDescription("");
      setUploadReference("");
      setUploadFolderId("root");
      setUploadOpen(false);
    } finally { setUploading(false); }
  };

  const handleDeleteDoc = async () => {
    if (!deleteTarget) return;
    await deleteDoc.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  const copyPortalLink = () => {
    if (!supplier) return;
    const url = `${window.location.origin}/portal/fornecedor/${supplier.portal_token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  };

  if (!supplier) return <div className="p-8 text-center text-muted-foreground">Fornecedor não encontrado.</div>;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/fornecedores")}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{supplier.name}</h1>
            {supplier.supplier_categories && <Badge variant="outline">{(supplier.supplier_categories as any).name}</Badge>}
            <Badge variant={supplier.status === "active" ? "default" : "secondary"}>{supplier.status === "active" ? "Ativo" : "Inativo"}</Badge>
          </div>
        </div>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => setEditDrawerOpen(true)} disabled={planExpired}><Pencil className="h-3.5 w-3.5 mr-1" />Editar</Button>
        )}
        {canEdit && supplier.portal_enabled && isAdmin && supplier.portal_token && (
          <Button variant="outline" size="sm" onClick={copyPortalLink} disabled={planExpired}><Copy className="h-3.5 w-3.5 mr-1" />Link do portal</Button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Folder tree */}
        <div className="col-span-3 border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Pastas</span>
            {canEdit && !planExpired && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setNewFolderOpen(true)}><FolderPlus className="h-4 w-4" /></Button>
            )}
          </div>

          <button
            onClick={() => setSelectedFolderId(null)}
            className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${selectedFolderId === null ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted text-muted-foreground"}`}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Todos ({documents.length})
          </button>

          {rootFolders.map((folder: any) => (
            <div key={folder.id}>
              <button
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${selectedFolderId === folder.id ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted text-muted-foreground"}`}
              >
                <Folder className="h-3.5 w-3.5" />
                <span className="flex-1 truncate">{folder.name}</span>
                <span className="text-xs tabular-nums">{docCountForFolder(folder.id)}</span>
              </button>
              {getSubFolders(folder.id).map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedFolderId(sub.id)}
                  className={`w-full text-left pl-6 px-2 py-1 rounded text-xs flex items-center gap-2 transition-colors ${selectedFolderId === sub.id ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted text-muted-foreground"}`}
                >
                  <Folder className="h-3 w-3" />
                  <span className="flex-1 truncate">{sub.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Documents */}
        <div className="col-span-9 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {selectedFolderId ? folders.find((f: any) => f.id === selectedFolderId)?.name : "Todos os documentos"}
            </h2>
            {!planExpired && (
              <Button size="sm" onClick={() => { setUploadFolderId(selectedFolderId || "root"); setUploadOpen(true); }}>
                <Upload className="h-4 w-4 mr-1" />Enviar documento
              </Button>
            )}
          </div>

          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum documento nesta pasta ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map((doc: any) => (
                <SupplierDocRow key={doc.id} doc={doc} planExpired={planExpired} onDelete={() => setDeleteTarget(doc)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nova Pasta</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Nome da pasta *</Label>
              <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Nome" />
            </div>
            <div className="space-y-2">
              <Label>Pasta pai</Label>
              <Select value={newFolderParent} onValueChange={setNewFolderParent}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Raiz</SelectItem>
                  {rootFolders.map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Criar pasta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Enviar documento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pasta de destino</Label>
              <Select value={uploadFolderId} onValueChange={setUploadFolderId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Raiz</SelectItem>
                  {folders.map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>{f.parent_folder_id ? `  └ ${f.name}` : f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="Descrição do documento" />
            </div>
            <div className="space-y-2">
              <Label>Referência</Label>
              <Input value={uploadReference} onChange={(e) => setUploadReference(e.target.value)} placeholder="Ex: João Silva, Guindaste GR-01" />
            </div>
            <div className="space-y-2">
              <Label>Arquivo *</Label>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={uploading || !uploadFile || !uploadDescription.trim()}>
              {uploading ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Doc Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir {deleteTarget?.file_name}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDoc} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SupplierDrawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} supplier={supplier} />
    </div>
  );
}

function SupplierDocRow({ doc, planExpired, onDelete }: { doc: any; planExpired: boolean; onDelete: () => void }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    getSignedUrl("supplier-documents", doc.file_url).then((u) => { if (!cancelled) setSignedUrl(u); });
    return () => { cancelled = true; };
  }, [doc.file_url]);

  return (
    <div className="border rounded-lg p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
      <span className="text-xl">{getFileIcon(doc.file_type || getFileExtension(doc.file_name))}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.file_name}</p>
        <p className="text-xs text-muted-foreground">{doc.description}</p>
        {doc.reference_name && <p className="text-xs text-muted-foreground">Ref: {doc.reference_name}</p>}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{formatDateBR(doc.uploaded_at)}</span>
          {doc.uploaded_by_supplier && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Fornecedor</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <a href={signedUrl || "#"} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
        </a>
        <a href={signedUrl || "#"} download={doc.file_name}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
        </a>
        {!planExpired && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
