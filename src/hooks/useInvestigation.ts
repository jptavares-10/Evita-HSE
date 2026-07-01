import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ── Causes ──────────────────────────────────────────────

export function useOccurrenceCauses(occurrenceId: string | null) {
  return useQuery({
    queryKey: ["occurrence-causes", occurrenceId],
    queryFn: async () => {
      if (!occurrenceId) return [];
      const { data, error } = await supabase
        .from("occurrence_causes")
        .select("*")
        .eq("occurrence_id", occurrenceId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!occurrenceId,
  });
}

export function useSaveCause() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: {
      id?: string;
      occurrence_id: string;
      cause_type: string;
      category_6m?: string | null;
      description: string;
      source_method?: string | null;
      parent_cause_id?: string | null;
      order_index?: number;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const payload: any = {
        company_id: company.id,
        occurrence_id: values.occurrence_id,
        cause_type: values.cause_type,
        category_6m: values.category_6m || null,
        description: values.description,
        source_method: values.source_method || "manual",
        parent_cause_id: values.parent_cause_id || null,
        order_index: values.order_index ?? 0,
      };
      if (values.id) {
        const { error } = await supabase.from("occurrence_causes").update(payload).eq("id", values.id);
        if (error) throw error;
        return values.id;
      } else {
        payload.created_by = profile.id;
        const { data, error } = await supabase.from("occurrence_causes").insert(payload).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["occurrence-causes"] });
    },
    onError: () => toast({ title: "Erro ao salvar causa", variant: "destructive" }),
  });
}

export function useDeleteCause() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("occurrence_causes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["occurrence-causes"] });
      qc.invalidateQueries({ queryKey: ["corrective-actions"] });
    },
    onError: () => toast({ title: "Erro ao excluir causa", variant: "destructive" }),
  });
}

// ── Bow-Tie ─────────────────────────────────────────────

export function useBowtieNodes(occurrenceId: string | null) {
  return useQuery({
    queryKey: ["occurrence-bowtie", occurrenceId],
    queryFn: async () => {
      if (!occurrenceId) return [];
      const { data, error } = await supabase
        .from("occurrence_bowtie")
        .select("*")
        .eq("occurrence_id", occurrenceId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!occurrenceId,
  });
}

export function useSaveBowtieNode() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: {
      id?: string;
      occurrence_id: string;
      hazard?: string | null;
      node_type: string;
      description: string;
      linked_to?: string | null;
      order_index?: number;
    }) => {
      if (!company) throw new Error("Sem empresa");
      const payload: any = {
        company_id: company.id,
        occurrence_id: values.occurrence_id,
        hazard: values.hazard ?? null,
        node_type: values.node_type,
        description: values.description,
        linked_to: values.linked_to ?? null,
        order_index: values.order_index ?? 0,
      };
      if (values.id) {
        const { error } = await supabase.from("occurrence_bowtie").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("occurrence_bowtie").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["occurrence-bowtie"] }),
    onError: () => toast({ title: "Erro ao salvar", variant: "destructive" }),
  });
}

export function useDeleteBowtieNode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("occurrence_bowtie").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["occurrence-bowtie"] }),
  });
}

export function useUpdateBowtieHazard() {
  const qc = useQueryClient();
  const { company } = useAuth();
  return useMutation({
    mutationFn: async ({ occurrence_id, hazard }: { occurrence_id: string; hazard: string }) => {
      if (!company) throw new Error("Sem empresa");
      // Update hazard on all rows for this occurrence (single source of truth)
      const { error } = await supabase
        .from("occurrence_bowtie")
        .update({ hazard })
        .eq("occurrence_id", occurrence_id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["occurrence-bowtie"] }),
  });
}

// ── Witnesses ───────────────────────────────────────────

