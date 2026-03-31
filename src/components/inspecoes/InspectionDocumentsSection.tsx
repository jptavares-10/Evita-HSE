import { useState, useEffect, useMemo } from "react";
import { useDocuments, useInspectionDocumentLinksQuery } from "./useInspectionDocLinks";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, FileText, ExternalLink } from "lucide-react";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { getDocStatusBadgeInfo } from "@/lib/documents";

// This is a self-contained module that replicates ServiceDocumentsSection for inspections

interface InspectionDocumentsSectionProps {
  inspectionId: string | null;
  companyId: string | null;
  profileId: string | null;
}

export function InspectionDocumentsSection({ inspectionId, companyId, profileId }: InspectionDocumentsSectionProps) {
  const { data: allDocs = [] } = useAllDocs();
  const { data: existingLinks = [] } = useInspDocLinks(inspectionId);
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  useEffect(() => {
    if (!inspectionId || !companyId || !profileId) return;
    const sync = async () => {
      const existingDocIds = existingLinks.map((l: any) => l.document_id);
      const toAdd = selectedIds.filter((id) => !existingDocIds.includes(id));
      const toRemove = existingDocIds.filter((id: string) => !selectedIds.includes(id));

      for (const docId of toRemove) {
        await supabase.from("inspection_document_links").delete().eq("document_id", docId).eq("inspection_id", inspectionId);
      }
      for (const docId of toAdd) {
        await supabase.from("inspection_document_links").insert({
          document_id: docId,
          inspection_id: inspectionId,
          company_id: companyId,
          linked_by: profileId,
        });
      }
      if (toAdd.length || toRemove.length) {
        queryClient.invalidateQueries({ queryKey: ["inspection-document-links"] });
      }
    };
    const t = setTimeout(sync, 500);
    return () => clearTimeout(t);
  }, [selectedIds, inspectionId, companyId, profileId]);

  const selectedDocs = useMemo(() => {
    return selectedIds.map((id) => allDocs.find((d: any) => d.id === id)).filter(Boolean);
  }, [selectedIds, allDocs]);

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Documentos vinculados (Checklists / Formulários)</h3>
      <div className="space-y-2">
        <Select value="" onValueChange={handleAdd}>
          <SelectTrigger>
            <SelectValue placeholder="Vincular documento da biblioteca..." />
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

// Detail view for linked documents
interface InspectionDocumentsDetailProps {
  inspectionId: string | null;
}

export function InspectionDocumentsDetail({ inspectionId }: InspectionDocumentsDetailProps) {
  const { data: links = [] } = useInspDocLinks(inspectionId);

  if (links.length === 0) return null;

  return (
    <div className="space-y-2 border-t pt-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <FileText className="h-3.5 w-3.5" />Documentos vinculados
      </p>
      {links.map((link: any) => {
        const doc = link.documents;
        if (!doc) return null;
        const statusInfo = getDocStatusBadgeInfo(doc.status);
        return <InspDocLink key={link.id} doc={doc} statusInfo={statusInfo} />;
      })}
    </div>
  );
}

function InspDocLink({ doc, statusInfo }: { doc: any; statusInfo: { label: string; className: string } }) {
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

// Internal hooks (reuse useDocuments from global hook + inspection-specific links)
import { useQuery } from "@tanstack/react-query";

function useAllDocs() {
  return useQuery({
    queryKey: ["documents-for-inspection-links"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("id, title, code, status").order("title");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useInspDocLinks(inspectionId: string | null) {
  return useQuery({
    queryKey: ["inspection-document-links", inspectionId],
    queryFn: async () => {
      if (!inspectionId) return [];
      const { data, error } = await supabase
        .from("inspection_document_links")
        .select("*, documents(id, title, code, status, current_revision, current_file_url, document_types(name))")
        .eq("inspection_id", inspectionId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!inspectionId,
  });
}
