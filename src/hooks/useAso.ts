import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { calculateExpiresAt } from "@/lib/aso";

// ─── Exam Types ───

export function useAsoExamTypes() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["aso-exam-types", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("aso_exam_types").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveAsoExamType() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: { id?: string; name: string; validity_months?: number | null }) => {
      if (!company) throw new Error("Sem empresa");
      const payload = {
        company_id: company.id,
        name: v.name,
        validity_months: v.validity_months ?? null,
      };
      if (v.id) {
        const { error } = await supabase.from("aso_exam_types").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("aso_exam_types").insert({ ...payload, is_default: false });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["aso-exam-types"] }); toast({ title: "Tipo de exame salvo" }); },
    onError: () => { toast({ title: "Erro ao salvar tipo de exame", variant: "destructive" }); },
  });
}

export function useDeleteAsoExamType() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { count } = await supabase.from("aso_records").select("id", { count: "exact", head: true }).eq("exam_type_id", id);
      if ((count ?? 0) > 0) throw new Error("HAS_RECORDS");
      const { error } = await supabase.from("aso_exam_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["aso-exam-types"] }); toast({ title: "Tipo de exame excluído" }); },
    onError: (e: Error) => {
      toast({ title: e.message === "HAS_RECORDS" ? "Este tipo possui registros vinculados." : "Erro ao excluir", variant: "destructive" });
    },
  });
}

// ─── ASO Records ───

export function useAsoRecords() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["aso-records", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("aso_records")
        .select("*, employees(id, name), aso_exam_types(id, name, validity_months), profiles:registered_by(full_name)")
        .order("exam_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveAsoRecord() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: {
      id?: string;
      employee_id: string;
      exam_type_id: string;
      exam_date: string;
      validity_months?: number | null;
      result: string;
      doctor_name?: string | null;
      crm?: string | null;
      file_url?: string | null;
      file_name?: string | null;
      notes?: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const expires_at = calculateExpiresAt(v.exam_date, v.validity_months);
      const payload = {
        company_id: company.id,
        employee_id: v.employee_id,
        exam_type_id: v.exam_type_id,
        exam_date: v.exam_date,
        expires_at,
        result: v.result,
        doctor_name: v.doctor_name || null,
        crm: v.crm || null,
        file_url: v.file_url || null,
        file_name: v.file_name || null,
        notes: v.notes || null,
        registered_by: profile.id,
      };
      if (v.id) {
        const { error } = await supabase.from("aso_records").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("aso_records").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["aso-records"] }); toast({ title: "ASO registrado" }); },
    onError: () => { toast({ title: "Erro ao registrar ASO", variant: "destructive" }); },
  });
}

export function useDeleteAsoRecord() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("aso_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["aso-records"] }); toast({ title: "ASO excluído" }); },
    onError: () => { toast({ title: "Erro ao excluir ASO", variant: "destructive" }); },
  });
}
