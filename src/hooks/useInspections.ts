import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getInspectionFrequencyDays, calculateInspectionNextDue } from "@/lib/inspections";
import { format } from "date-fns";

// ── Inspections CRUD ──

export function useInspections() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["inspections", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("inspections")
        .select("*")
        .order("next_due_at", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveInspection() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      id?: string;
      name: string;
      description?: string | null;
      location?: string | null;
      frequency_type: string;
      frequency_preset: string | null;
      frequency_days: number | null;
      alert_days_before: number;
      is_periodic: boolean;
      responsible?: string | null;
      notes?: string | null;
      last_done_at?: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      let nextDueAt: string | null = null;
      if (values.is_periodic && values.last_done_at) {
        const freqDays = getInspectionFrequencyDays(values.frequency_type, values.frequency_preset, values.frequency_days);
        const nd = calculateInspectionNextDue(values.last_done_at, freqDays);
        nextDueAt = format(nd, "yyyy-MM-dd");
      } else if (values.is_periodic && !values.last_done_at) {
        // First inspection - due today
        nextDueAt = format(new Date(), "yyyy-MM-dd");
      }

      const payload: Record<string, unknown> = {
        company_id: company.id,
        name: values.name,
        description: values.description || null,
        location: values.location || null,
        frequency_type: values.frequency_type,
        frequency_preset: values.frequency_preset,
        frequency_days: values.frequency_days,
        alert_days_before: values.alert_days_before,
        is_periodic: values.is_periodic,
        responsible: values.responsible || null,
        notes: values.notes || null,
        last_done_at: values.last_done_at || null,
        next_due_at: nextDueAt,
        updated_at: new Date().toISOString(),
      };

      if (values.id) {
        const { error } = await supabase.from("inspections").update(payload as any).eq("id", values.id);
        if (error) throw error;
        return values.id;
      } else {
        payload.created_by = profile.id;
        const { data, error } = await supabase.from("inspections").insert(payload as any).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast({ title: "Inspeção salva com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar inspeção", variant: "destructive" });
    },
  });
}

export function useDeleteInspection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inspections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast({ title: "Inspeção excluída com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir inspeção", variant: "destructive" });
    },
  });
}

// ── Executions ──

export function useInspectionExecutions(inspectionId: string | null) {
  return useQuery({
    queryKey: ["inspection-executions", inspectionId],
    queryFn: async () => {
      if (!inspectionId) return [];
      const { data, error } = await supabase
        .from("inspection_executions")
        .select("*, profiles:executed_by(full_name)")
        .eq("inspection_id", inspectionId)
        .order("executed_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!inspectionId,
  });
}

export function useRegisterExecution() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      inspection_id: string;
      executed_at: string;
      result: string;
      observations?: string | null;
      // For recalculating next_due
      is_periodic: boolean;
      frequency_type: string;
      frequency_preset: string | null;
      frequency_days: number | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      // Insert execution
      const { data: exec, error: execErr } = await supabase.from("inspection_executions").insert({
        company_id: company.id,
        inspection_id: values.inspection_id,
        executed_at: values.executed_at,
        result: values.result,
        observations: values.observations || null,
        executed_by: profile.id,
      }).select("id").single();
      if (execErr) throw execErr;

      // Update inspection
      const updatePayload: Record<string, unknown> = {
        last_done_at: values.executed_at,
        updated_at: new Date().toISOString(),
      };

      if (values.is_periodic) {
        const freqDays = getInspectionFrequencyDays(values.frequency_type, values.frequency_preset, values.frequency_days);
        const nd = calculateInspectionNextDue(values.executed_at, freqDays);
        updatePayload.next_due_at = format(nd, "yyyy-MM-dd");
      }

      const { error: updErr } = await supabase.from("inspections").update(updatePayload).eq("id", values.inspection_id);
      if (updErr) throw updErr;

      return exec.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      queryClient.invalidateQueries({ queryKey: ["inspection-executions"] });
      toast({ title: "Execução registrada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao registrar execução", variant: "destructive" });
    },
  });
}

// ── Actions ──

export function useInspectionActions(inspectionId: string | null) {
  return useQuery({
    queryKey: ["inspection-actions", inspectionId],
    queryFn: async () => {
      if (!inspectionId) return [];
      const { data, error } = await supabase
        .from("inspection_actions")
        .select("*, profiles:created_by(full_name), completer:completed_by(full_name)")
        .eq("inspection_id", inspectionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!inspectionId,
  });
}

export function useAllInspectionActions() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["all-inspection-actions", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("inspection_actions")
        .select("*")
        .in("status", ["pending", "in_progress"]);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveInspectionAction() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      id?: string;
      inspection_id: string;
      execution_id?: string | null;
      description: string;
      responsible?: string | null;
      due_date?: string | null;
      status?: string;
      completion_notes?: string | null;
      evidence_url?: string | null;
      evidence_name?: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      if (values.id) {
        const payload: Record<string, unknown> = {
          description: values.description,
          responsible: values.responsible || null,
          due_date: values.due_date || null,
          status: values.status || "pending",
        };
        if (values.status === "done") {
          payload.completed_at = new Date().toISOString();
          payload.completed_by = profile.id;
          payload.completion_notes = values.completion_notes || null;
          payload.evidence_url = values.evidence_url || null;
          payload.evidence_name = values.evidence_name || null;
        }
        const { error } = await supabase.from("inspection_actions").update(payload).eq("id", values.id);
        if (error) throw error;
        return values.id;
      } else {
        const { data, error } = await supabase.from("inspection_actions").insert({
          company_id: company.id,
          inspection_id: values.inspection_id,
          execution_id: values.execution_id || null,
          description: values.description,
          responsible: values.responsible || null,
          due_date: values.due_date || null,
          status: values.status || "pending",
          created_by: profile.id,
        }).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection-actions"] });
      queryClient.invalidateQueries({ queryKey: ["all-inspection-actions"] });
      toast({ title: "Ação salva com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar ação", variant: "destructive" });
    },
  });
}

// ── Document Links ──

export function useInspectionDocumentLinks(inspectionId: string | null) {
  return useQuery({
    queryKey: ["inspection-document-links", inspectionId],
    queryFn: async () => {
      if (!inspectionId) return [];
      const { data, error } = await supabase
        .from("inspection_document_links")
        .select("*, documents(id, title, code, status, current_revision, current_file_url, document_types(name))")
        .eq("inspection_id", inspectionId)
        .order("linked_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!inspectionId,
  });
}

// ── Attachments ──

export function useInspectionAttachments(executionId: string | null) {
  return useQuery({
    queryKey: ["inspection-attachments", executionId],
    queryFn: async () => {
      if (!executionId) return [];
      const { data, error } = await supabase
        .from("inspection_attachments")
        .select("*")
        .eq("execution_id", executionId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!executionId,
  });
}
