import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ── Categories ──

export function useSupplierCategories() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["supplier-categories", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("supplier_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useCreateSupplierCategory() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("supplier_categories")
        .insert({ company_id: company!.id, name });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-categories"] });
      toast({ title: "Categoria criada" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateSupplierCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("supplier_categories").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-categories"] });
      toast({ title: "Categoria atualizada" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteSupplierCategory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: linked } = await supabase.from("suppliers").select("id").eq("category_id", id).limit(1);
      if (linked && linked.length > 0) throw new Error("Existem fornecedores vinculados a esta categoria. Remova-os primeiro.");
      const { error } = await supabase.from("supplier_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-categories"] });
      toast({ title: "Categoria excluída" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

// ── Suppliers ──

export function useSuppliers() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["suppliers", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("suppliers")
        .select("*, supplier_categories(id, name)")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  const { company, user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("suppliers").insert({
        company_id: company!.id,
        name: values.name,
        category_id: values.category_id || null,
        contact_name: values.contact_name || null,
        contact_phone: values.contact_phone || null,
        contact_email: values.contact_email || null,
        notes: values.notes || null,
        portal_enabled: values.portal_enabled ?? true,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Fornecedor cadastrado com sucesso" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...values }: any) => {
      const { error } = await supabase.from("suppliers").update({
        name: values.name,
        category_id: values.category_id || null,
        contact_name: values.contact_name || null,
        contact_phone: values.contact_phone || null,
        contact_email: values.contact_email || null,
        notes: values.notes || null,
        status: values.status,
        portal_enabled: values.portal_enabled,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Fornecedor atualizado" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (supplier: any) => {
      // Delete storage files
      const { data: docs } = await supabase.from("supplier_documents").select("file_url").eq("supplier_id", supplier.id);
      if (docs && docs.length > 0) {
        const paths = docs.map((d: any) => {
          const url = d.file_url as string;
          const idx = url.indexOf("/supplier-documents/");
          return idx >= 0 ? url.substring(idx + "/supplier-documents/".length) : null;
        }).filter(Boolean) as string[];
        if (paths.length > 0) await supabase.storage.from("supplier-documents").remove(paths);
      }
      await supabase.from("supplier_documents").delete().eq("supplier_id", supplier.id);
      await supabase.from("supplier_folders").delete().eq("supplier_id", supplier.id);
      const { error } = await supabase.from("suppliers").delete().eq("id", supplier.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Fornecedor excluído" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useRegeneratePortalToken() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const newToken = crypto.randomUUID();
      const { error } = await supabase.from("suppliers").update({ portal_token: newToken }).eq("id", id);
      if (error) throw error;
      return newToken;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Novo link gerado com sucesso" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

// ── Folders ──

export function useSupplierFolders(supplierId: string | null) {
  return useQuery({
    queryKey: ["supplier-folders", supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      const { data, error } = await supabase
        .from("supplier_folders")
        .select("*")
        .eq("supplier_id", supplierId)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!supplierId,
  });
}

export function useCreateSupplierFolder() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: { supplier_id: string; name: string; parent_folder_id?: string | null }) => {
      const { error } = await supabase.from("supplier_folders").insert({
        supplier_id: values.supplier_id,
        company_id: company!.id,
        name: values.name,
        parent_folder_id: values.parent_folder_id || null,
        created_by_supplier: false,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["supplier-folders", vars.supplier_id] });
      toast({ title: "Pasta criada" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteSupplierFolder() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, supplier_id }: { id: string; supplier_id: string }) => {
      const { error } = await supabase.from("supplier_folders").delete().eq("id", id);
      if (error) throw error;
      return supplier_id;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["supplier-folders", vars.supplier_id] });
      qc.invalidateQueries({ queryKey: ["supplier-documents"] });
      toast({ title: "Pasta excluída" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

// ── Documents ──

export function useSupplierDocuments(supplierId: string | null) {
  return useQuery({
    queryKey: ["supplier-documents", supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      const { data, error } = await supabase
        .from("supplier_documents")
        .select("*")
        .eq("supplier_id", supplierId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!supplierId,
  });
}

export function useUploadSupplierDocument() {
  const qc = useQueryClient();
  const { company, user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: {
      supplier_id: string;
      folder_id?: string | null;
      description: string;
      reference_name?: string | null;
      file: File;
    }) => {
      const folderPath = values.folder_id || "root";
      const filePath = `${company!.id}/${values.supplier_id}/${folderPath}/${Date.now()}_${values.file.name}`;
      const { error: upErr } = await supabase.storage.from("supplier-documents").upload(filePath, values.file);
      if (upErr) throw upErr;
      const ext = values.file.name.split(".").pop()?.toLowerCase() || "";
      const { error } = await supabase.from("supplier_documents").insert({
        supplier_id: values.supplier_id,
        folder_id: values.folder_id || null,
        company_id: company!.id,
        description: values.description,
        reference_name: values.reference_name || null,
        file_url: filePath,
        file_name: values.file.name,
        file_type: ext,
        uploaded_by_supplier: false,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["supplier-documents", vars.supplier_id] });
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Documento enviado com sucesso" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteSupplierDocument() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (doc: any) => {
      const url = doc.file_url as string;
      const idx = url.indexOf("/supplier-documents/");
      if (idx >= 0) {
        const path = url.substring(idx + "/supplier-documents/".length);
        await supabase.storage.from("supplier-documents").remove([path]);
      }
      const { error } = await supabase.from("supplier_documents").delete().eq("id", doc.id);
      if (error) throw error;
      return doc.supplier_id;
    },
    onSuccess: (_d, doc) => {
      qc.invalidateQueries({ queryKey: ["supplier-documents", doc.supplier_id] });
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Documento excluído" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}
