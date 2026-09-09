import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { storageUpload } from "@/lib/storage-utils";

export function useOccurrences() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["occurrences", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("occurrences")
        .select("*, profiles:registered_by(full_name)")
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useOccurrenceEmployees(occurrenceId: string | null) {
  return useQuery({
    queryKey: ["occurrence-employees", occurrenceId],
    queryFn: async () => {
      if (!occurrenceId) return [];
      const { data, error } = await supabase
        .from("occurrence_employees")
        .select("*")
        .eq("occurrence_id", occurrenceId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!occurrenceId,
  });
}

export function useOccurrenceAttachments(occurrenceId: string | null) {
  return useQuery({
    queryKey: ["occurrence-attachments", occurrenceId],
    queryFn: async () => {
      if (!occurrenceId) return [];
      const { data, error } = await supabase
        .from("occurrence_attachments")
        .select("*, profiles:uploaded_by(full_name)")
        .eq("occurrence_id", occurrenceId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!occurrenceId,
  });
}

const ACTION_SELECT =
  "*, creator:created_by(full_name), completer:completed_by(full_name), responsible:responsible_profile_id(id, full_name), verifier:verified_by(full_name)";

export function useCorrectiveActions(occurrenceId: string | null) {
  return useQuery({
    queryKey: ["corrective-actions", occurrenceId],
    queryFn: async () => {
      if (!occurrenceId) return [];
      const { data, error } = await supabase
        .from("corrective_actions")
        .select(ACTION_SELECT)
        .eq("occurrence_id", occurrenceId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!occurrenceId,
  });
}

export function useAllCorrectiveActions() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["all-corrective-actions", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("corrective_actions")
        .select(
          "*, responsible:responsible_profile_id(id, full_name), occurrence:occurrence_id(id, type, severity, location, description, status)",
        )
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useActionAttachments(actionId: string | null) {
  return useQuery({
    queryKey: ["corrective-action-attachments", actionId],
    queryFn: async () => {
      if (!actionId) return [];
      const { data, error } = await supabase
        .from("corrective_action_attachments")
        .select("*")
        .eq("action_id", actionId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!actionId,
  });
}


export function useSaveOccurrence() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      id?: string;
      type: string;
      severity: string;
      occurred_at: string;
      location: string;
      description: string;
      cause_analysis?: string | null;
      body_part_affected?: string | null;
      with_leave?: boolean | null;
      lost_days?: number;
      status?: string;
      employees: { employee_id?: string | null; employee_name: string }[];
      attachmentFiles?: File[];
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      const payload: any = {
        company_id: company.id,
        type: values.type,
        severity: values.severity,
        occurred_at: values.occurred_at,
        location: values.location,
        description: values.description,
        cause_analysis: values.cause_analysis || null,
        body_part_affected: values.type === "incident" ? (values.body_part_affected || null) : null,
        with_leave: values.type === "incident" ? (values.with_leave ?? null) : null,
        lost_days: (values.type === "incident" && values.with_leave) ? (values.lost_days ?? 0) : 0,
        registered_by: profile.id,
        updated_at: new Date().toISOString(),
      };

      let occurrenceId: string;

      if (values.id) {
        const { error } = await supabase.from("occurrences").update(payload).eq("id", values.id);
        if (error) throw error;
        occurrenceId = values.id;

        // Replace employees
        await supabase.from("occurrence_employees").delete().eq("occurrence_id", occurrenceId);
      } else {
        payload.status = "open";
        const { data, error } = await supabase.from("occurrences").insert(payload).select("id").single();
        if (error) throw error;
        occurrenceId = data.id;
      }

      // Insert employees
      if (values.employees.length > 0) {
        const empRows = values.employees.map((e) => ({
          occurrence_id: occurrenceId,
          company_id: company.id,
          employee_id: e.employee_id || null,
          employee_name: e.employee_name,
        }));
        const { error: empErr } = await supabase.from("occurrence_employees").insert(empRows);
        if (empErr) throw empErr;
      }

      // Upload attachments
      if (values.attachmentFiles?.length) {
        for (const file of values.attachmentFiles) {
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
          const path = `${company.id}/${occurrenceId}/${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await storageUpload("occurrence-files", path, file);
          if (upErr) throw upErr;
          const fileType = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? "image" : "document";
          await supabase.from("occurrence_attachments").insert({
            occurrence_id: occurrenceId,
            company_id: company.id,
            file_url: path,
            file_name: file.name,
            file_type: fileType,
            uploaded_by: profile.id,
          });
        }
      }

      return occurrenceId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["occurrences"] });
      queryClient.invalidateQueries({ queryKey: ["occurrence-employees"] });
      queryClient.invalidateQueries({ queryKey: ["occurrence-attachments"] });
      toast({ title: variables.id ? "Ocorrência atualizada." : "Ocorrência registrada." });
    },
    onError: () => {
      toast({ title: "Erro ao salvar ocorrência", variant: "destructive" });
    },
  });
}

export function useDeleteOccurrence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (occurrence: { id: string; status: string }) => {
      if (occurrence.status === "closed") {
        throw new Error("Ocorrências encerradas não podem ser excluídas. Entre em contato com o suporte.");
      }
      // Delete storage files
      const { data: attachments } = await supabase
        .from("occurrence_attachments")
        .select("file_url")
        .eq("occurrence_id", occurrence.id);
      if (attachments?.length) {
        const paths = attachments.map((a) => {
          try {
            const url = new URL(a.file_url);
            const parts = url.pathname.split("/storage/v1/object/public/occurrence-files/");
            return parts[1] || "";
          } catch { return ""; }
        }).filter(Boolean);
        if (paths.length) await supabase.storage.from("occurrence-files").remove(paths);
      }
      // Also delete corrective action evidence
      const { data: actions } = await supabase
        .from("corrective_actions")
        .select("evidence_url")
        .eq("occurrence_id", occurrence.id);
      if (actions?.length) {
        const paths = actions.filter(a => a.evidence_url).map((a) => {
          try {
            const url = new URL(a.evidence_url!);
            const parts = url.pathname.split("/storage/v1/object/public/occurrence-files/");
            return parts[1] || "";
          } catch { return ""; }
        }).filter(Boolean);
        if (paths.length) await supabase.storage.from("occurrence-files").remove(paths);
      }

      const { error } = await supabase.from("occurrences").delete().eq("id", occurrence.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["occurrences"] });
      queryClient.invalidateQueries({ queryKey: ["all-corrective-actions"] });
      toast({ title: "Ocorrência excluída." });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Erro ao excluir ocorrência", variant: "destructive" });
    },
  });
}

export function useCloseOccurrence() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: string | { occurrenceId: string; closure_notes?: string | null }) => {
      const occurrenceId = typeof input === "string" ? input : input.occurrenceId;
      const notes = typeof input === "string" ? null : input.closure_notes ?? null;
      const { error } = await supabase
        .from("occurrences")
        .update({
          status: "closed",
          closure_notes: notes,
          closed_at: new Date().toISOString(),
          closed_by: profile?.id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", occurrenceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["occurrences"] });
      toast({ title: "Ocorrência encerrada." });
    },
    onError: () => {
      toast({ title: "Erro ao encerrar ocorrência", variant: "destructive" });
    },
  });
}

export function useReopenOccurrence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (occurrenceId: string) => {
      const { error } = await supabase
        .from("occurrences")
        .update({ status: "in_progress", closed_at: null, closed_by: null, updated_at: new Date().toISOString() })
        .eq("id", occurrenceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["occurrences"] });
      toast({ title: "Ocorrência reaberta." });
    },
    onError: () => toast({ title: "Erro ao reabrir ocorrência", variant: "destructive" }),
  });
}

export interface ActionFormValues {
  id?: string;
  occurrence_id: string;
  description: string;
  responsible_profile_id: string | null;
  due_date: string | null;
  priority: string;
  cause_id: string | null;
  control_hierarchy: string | null;
  where_location?: string | null;
  how_method?: string | null;
  cost_estimated?: number | null;
}

/** Cria ou atualiza uma ação corretiva já com todos os campos 5W2H. */
export function useSaveCorrectiveAction() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: ActionFormValues) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const payload = {
        occurrence_id: values.occurrence_id,
        description: values.description,
        responsible_profile_id: values.responsible_profile_id,
        due_date: values.due_date,
        priority: values.priority,
        cause_id: values.cause_id,
        control_hierarchy: values.control_hierarchy,
        where_location: values.where_location ?? null,
        how_method: values.how_method ?? null,
        cost_estimated: values.cost_estimated ?? null,
      };

      if (values.id) {
        const { error } = await supabase.from("corrective_actions").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("corrective_actions")
          .insert({ ...payload, company_id: company.id, created_by: profile.id, status: "pending" });
        if (error) throw error;
        await supabase
          .from("occurrences")
          .update({ status: "in_progress", updated_at: new Date().toISOString() })
          .eq("id", values.occurrence_id)
          .neq("status", "closed");
      }
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ["corrective-actions"] });
      queryClient.invalidateQueries({ queryKey: ["all-corrective-actions"] });
      queryClient.invalidateQueries({ queryKey: ["occurrences"] });
      toast({ title: v.id ? "Ação atualizada." : "Ação criada." });
    },
    onError: (err: any) => {
      toast({ title: err?.message || "Erro ao salvar ação", variant: "destructive" });
    },
  });
}

export function useStartAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from("corrective_actions")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("id", actionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corrective-actions"] });
      queryClient.invalidateQueries({ queryKey: ["all-corrective-actions"] });
      toast({ title: "Ação iniciada." });
    },
    onError: () => toast({ title: "Erro ao iniciar ação", variant: "destructive" }),
  });
}

/** Conclui a ação com observação obrigatória e vários arquivos de evidência. */
export function useCompleteAction() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      actionId: string;
      occurrenceId: string;
      completion_notes: string;
      files?: File[];
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      if (!values.completion_notes.trim()) throw new Error("Descreva o que foi feito para concluir a ação.");

      const { error } = await supabase
        .from("corrective_actions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          completed_by: profile.id,
          completion_notes: values.completion_notes.trim(),
        })
        .eq("id", values.actionId);
      if (error) throw error;

      for (const file of values.files ?? []) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
        const path = `${company.id}/${values.occurrenceId}/actions/${values.actionId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await storageUpload("occurrence-files", path, file);
        if (upErr) throw upErr;
        const fileType = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? "image" : "document";
        const { error: insErr } = await supabase.from("corrective_action_attachments").insert({
          company_id: company.id,
          action_id: values.actionId,
          file_url: path,
          file_name: file.name,
          file_type: fileType,
          uploaded_by: profile.id,
        });
        if (insErr) throw insErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corrective-actions"] });
      queryClient.invalidateQueries({ queryKey: ["all-corrective-actions"] });
      queryClient.invalidateQueries({ queryKey: ["corrective-action-attachments"] });
      toast({ title: "Ação concluída." });
    },
    onError: (err: any) => toast({ title: err?.message || "Erro ao concluir ação", variant: "destructive" }),
  });
}


export function useDeleteCorrectiveAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: { actionId: string; occurrenceId: string }) => {
      const { error } = await supabase.from("corrective_actions").delete().eq("id", values.actionId);
      if (error) throw error;

      // Recalculate occurrence status
      const { data: remaining } = await supabase
        .from("corrective_actions")
        .select("status")
        .eq("occurrence_id", values.occurrenceId);

      if (!remaining || remaining.length === 0) {
        await supabase.from("occurrences").update({ status: "open", updated_at: new Date().toISOString() }).eq("id", values.occurrenceId);
      } else {
        const allCompleted = remaining.every((a) => a.status === "completed");
        const newStatus = allCompleted ? "closed" : "in_progress";
        await supabase.from("occurrences").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", values.occurrenceId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corrective-actions"] });
      queryClient.invalidateQueries({ queryKey: ["occurrences"] });
      queryClient.invalidateQueries({ queryKey: ["all-corrective-actions"] });
      toast({ title: "Ação excluída." });
    },
    onError: () => {
      toast({ title: "Erro ao excluir ação", variant: "destructive" });
    },
  });
}
