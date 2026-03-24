import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { calculateCdfDeadline, calculateAlertDate, formatDateBR } from "@/lib/mtr";
import { format } from "date-fns";

export function useWasteCategories() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["waste-categories", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("waste_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useMtrs() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["mtrs", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("mtrs")
        .select("*, mtr_waste_items(*, waste_categories(id, name, color)), profiles:registered_by(full_name)")
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveMtr() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      id?: string;
      mtr_number: string;
      issued_at: string;
      transporter: string | null;
      notes: string | null;
      waste_items: { waste_category_id: string; quantity_tons: number | null }[];
      mtr_file?: File | null;
      existing_mtr_file_url?: string | null;
      existing_mtr_file_name?: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      const cdf_deadline_at = calculateCdfDeadline(values.issued_at);
      const alert_at = calculateAlertDate(values.issued_at);

      let mtr_file_url = values.existing_mtr_file_url || null;
      let mtr_file_name = values.existing_mtr_file_name || null;

      const payload: any = {
        company_id: company.id,
        mtr_number: values.mtr_number,
        issued_at: values.issued_at,
        cdf_deadline_at,
        alert_at,
        transporter: values.transporter || null,
        notes: values.notes || null,
        registered_by: profile.id,
        updated_at: new Date().toISOString(),
      };

      let mtrId: string;

      if (values.id) {
        // Don't update mtr_number on edit
        delete payload.mtr_number;
        payload.mtr_file_url = mtr_file_url;
        payload.mtr_file_name = mtr_file_name;
        const { error } = await supabase.from("mtrs").update(payload as any).eq("id", values.id);
        if (error) throw error;
        mtrId = values.id;

        // Replace waste items
        await supabase.from("mtr_waste_items").delete().eq("mtr_id", mtrId);
      } else {
        payload.mtr_file_url = mtr_file_url;
        payload.mtr_file_name = mtr_file_name;
        const { data, error } = await supabase.from("mtrs").insert(payload as any).select("id").single();
        if (error) throw error;
        mtrId = data.id;
      }

      // Upload MTR file if new
      if (values.mtr_file) {
        const ext = values.mtr_file.name.split(".").pop();
        const path = `${company.id}/${mtrId}/mtr/mtr_file.${ext}`;
        const { error: upErr } = await supabase.storage.from("mtr-files").upload(path, values.mtr_file, { upsert: true });
        if (upErr) throw upErr;
        mtr_file_url = path;
        mtr_file_name = values.mtr_file.name;
        await supabase.from("mtrs").update({ mtr_file_url, mtr_file_name }).eq("id", mtrId);
      }

      // Insert waste items
      if (values.waste_items.length > 0) {
        const items = values.waste_items.map((wi) => ({
          mtr_id: mtrId,
          company_id: company.id,
          waste_category_id: wi.waste_category_id,
          quantity_tons: wi.quantity_tons,
        }));
        const { error: wiErr } = await supabase.from("mtr_waste_items").insert(items);
        if (wiErr) throw wiErr;
      }

      return mtrId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mtrs"] });
      toast({ title: "MTR cadastrado com sucesso." });
    },
    onError: (err: any) => {
      const msg = err?.message?.includes("unique") || err?.message?.includes("duplicate")
        ? "Este número de MTR já está cadastrado."
        : "Erro ao salvar MTR.";
      toast({ title: msg, variant: "destructive" });
    },
  });
}

export function useRegisterCdf() {
  const queryClient = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      mtrId: string;
      cdf_number: string;
      cdf_received_at: string;
      cdf_notes: string | null;
      quantities: { item_id: string; quantity_tons: number }[];
      cdf_file: File;
    }) => {
      if (!company) throw new Error("Sem empresa");

      // Upload CDF file
      const ext = values.cdf_file.name.split(".").pop();
      const path = `${company.id}/${values.mtrId}/cdf/cdf_file.${ext}`;
      const { error: upErr } = await supabase.storage.from("mtr-files").upload(path, values.cdf_file, { upsert: true });
      if (upErr) throw upErr;
      // Update MTR
      const { error: mtrErr } = await supabase.from("mtrs").update({
        cdf_status: "received",
        cdf_number: values.cdf_number,
        cdf_received_at: values.cdf_received_at,
        cdf_file_url: path,
        cdf_file_name: values.cdf_file.name,
        cdf_notes: values.cdf_notes || null,
        updated_at: new Date().toISOString(),
      }).eq("id", values.mtrId);
      if (mtrErr) throw mtrErr;

      // Update quantities
      for (const q of values.quantities) {
        await supabase.from("mtr_waste_items").update({ quantity_tons: q.quantity_tons }).eq("id", q.item_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mtrs"] });
      toast({ title: "CDF registrado com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro ao registrar CDF.", variant: "destructive" });
    },
  });
}

export function useDeleteMtr() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (mtr: { id: string; company_id: string }) => {
      // Remove storage files
      const { data: files } = await supabase.storage.from("mtr-files").list(`${mtr.company_id}/${mtr.id}/mtr`);
      const { data: cdfFiles } = await supabase.storage.from("mtr-files").list(`${mtr.company_id}/${mtr.id}/cdf`);
      const allPaths = [
        ...(files || []).map((f) => `${mtr.company_id}/${mtr.id}/mtr/${f.name}`),
        ...(cdfFiles || []).map((f) => `${mtr.company_id}/${mtr.id}/cdf/${f.name}`),
      ];
      if (allPaths.length) await supabase.storage.from("mtr-files").remove(allPaths);

      // CASCADE handles mtr_waste_items
      const { error } = await supabase.from("mtrs").delete().eq("id", mtr.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mtrs"] });
      toast({ title: "MTR excluído." });
    },
    onError: () => {
      toast({ title: "Erro ao excluir MTR.", variant: "destructive" });
    },
  });
}
