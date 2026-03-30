import { useState, useEffect, useMemo } from "react";
import { useDocuments, useServiceDocumentLinks } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, FileText, ExternalLink, Download } from "lucide-react";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { getDocStatusBadgeInfo } from "@/lib/documents";

interface ServiceDocumentsSectionProps {
  serviceId: string | null;
  companyId: string | null;
  profileId: string | null;
}

export function ServiceDocumentsSection({ serviceId, companyId, profileId }: ServiceDocumentsSectionProps) {
  const { data: allDocs = [] } = useDocuments();
  const { data: existingLinks = [] } = useServiceDocumentLinks(serviceId);
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sync from DB on load
  useEffect(() => {
    if (existingLinks.length > 0) {
      setSelectedIds(existingLinks.map((l: any) => l.document_id));
    } else {
      setSelectedIds([]);
    }
  }, [existingLinks]);

  const activeDocs = useMemo(() => allDocs.filter((d: any) => d.status === "active"), [allDocs]);

  const handleAdd = (docId: string) => {
    if (docId && !selectedIds.includes(docId)) {
      setSelectedIds((prev) => [...prev, docId]);
    }
  };

  const handleRemove = (docId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== docId));
  };

  // Sync links to DB when service is saved (called externally via ref or effect)
  // For simplicity, we'll sync on every add/remove
  useEffect(() => {
    if (!serviceId || !companyId || !profileId) return;
    const sync = async () => {
      const existingDocIds = existingLinks.map((l: any) => l.document_id);
      const toAdd = selectedIds.filter((id) => !existingDocIds.includes(id));
      const toRemove = existingDocIds.filter((id: string) => !selectedIds.includes(id));

      for (const docId of toRemove) {
        await supabase.from("document_service_links").delete().eq("document_id", docId).eq("service_id", serviceId);
      }
      for (const docId of toAdd) {
        await supabase.from("document_service_links").insert({
          document_id: docId,
          service_id: serviceId,
          company_id: companyId,
          linked_by: profileId,
        });
      }
      if (toAdd.length || toRemove.length) {
        queryClient.invalidateQueries({ queryKey: ["service-document-links"] });
        queryClient.invalidateQueries({ queryKey: ["document-service-links"] });
      }
    };
    // Debounce a bit
    const t = setTimeout(sync, 500);
    return () => clearTimeout(t);
  }, [selectedIds, serviceId, companyId, profileId]);

  const selectedDocs = useMemo(() => {
    return selectedIds.map((id) => allDocs.find((d: any) => d.id === id)).filter(Boolean);
  }, [selectedIds, allDocs]);

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Documentos relacionados</h3>
      <div className="space-y-2">
        <Select value="" onValueChange={handleAdd}>
          <SelectTrigger>
            <SelectValue placeholder="Buscar por título ou código..." />
          </SelectTrigger>
          <SelectContent>
            {activeDocs.filter((d: any) => !selectedIds.includes(d.id)).map((d: any) => (
              <SelectItem key={d.id} value={d.id}>
                {d.code ? `${d.code} — ` : ""}{d.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedDocs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedDocs.map((d: any) => (
              <Badge key={d.id} variant="secondary" className="gap-1 pr-1">
                {d.code ? `${d.code} — ` : ""}{d.title}
                <button onClick={() => handleRemove(d.id)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface ServiceDocumentsDetailProps {
  serviceId: string | null;
}

export function ServiceDocumentsDetail({ serviceId }: ServiceDocumentsDetailProps) {
  const { data: links = [] } = useServiceDocumentLinks(serviceId);

  if (links.length === 0) return null;

  return (
    <div className="space-y-2 border-t pt-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <FileText className="h-3.5 w-3.5" />Documentos relacionados
      </p>
      {links.map((link: any) => {
        const doc = link.documents;
        if (!doc) return null;
        const statusInfo = getDocStatusBadgeInfo(doc.status);
        return (
          <ServiceDocLink key={link.id} doc={doc} statusInfo={statusInfo} />
        );
      })}
    </div>
  );
}

function ServiceDocLink({ doc, statusInfo }: { doc: any; statusInfo: { label: string; className: string } }) {
  const signedUrl = useSignedUrl("documents-library", doc.current_file_url);

  return (
    <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-2 rounded-md">
      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">
          {doc.code && <span className="text-muted-foreground font-mono mr-1">{doc.code}</span>}
          {doc.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {doc.document_types && <Badge variant="outline" className="text-[9px] px-1 py-0">{doc.document_types.name}</Badge>}
          <Badge variant="outline" className={`text-[9px] px-1 py-0 ${statusInfo.className}`}>{statusInfo.label}</Badge>
          <span className="text-[10px] text-muted-foreground">{doc.current_revision}</span>
        </div>
      </div>
      {signedUrl && (
        <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
