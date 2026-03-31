import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ── Models ──

export function useInspectionModels() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["inspection-models", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("inspection_models")
        .select("*, sectors(id, name), profiles:default_responsible_id(id, full_name), documents:document_id(id, code, title, current_file_url, current_file_name)")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveInspectionModel() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      id?: string;
      name: string;
      related_nr?: string | null;
      sector_id?: string | null;
      frequency_type: string;
      frequency_days?: number | null;
      default_responsible_id?: string | null;
      document_id?: string | null;
      alert_hours_before?: number;
      status?: string;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const payload: any = {
        company_id: company.id,
        name: values.name,
        related_nr: values.related_nr || null,
        sector_id: values.sector_id || null,
        frequency_type: values.frequency_type,
        frequency_days: values.frequency_days ?? null,
        default_responsible_id: values.default_responsible_id || null,
        document_id: values.document_id || null,
        alert_hours_before: values.alert_hours_before ?? 24,
        status: values.status ?? "active",
        updated_at: new Date().toISOString(),
      };
      if (values.id) {
        const { error } = await supabase.from("inspection_models").update(payload).eq("id", values.id);
        if (error) throw error;
        return values.id;
      } else {
        payload.created_by = profile.id;
        const { data, error } = await supabase.from("inspection_models").insert(payload).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-models"] });
      toast({ title: "Modelo salvo com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro ao salvar modelo.", variant: "destructive" });
    },
  });
}

export function useDeleteInspectionModel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (modelId: string) => {
      // Check if has executions
      const { count } = await supabase
        .from("inspection_executions")
        .select("id", { count: "exact", head: true })
        .eq("model_id", modelId);
      if (count && count > 0) {
        throw new Error("HAS_EXECUTIONS");
      }
      const { error } = await supabase.from("inspection_models").delete().eq("id", modelId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-models"] });
      toast({ title: "Modelo excluído." });
    },
    onError: (err: any) => {
      if (err.message === "HAS_EXECUTIONS") {
        toast({ title: "Existem execuções vinculadas a este modelo. Desative o modelo em vez de excluir.", variant: "destructive" });
      } else {
        toast({ title: "Erro ao excluir modelo.", variant: "destructive" });
      }
    },
  });
}

// ── Executions ──

export function useInspectionExecutions() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["inspection-executions", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("inspection_executions")
        .select("*, inspection_models(id, name, related_nr, sector_id, frequency_type, frequency_days, default_responsible_id, document_id, sectors(id, name), profiles:default_responsible_id(id, full_name), documents:document_id(id, code, title, current_file_url, current_file_name))")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useInspectionExecution(executionId: string | null) {
  return useQuery({
    queryKey: ["inspection-execution", executionId],
    queryFn: async () => {
      if (!executionId) return null;
      const { data, error } = await supabase
        .from("inspection_executions")
        .select("*, inspection_models(id, name, related_nr, sector_id, frequency_type, frequency_days, default_responsible_id, document_id, sectors(id, name), profiles:default_responsible_id(id, full_name), documents:document_id(id, code, title, current_file_url, current_file_name)), completed_profile:completed_by(full_name)")
        .eq("id", executionId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!executionId,
  });
}

export function useCreateExecution() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: { model_id: string; model_name: string; due_date: string }) => {
      if (!company) throw new Error("Sem empresa");
      const ref = `${values.model_name} — ${format(new Date(values.due_date + "T12:00:00"), "dd/MM/yyyy")}`;
      const { data, error } = await supabase
        .from("inspection_executions")
        .insert({
          company_id: company.id,
          model_id: values.model_id,
          reference: ref,
          due_date: values.due_date,
          status: "pending",
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-executions"] });
      toast({ title: "Execução criada." });
    },
    onError: () => {
      toast({ title: "Erro ao criar execução.", variant: "destructive" });
    },
  });
}

export function useCompleteExecution() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ executionId, hasOpenActions }: { executionId: string; hasOpenActions: boolean }) => {
      if (!profile) throw new Error("Sem usuário");
      const newStatus = hasOpenActions ? "completed_with_issues" : "completed";
      const { error } = await supabase
        .from("inspection_executions")
        .update({ status: newStatus, completed_at: new Date().toISOString(), completed_by: profile.id })
        .eq("id", executionId);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (status) => {
      qc.invalidateQueries({ queryKey: ["inspection-executions"] });
      qc.invalidateQueries({ queryKey: ["inspection-execution"] });
      const label = status === "completed" ? "Execução concluída." : "Execução concluída com pendências.";
      toast({ title: label });
    },
    onError: () => {
      toast({ title: "Erro ao concluir execução.", variant: "destructive" });
    },
  });
}

// ── Entries ──

