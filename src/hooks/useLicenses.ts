import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { storageUpload } from "@/lib/storage-utils";

export function useLicenseTypes() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["license-types", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("license_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useEnvironmentalLicenses() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["environmental-licenses", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("environmental_licenses")
        .select("*, license_types(id, name), profiles:registered_by(full_name)")
        .order("expires_at", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useLicenseRenewals(licenseId: string | null) {
  return useQuery({
    queryKey: ["license-renewals", licenseId],
    queryFn: async () => {
      if (!licenseId) return [];
      const { data, error } = await supabase
        .from("license_renewals")
        .select("*, profiles:registered_by(full_name)")
        .eq("license_id", licenseId)
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!licenseId,
  });
}

export function useSaveLicense() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      id?: string;
      license_number: string;
      title: string;
      license_type_id: string;
      issuing_body: string;
      sphere: string;
      issued_at: string;
      expires_at: string | null;
      has_expiry: boolean;
      alert_days_before: number;
      status: string;
      conditionants: string | null;
      notes: string | null;
      file?: File | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      const payload: any = {
        company_id: company.id,
        license_number: values.license_number,
        title: values.title,
        license_type_id: values.license_type_id,
        issuing_body: values.issuing_body,
        sphere: values.sphere,
        issued_at: values.issued_at,
        expires_at: values.has_expiry ? values.expires_at : null,
        has_expiry: values.has_expiry,
        alert_days_before: values.alert_days_before,
        status: values.status,
        conditionants: values.conditionants || null,
        notes: values.notes || null,
        registered_by: profile.id,
        updated_at: new Date().toISOString(),
      };

      let licenseId: string;

      if (values.id) {
        // Don't override file on edit
        const { error } = await supabase.from("environmental_licenses").update(payload).eq("id", values.id);
        if (error) throw error;
        licenseId = values.id;
      } else {
        const { data, error } = await supabase.from("environmental_licenses").insert(payload).select("id").single();
        if (error) throw error;
        licenseId = data.id;
      }

      // Upload file if provided
      if (values.file) {
        const ext = values.file.name.split(".").pop();
        const ts = Date.now();
        const path = `${company.id}/${licenseId}/${ts}/license.${ext}`;
        const { error: upErr } = await storageUpload("environmental-licenses", path, values.file, { upsert: true });
        if (upErr) throw upErr;
        await supabase.from("environmental_licenses").update({ file_url: path, file_name: values.file.name }).eq("id", licenseId);

        // Create initial renewal entry (emissão original)
        if (!values.id) {
          await supabase.from("license_renewals").insert({
            license_id: licenseId,
            company_id: company.id,
            license_number: values.license_number,
            issued_at: values.issued_at,
            expires_at: values.has_expiry ? values.expires_at : null,
            file_url: path,
            file_name: values.file.name,
            notes: "Emissão original",
            registered_by: profile.id,
          });
        }
      }

      return licenseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environmental-licenses"] });
      queryClient.invalidateQueries({ queryKey: ["license-renewals"] });
      toast({ title: "Licença salva com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro ao salvar licença.", variant: "destructive" });
    },
  });
}

export function useRegisterRenewal() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      licenseId: string;
      license_number: string;
      issued_at: string;
      expires_at: string | null;
      has_expiry: boolean;
      file: File;
      notes: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      // Upload file
      const ext = values.file.name.split(".").pop();
      const ts = Date.now();
      const path = `${company.id}/${values.licenseId}/${ts}/license.${ext}`;
      const { error: upErr } = await storageUpload("environmental-licenses", path, values.file, { upsert: true });
      if (upErr) throw upErr;

      // Insert renewal
      const { error: insErr } = await supabase.from("license_renewals").insert({
        license_id: values.licenseId,
        company_id: company.id,
        license_number: values.license_number,
        issued_at: values.issued_at,
        expires_at: values.has_expiry ? values.expires_at : null,
        file_url: path,
        file_name: values.file.name,
        notes: values.notes || null,
        registered_by: profile.id,
      });
      if (insErr) throw insErr;

      // Update license
      const { error: updErr } = await supabase.from("environmental_licenses").update({
        license_number: values.license_number,
        issued_at: values.issued_at,
        expires_at: values.has_expiry ? values.expires_at : null,
        file_url: path,
        file_name: values.file.name,
        status: "active",
        updated_at: new Date().toISOString(),
      }).eq("id", values.licenseId);
      if (updErr) throw updErr;

      return values.expires_at;
    },
    onSuccess: (expiresAt) => {
      queryClient.invalidateQueries({ queryKey: ["environmental-licenses"] });
      queryClient.invalidateQueries({ queryKey: ["license-renewals"] });
      const msg = expiresAt
        ? `Renovação registrada. Licença válida até ${expiresAt.split("-").reverse().join("/")}.`
        : "Renovação registrada.";
      toast({ title: msg });
    },
    onError: () => {
      toast({ title: "Erro ao registrar renovação.", variant: "destructive" });
    },
  });
}

export function useDeleteLicense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (license: { id: string; company_id: string }) => {
      // Remove storage files
      const { data: files } = await supabase.storage.from("environmental-licenses").list(`${license.company_id}/${license.id}`, { limit: 100 });
      // Files may be in subdirectories, need to enumerate
      const prefixPath = `${license.company_id}/${license.id}`;
      // Simple approach: list and remove what we find
      if (files?.length) {
        for (const folder of files) {
          if (folder.id === null) {
            // It's a folder, list inner
            const { data: inner } = await supabase.storage.from("environmental-licenses").list(`${prefixPath}/${folder.name}`);
            if (inner?.length) {
              const paths = inner.map(f => `${prefixPath}/${folder.name}/${f.name}`);
              await supabase.storage.from("environmental-licenses").remove(paths);
            }
          } else {
            await supabase.storage.from("environmental-licenses").remove([`${prefixPath}/${folder.name}`]);
          }
        }
      }

      // CASCADE handles license_renewals
      const { error } = await supabase.from("environmental_licenses").delete().eq("id", license.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environmental-licenses"] });
      toast({ title: "Licença excluída." });
    },
    onError: () => {
      toast({ title: "Erro ao excluir licença.", variant: "destructive" });
    },
  });
}
