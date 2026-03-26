import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Folder, FolderOpen, FolderPlus, Upload, Eye, Download, FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDateBR, getFileIcon, getFileExtension } from "@/lib/suppliers";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10;

export default function PortalFornecedor() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<any>(null);

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

  const fetchPortalData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc("get_supplier_portal_data", { p_token: token });
      if (rpcErr) throw rpcErr;
      const result = data as any;
      if (!result.success) {
        setError(result.error);
      } else {
        setPortalData(result);
      }
    } catch (e: any) {
      setError("Erro ao carregar o portal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortalData(); }, [token]);

  const folders = portalData?.folders ?? [];
  const documents = portalData?.documents ?? [];
  const rootFolders = folders.filter((f: any) => !f.parent_folder_id);
  const getSubFolders = (parentId: string) => folders.filter((f: any) => f.parent_folder_id === parentId);

  const filteredDocs = useMemo(() => {
    if (!selectedFolderId) return documents;
    return documents.filter((d: any) => d.folder_id === selectedFolderId);
  }, [documents, selectedFolderId]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const parentId = newFolderParent === "root" ? null : newFolderParent;
    const { data, error: rpcErr } = await supabase.rpc("create_supplier_folder_portal", {
      p_token: token!,
      p_name: newFolderName.trim(),
      p_parent_folder_id: parentId,
    });
    if (rpcErr) { toast({ title: "Erro", description: rpcErr.message, variant: "destructive" }); return; }
    const result = data as any;
    if (!result.success) { toast({ title: "Erro", description: result.error, variant: "destructive" }); return; }
    toast({ title: "Pasta criada" });
    setNewFolderName(""); setNewFolderParent("root"); setNewFolderOpen(false);
    fetchPortalData();
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadDescription.trim()) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("token", token!);
      formData.append("file", uploadFile);
      formData.append("description", uploadDescription.trim());
      if (uploadReference.trim()) formData.append("reference_name", uploadReference.trim());
      if (uploadFolderId !== "root") formData.append("folder_id", uploadFolderId);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/supplier-portal-upload`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      toast({ title: "Documento enviado com sucesso" });
      setUploadFile(null); setUploadDescription(""); setUploadReference(""); setUploadFolderId("root"); setUploadOpen(false);
      fetchPortalData();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-xl font-bold">Portal indisponível</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold">Evita HSE</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">Portal de Documentos — {portalData.supplier_name}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Envie seus documentos para <strong>{portalData.company_name}</strong>. Seus arquivos ficam organizados e disponíveis para consulta.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Folder tree */}
          <div className="col-span-3 border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Pastas</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setNewFolderOpen(true)}><FolderPlus className="h-4 w-4" /></Button>
            </div>
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${!selectedFolderId ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted text-muted-foreground"}`}
            >
              <FolderOpen className="h-3.5 w-3.5" />Todos ({documents.length})
            </button>
            {rootFolders.map((folder: any) => (
              <div key={folder.id}>
                <button
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${selectedFolderId === folder.id ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted text-muted-foreground"}`}
                >
                  <Folder className="h-3.5 w-3.5" /><span className="flex-1 truncate">{folder.name}</span>
                </button>
                {getSubFolders(folder.id).map((sub: any) => (
                  <button key={sub.id} onClick={() => setSelectedFolderId(sub.id)}
                    className={`w-full text-left pl-6 px-2 py-1 rounded text-xs flex items-center gap-2 transition-colors ${selectedFolderId === sub.id ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted text-muted-foreground"}`}
                  >
                    <Folder className="h-3 w-3" /><span className="truncate">{sub.name}</span>
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
              <Button size="sm" onClick={() => { setUploadFolderId(selectedFolderId || "root"); setUploadOpen(true); }}>
                <Upload className="h-4 w-4 mr-1" />Enviar documento
              </Button>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum documento nesta pasta ainda.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocs.map((doc: any) => (
                  <PortalDocRow key={doc.id} doc={doc} token={token!} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">Powered by Evita HSE</footer>

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
    </div>
  );
}

function PortalDocRow({ doc, token }: { doc: any; token: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    fetch(`${supabaseUrl}/functions/v1/supplier-portal-file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, file_path: doc.file_url }),
    })
      .then((r) => r.json())
      .then((result) => { if (!cancelled && result.signed_url) setSignedUrl(result.signed_url); });
    return () => { cancelled = true; };
  }, [doc.file_url, token]);

  return (
    <div className="border rounded-lg p-3 flex items-center gap-3">
      <span className="text-xl">{getFileIcon(doc.file_type || getFileExtension(doc.file_name))}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.file_name}</p>
        <p className="text-xs text-muted-foreground">{doc.description}</p>
        {doc.reference_name && <p className="text-xs text-muted-foreground">Ref: {doc.reference_name}</p>}
        <span className="text-xs text-muted-foreground">{formatDateBR(doc.uploaded_at)}</span>
      </div>
      <a href={signedUrl || "#"} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
      </a>
      <a href={signedUrl || "#"} download={doc.file_name}>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
      </a>
    </div>
  );
}