export function useInspectionEntries(executionId: string | null) {
  return useQuery({
    queryKey: ["inspection-entries", executionId],
    queryFn: async () => {
      if (!executionId) return [];
      const { data, error } = await supabase
        .from("inspection_entries")
        .select("*, profiles:registered_by(full_name)")
        .eq("execution_id", executionId)
        .order("executed_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!executionId,
  });
}

export function useAddEntry() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      execution_id: string;
      employee_id: string | null;
      employee_name: string;
      executed_at: string;
      file: File;
      notes: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const entryId = crypto.randomUUID();
      const ext = values.file.name.split(".").pop();
      const path = `${company.id}/${values.execution_id}/entries/${entryId}/file.${ext}`;
      const { error: upErr } = await supabase.storage.from("inspection-files").upload(path, values.file, { upsert: true });
      if (upErr) throw upErr;

      const { error } = await supabase.from("inspection_entries").insert({
        id: entryId,
        execution_id: values.execution_id,
        company_id: company.id,
        employee_id: values.employee_id || null,
        employee_name: values.employee_name,
        executed_at: values.executed_at,
        file_url: path,
        file_name: values.file.name,
        notes: values.notes || null,
        registered_by: profile.id,
      });
      if (error) throw error;

      // Auto-set execution to in_progress if pending
      await supabase
        .from("inspection_executions")
        .update({ status: "in_progress" })
        .eq("id", values.execution_id)
        .eq("status", "pending");

      return entryId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-entries"] });
      qc.invalidateQueries({ queryKey: ["inspection-executions"] });
      qc.invalidateQueries({ queryKey: ["inspection-execution"] });
      toast({ title: "Registro adicionado com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar registro.", variant: "destructive" });
    },
  });
}

// ── Corrective Actions ──

export function useInspectionActions(executionId: string | null) {
  return useQuery({
    queryKey: ["inspection-corrective-actions", executionId],
    queryFn: async () => {
      if (!executionId) return [];
      const { data, error } = await supabase
        .from("inspection_corrective_actions")
        .select("*, profiles:created_by(full_name), completed_profile:completed_by(full_name)")
        .eq("execution_id", executionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!executionId,
  });
}

export function useAddAction() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      execution_id: string;
      description: string;
      responsible_employee_id?: string | null;
      responsible_name?: string | null;
      due_date: string;
      priority: string;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const { error } = await supabase.from("inspection_corrective_actions").insert({
        execution_id: values.execution_id,
        company_id: company.id,
        description: values.description,
        responsible_employee_id: values.responsible_employee_id || null,
        responsible_name: values.responsible_name || null,
        due_date: values.due_date,
        priority: values.priority,
        created_by: profile.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-corrective-actions"] });
      toast({ title: "Ação corretiva adicionada." });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar ação corretiva.", variant: "destructive" });
    },
  });
}

export function useCompleteAction() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      actionId: string;
      execution_id: string;
      file: File;
      completion_notes: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const ext = values.file.name.split(".").pop();
      const path = `${company.id}/${values.execution_id}/actions/${values.actionId}/evidence.${ext}`;
      const { error: upErr } = await supabase.storage.from("inspection-files").upload(path, values.file, { upsert: true });
      if (upErr) throw upErr;

      const { error } = await supabase
        .from("inspection_corrective_actions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          completed_by: profile.id,
          evidence_url: path,
          evidence_name: values.file.name,
          completion_notes: values.completion_notes || null,
        })
        .eq("id", values.actionId);
      if (error) throw error;

      // Check if all actions completed — auto-upgrade execution status
      const { data: remaining } = await supabase
        .from("inspection_corrective_actions")
        .select("id")
        .eq("execution_id", values.execution_id)
        .neq("status", "completed");

      if (!remaining || remaining.length === 0) {
        // All done — if execution is completed_with_issues, upgrade to completed
        await supabase
          .from("inspection_executions")
          .update({ status: "completed" })
          .eq("id", values.execution_id)
          .eq("status", "completed_with_issues");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-corrective-actions"] });
      qc.invalidateQueries({ queryKey: ["inspection-executions"] });
      qc.invalidateQueries({ queryKey: ["inspection-execution"] });
      toast({ title: "Ação concluída com evidência registrada." });
    },
    onError: () => {
      toast({ title: "Erro ao concluir ação.", variant: "destructive" });
    },
  });
}

export function useUpdateActionStatus() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ actionId, status }: { actionId: string; status: string }) => {
      const { error } = await supabase
        .from("inspection_corrective_actions")
        .update({ status })
        .eq("id", actionId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-corrective-actions"] });
      toast({ title: "Status atualizado." });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar status.", variant: "destructive" });
    },
  });
}

export function useDeleteAction() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase.from("inspection_corrective_actions").delete().eq("id", actionId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-corrective-actions"] });
      toast({ title: "Ação excluída." });
    },
    onError: () => {
      toast({ title: "Erro ao excluir ação.", variant: "destructive" });
    },
  });
}

// ── All executions count for badge ──
export function useInspectionBadgeCount() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["inspection-badge", company?.id],
    queryFn: async () => {
      if (!company) return 0;
      const { data, error } = await supabase
        .from("inspection_executions")
        .select("id, status, due_date")
        .in("status", ["pending", "in_progress"]);
      if (error) return 0;
      // Count pending (including overdue) + in_progress
      return data?.length ?? 0;
    },
    enabled: !!company,
  });
}