export function useWitnesses(occurrenceId: string | null) {
  return useQuery({
    queryKey: ["occurrence-witnesses", occurrenceId],
    queryFn: async () => {
      if (!occurrenceId) return [];
      const { data, error } = await supabase
        .from("occurrence_witnesses")
        .select("*")
        .eq("occurrence_id", occurrenceId)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!occurrenceId,
  });
}

export function useAddWitness() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: { occurrence_id: string; witness_name: string; employee_id?: string | null; statement?: string | null }) => {
      if (!company) throw new Error("Sem empresa");
      const { error } = await supabase.from("occurrence_witnesses").insert({
        company_id: company.id,
        occurrence_id: values.occurrence_id,
        witness_name: values.witness_name,
        employee_id: values.employee_id ?? null,
        statement: values.statement ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["occurrence-witnesses"] }),
    onError: () => toast({ title: "Erro ao adicionar testemunha", variant: "destructive" }),
  });
}

export function useDeleteWitness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("occurrence_witnesses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["occurrence-witnesses"] }),
  });
}

// ── 5W2H Action extensions ──────────────────────────────

export function useSaveActionDetails() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: {
      id: string;
      cause_id?: string | null;
      why?: string | null;
      where_location?: string | null;
      due_date?: string | null;
      responsible_profile_id?: string | null;
      responsible_employee_id?: string | null;
      how_method?: string | null;
      cost_estimated?: number | null;
      control_hierarchy?: string | null;
      description?: string;
    }) => {
      const { id, ...payload } = values;
      const { error } = await supabase.from("corrective_actions").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["corrective-actions"] });
      qc.invalidateQueries({ queryKey: ["all-corrective-actions"] });
    },
    onError: () => toast({ title: "Erro ao salvar ação", variant: "destructive" }),
  });
}

export function useSaveEffectiveness() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, effectiveness_result, effectiveness_check_date }: { id: string; effectiveness_result: string; effectiveness_check_date: string }) => {
      const { error } = await supabase
        .from("corrective_actions")
        .update({ effectiveness_result, effectiveness_check_date })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["corrective-actions"] });
      toast({ title: "Verificação de eficácia registrada." });
    },
    onError: () => toast({ title: "Erro ao registrar", variant: "destructive" }),
  });
}

// ── Occurrence extras (CAT, cost, lesson) ───────────────

export function useUpdateOccurrenceExtras() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: {
      id: string;
      investigation_method?: string | null;
      cat_number?: string | null;
      cat_issued_at?: string | null;
      cost_estimated?: number | null;
      published_as_lesson?: boolean;
      lesson_title?: string | null;
      lesson_summary?: string | null;
      lesson_tags?: string[] | null;
    }) => {
      const { id, ...payload } = values;
      const { error } = await supabase.from("occurrences").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["occurrences"] });
      qc.invalidateQueries({ queryKey: ["lessons-learned"] });
      toast({ title: "Atualizado." });
    },
    onError: () => toast({ title: "Erro ao salvar", variant: "destructive" }),
  });
}

// ── Lessons Learned Library ─────────────────────────────

export function useLessonsLearned() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["lessons-learned", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("occurrences")
        .select("id, type, severity, location, occurred_at, lesson_title, lesson_summary, lesson_tags, description")
        .eq("company_id", company.id)
        .eq("published_as_lesson", true)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

// ── Recurrence hint ─────────────────────────────────────

export function useSimilarOccurrences(occ: { id?: string; type: string; location: string } | null) {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["similar-occurrences", company?.id, occ?.type, occ?.location, occ?.id],
    queryFn: async () => {
      if (!company || !occ) return [];
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const { data, error } = await supabase
        .from("occurrences")
        .select("id, occurred_at, description, severity")
        .eq("company_id", company.id)
        .eq("type", occ.type)
        .eq("location", occ.location)
        .gte("occurred_at", oneYearAgo.toISOString())
        .order("occurred_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []).filter((o: any) => o.id !== occ.id);
    },
    enabled: !!company && !!occ?.type && !!occ?.location,
  });
}