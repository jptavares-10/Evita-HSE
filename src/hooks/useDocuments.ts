import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useDocumentTypes() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["document-types", company?.id],
    queryFn: async () => {
      if (!company) return [];
      try {
        await supabase.rpc("seed_default_document_types", { p_company_id: company.id });
      } catch (e) {
        console.warn("seed_default_document_types failed:", e);
      }
      const { data, error } = await supabase
        .from("document_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useDocuments() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["documents", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("documents")
        .select("*, document_types(id, name), profiles:created_by(full_name)")
        .order("title");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useDocumentRevisions(documentId: string | null) {
  return useQuery({
    queryKey: ["document-revisions", documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const { data, error } = await supabase
        .from("document_revisions")
        .select("*, profiles:uploaded_by(full_name)")
        .eq("document_id", documentId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!documentId,
  });
}

export function useDocumentServiceLinks(documentId: string | null) {
  return useQuery({
    queryKey: ["document-service-links", documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const { data, error } = await supabase
        .from("document_service_links")
        .select("*, periodic_services(id, name)")
        .eq("document_id", documentId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!documentId,
  });
}

export function useServiceDocumentLinks(serviceId: string | null) {
  return useQuery({
    queryKey: ["service-document-links", serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      const { data, error } = await supabase
        .from("document_service_links")
        .select("*, documents(id, code, title, status, current_revision, current_file_url, current_file_name, document_types(id, name))")
        .eq("service_id", serviceId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!serviceId,
  });
}

export function useSaveDocument() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      id?: string;
      code: string | null;
      title: string;
      document_type_id: string;
      description: string | null;
      responsible: string | null;
      area: string | null;
      status: string;
      revision_number: string;
      revision_date: string;
      revision_notes: string | null;
      file?: File | null;
      has_revision_cycle?: boolean;
      revision_frequency_days?: number | null;
      next_revision_at?: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      const isNew = !values.id;

      const payload: any = {
        company_id: company.id,
        code: values.code || null,
        title: values.title,
        document_type_id: values.document_type_id,
        description: values.description || null,
        responsible: values.responsible || null,
        area: values.area || null,
        status: values.status,
        updated_at: new Date().toISOString(),
        has_revision_cycle: values.has_revision_cycle ?? false,
        revision_frequency_days: values.revision_frequency_days ?? null,
        next_revision_at: values.next_revision_at ?? null,
      };

      if (isNew) {
        payload.current_revision = values.revision_number;
        payload.current_revision_date = values.revision_date;
        payload.created_by = profile.id;
      }

      let docId: string;

      if (values.id) {
        const { error } = await supabase.from("documents").update(payload).eq("id", values.id);
        if (error) throw error;
        docId = values.id;
      } else {
        const { data, error } = await supabase.from("documents").insert(payload).select("id").single();
        if (error) throw error;
        docId = data.id;
      }

      // Upload file for new document
      if (isNew && values.file) {
        const ext = values.file.name.split(".").pop();
        const ts = Date.now();
        const path = `${company.id}/${docId}/${ts}/doc.${ext}`;
        const { error: upErr } = await supabase.storage.from("documents-library").upload(path, values.file, { upsert: true });
        if (upErr) throw upErr;

        await supabase.from("documents").update({
          current_file_url: path,
          current_file_name: values.file.name,
        }).eq("id", docId);

        // Create first revision entry
        await supabase.from("document_revisions").insert({
          document_id: docId,
          company_id: company.id,
          revision_number: values.revision_number,
          revision_date: values.revision_date,
          file_url: path,
          file_name: values.file.name,
          notes: values.revision_notes || "Versão inicial",
          uploaded_by: profile.id,
        });
      }

      return docId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-revisions"] });
      toast({ title: "Documento salvo com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro ao salvar documento.", variant: "destructive" });
    },
  });
}

export function useNewRevision() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      documentId: string;
      revision_number: string;
      revision_date: string;
      file: File;
      notes: string | null;
      revision_frequency_days?: number | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      const ext = values.file.name.split(".").pop();
      const ts = Date.now();
      const path = `${company.id}/${values.documentId}/${ts}/doc.${ext}`;
      const { error: upErr } = await supabase.storage.from("documents-library").upload(path, values.file, { upsert: true });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("document_revisions").insert({
        document_id: values.documentId,
        company_id: company.id,
        revision_number: values.revision_number,
        revision_date: values.revision_date,
        file_url: path,
        file_name: values.file.name,
        notes: values.notes || null,
        uploaded_by: profile.id,
      });
      if (insErr) throw insErr;

      // Recalculate next_revision_at if document has a cycle
      const updatePayload: any = {
        current_revision: values.revision_number,
        current_revision_date: values.revision_date,
        current_file_url: path,
        current_file_name: values.file.name,
        updated_at: new Date().toISOString(),
      };

      if (values.revision_frequency_days) {
        const nextDate = new Date(values.revision_date);
        nextDate.setDate(nextDate.getDate() + values.revision_frequency_days);
        updatePayload.next_revision_at = nextDate.toISOString().split("T")[0];
      }

      const { error: updErr } = await supabase.from("documents").update(updatePayload).eq("id", values.documentId);
      if (updErr) throw updErr;

      return values.revision_number;
    },
    onSuccess: (revNum) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-revisions"] });
      toast({ title: `Revisão ${revNum} publicada com sucesso.` });
    },
    onError: () => {
      toast({ title: "Erro ao publicar revisão.", variant: "destructive" });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (doc: { id: string; company_id: string }) => {
      const prefixPath = `${doc.company_id}/${doc.id}`;
      const { data: files } = await supabase.storage.from("documents-library").list(prefixPath, { limit: 100 });
      if (files?.length) {
        for (const folder of files) {
          if (folder.id === null) {
            const { data: inner } = await supabase.storage.from("documents-library").list(`${prefixPath}/${folder.name}`);
            if (inner?.length) {
              const paths = inner.map(f => `${prefixPath}/${folder.name}/${f.name}`);
              await supabase.storage.from("documents-library").remove(paths);
            }
          } else {
            await supabase.storage.from("documents-library").remove([`${prefixPath}/${folder.name}`]);
          }
        }
      }

      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Documento excluído." });
    },
    onError: () => {
      toast({ title: "Erro ao excluir documento.", variant: "destructive" });
    },
  });
}
