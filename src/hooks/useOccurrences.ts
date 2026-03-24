import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

export function useCorrectiveActions(occurrenceId: string | null) {
  return useQuery({
    queryKey: ["corrective-actions", occurrenceId],
    queryFn: async () => {
      if (!occurrenceId) return [];
      const { data, error } = await supabase
        .from("corrective_actions")
        .select("*, creator:created_by(full_name), completer:completed_by(full_name)")
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
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
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
          const { error: upErr } = await supabase.storage.from("occurrence-files").upload(path, file);
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
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (occurrenceId: string) => {
      const { error } = await supabase.from("occurrences").update({ status: "closed", updated_at: new Date().toISOString() }).eq("id", occurrenceId);
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

export function useAddCorrectiveAction() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: { occurrence_id: string; description: string }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const { error } = await supabase.from("corrective_actions").insert({
        occurrence_id: values.occurrence_id,
        company_id: company.id,
        description: values.description,
        created_by: profile.id,
      });
      if (error) throw error;
      // Update occurrence status
      await supabase.from("occurrences").update({ status: "in_progress", updated_at: new Date().toISOString() }).eq("id", values.occurrence_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corrective-actions"] });
      queryClient.invalidateQueries({ queryKey: ["occurrences"] });
      toast({ title: "Ação adicionada." });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar ação", variant: "destructive" });
    },
  });
}

export function useUpdateActionStatus() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      actionId: string;
      occurrenceId: string;
      newStatus: string;
      completion_notes?: string | null;
      evidenceFile?: File | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const updatePayload: any = { status: values.newStatus };

      if (values.newStatus === "completed") {
        updatePayload.completed_at = new Date().toISOString();
        updatePayload.completed_by = profile.id;
        updatePayload.completion_notes = values.completion_notes || null;

        if (values.evidenceFile) {
          const ext = values.evidenceFile.name.split(".").pop() ?? "bin";
          const path = `${company.id}/${values.occurrenceId}/actions/${values.actionId}.${ext}`;
          const { error: upErr } = await supabase.storage.from("occurrence-files").upload(path, values.evidenceFile, { upsert: true });
          if (upErr) throw upErr;
          updatePayload.evidence_url = path;
          updatePayload.evidence_name = values.evidenceFile.name;
        }
      }

      const { error } = await supabase.from("corrective_actions").update(updatePayload).eq("id", values.actionId);
      if (error) throw error;

      // Recalculate occurrence status
      const { data: allActions } = await supabase
        .from("corrective_actions")
        .select("status")
        .eq("occurrence_id", values.occurrenceId);

      if (allActions && allActions.length > 0) {
        const allCompleted = allActions.every((a) => a.status === "completed");
        const newOccStatus = allCompleted ? "closed" : "in_progress";
        await supabase.from("occurrences").update({ status: newOccStatus, updated_at: new Date().toISOString() }).eq("id", values.occurrenceId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["corrective-actions"] });
      queryClient.invalidateQueries({ queryKey: ["occurrences"] });
      queryClient.invalidateQueries({ queryKey: ["all-corrective-actions"] });
      const msg = variables.newStatus === "completed" ? "Ação concluída." : "Ação iniciada.";
      toast({ title: msg });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar ação", variant: "destructive" });
    },
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
