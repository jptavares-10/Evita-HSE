import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getFrequencyDays, calculateNextDueAt } from "@/lib/services";
import { format } from "date-fns";

export function useServiceCategories() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["service-categories", company?.id],
    queryFn: async () => {
      if (!company) return [];
      // Seed defaults for existing companies (ignore errors)
      try {
        await supabase.rpc("seed_default_categories", { p_company_id: company.id });
      } catch (e) {
        console.warn("seed_default_categories failed:", e);
      }
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function usePeriodicServices() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["periodic-services", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("periodic_services")
        .select("*, service_categories(id, name, color)")
        .order("next_due_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!company,
  });
}

export function useServiceAttachments(serviceId: string | null) {
  return useQuery({
    queryKey: ["service-attachments", serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      const { data, error } = await supabase
        .from("service_attachments")
        .select("*")
        .eq("service_id", serviceId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });
}

export function useServiceHistory(serviceId: string | null) {
  return useQuery({
    queryKey: ["service-history", serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      const { data, error } = await supabase
        .from("service_history")
        .select("*, profiles:registered_by(full_name)")
        .eq("service_id", serviceId)
        .order("done_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });
}

export function useSaveService() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      id?: string;
      name: string;
      category_id: string;
      frequency_type: string;
      frequency_preset: string | null;
      frequency_days: number | null;
      last_done_at: string;
      alert_days_before: number;
      supplier: string | null;
      notes: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const freqDays = getFrequencyDays(values.frequency_type, values.frequency_preset, values.frequency_days);
      const nextDue = calculateNextDueAt(values.last_done_at, freqDays);
      const payload = {
        company_id: company.id,
        name: values.name,
        category_id: values.category_id,
        frequency_type: values.frequency_type,
        frequency_preset: values.frequency_preset,
        frequency_days: values.frequency_days,
        last_done_at: values.last_done_at,
        next_due_at: format(nextDue, "yyyy-MM-dd"),
        alert_days_before: values.alert_days_before,
        supplier: values.supplier || null,
        notes: values.notes || null,
        created_by: profile.id,
        updated_at: new Date().toISOString(),
      };

      if (values.id) {
        const { error } = await supabase.from("periodic_services").update(payload).eq("id", values.id);
        if (error) throw error;
        return values.id;
      } else {
        const { data, error } = await supabase.from("periodic_services").insert(payload).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodic-services"] });
      toast({ title: "Serviço salvo com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar serviço", variant: "destructive" });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      // Get attachments to delete from storage
      const { data: attachments } = await supabase
        .from("service_attachments")
        .select("file_url")
        .eq("service_id", serviceId);

      if (attachments?.length) {
        const paths = attachments.map((a) => {
          const url = new URL(a.file_url);
          const parts = url.pathname.split("/storage/v1/object/public/service-attachments/");
          return parts[1] || "";
        }).filter(Boolean);
        if (paths.length) {
          await supabase.storage.from("service-attachments").remove(paths);
        }
      }

      // Cascade will handle history and attachments rows
      const { error } = await supabase.from("periodic_services").delete().eq("id", serviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodic-services"] });
      toast({ title: "Serviço excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir serviço", variant: "destructive" });
    },
  });
}

export function useRegisterCompletion() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      serviceId: string;
      done_at: string;
      supplier: string | null;
      notes: string | null;
      frequency_type: string;
      frequency_preset: string | null;
      frequency_days: number | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const freqDays = getFrequencyDays(values.frequency_type, values.frequency_preset, values.frequency_days);
      const nextDue = calculateNextDueAt(values.done_at, freqDays);
      const nextDueStr = format(nextDue, "yyyy-MM-dd");

      // Insert history
      const { error: histErr } = await supabase.from("service_history").insert({
        service_id: values.serviceId,
        company_id: company.id,
        done_at: values.done_at,
        supplier: values.supplier || null,
        notes: values.notes || null,
        registered_by: profile.id,
      });
      if (histErr) throw histErr;

      // Update service
      const updatePayload: Record<string, unknown> = {
        last_done_at: values.done_at,
        next_due_at: nextDueStr,
        updated_at: new Date().toISOString(),
      };
      if (values.supplier) updatePayload.supplier = values.supplier;

      const { error: updErr } = await supabase.from("periodic_services").update(updatePayload).eq("id", values.serviceId);
      if (updErr) throw updErr;

      return nextDueStr;
    },
    onSuccess: (nextDueStr) => {
      queryClient.invalidateQueries({ queryKey: ["periodic-services"] });
      queryClient.invalidateQueries({ queryKey: ["service-history"] });
      const formatted = nextDueStr.split("-").reverse().join("/");
      toast({ title: `Realização registrada. Próxima data atualizada para ${formatted}` });
    },
    onError: () => {
      toast({ title: "Erro ao registrar realização", variant: "destructive" });
    },
  });
}
