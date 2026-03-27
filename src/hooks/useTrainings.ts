import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ─── Trainings ───
export function useTrainings() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["trainings", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("trainings").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveTraining() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: { id?: string; name: string; description?: string | null; has_expiry: boolean; validity_months: number | null; alert_days_before: number }) => {
      if (!company) throw new Error("Sem empresa");
      const payload = { company_id: company.id, name: v.name, description: v.description || null, has_expiry: v.has_expiry, validity_months: v.validity_months, alert_days_before: v.alert_days_before };
      if (v.id) {
        const { error } = await supabase.from("trainings").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("trainings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trainings"] }); toast({ title: "Treinamento salvo" }); },
    onError: () => { toast({ title: "Erro ao salvar treinamento", variant: "destructive" }); },
  });
}

export function useDeleteTraining() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      // Check matrix & records
      const { count: matCount } = await supabase.from("training_matrix").select("id", { count: "exact", head: true }).eq("training_id", id);
      const { count: recCount } = await supabase.from("employee_training_records").select("id", { count: "exact", head: true }).eq("training_id", id);
      if ((matCount ?? 0) > 0 || (recCount ?? 0) > 0) throw new Error("HAS_DEPS");
      const { error } = await supabase.from("trainings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trainings"] }); toast({ title: "Treinamento excluído" }); },
    onError: (e: Error) => {
      toast({ title: e.message === "HAS_DEPS" ? "Este treinamento possui registros ou está na matriz. Remova-os primeiro." : "Erro ao excluir", variant: "destructive" });
    },
  });
}

// ─── Job Positions ───
export function useJobPositions() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["job-positions", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("job_positions").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveJobPosition() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: { id?: string; name: string }) => {
      if (!company) throw new Error("Sem empresa");
      if (v.id) {
        const { error } = await supabase.from("job_positions").update({ name: v.name }).eq("id", v.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("job_positions").insert({ company_id: company.id, name: v.name }).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["job-positions"] }); },
    onError: () => { toast({ title: "Erro ao salvar cargo", variant: "destructive" }); },
  });
}

// ─── Employees ───
export function useEmployees() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["employees", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("employees").select("*, job_positions(id, name)").order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveEmployee() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: { id?: string; name: string; job_position_id: string | null; sector?: string | null; status?: string }) => {
      if (!company) throw new Error("Sem empresa");
      const payload = { company_id: company.id, name: v.name, job_position_id: v.job_position_id, sector: v.sector || null, status: v.status || "active" };
      if (v.id) {
        const { error } = await supabase.from("employees").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employees").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast({ title: "Colaborador salvo" }); },
    onError: () => { toast({ title: "Erro ao salvar colaborador", variant: "destructive" }); },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); toast({ title: "Colaborador excluído" }); },
    onError: () => { toast({ title: "Erro ao excluir colaborador", variant: "destructive" }); },
  });
}

// ─── Training Matrix ───
export function useTrainingMatrix() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["training-matrix", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("training_matrix").select("*");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useToggleMatrixEntry() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ jobPositionId, trainingId, exists, entryId }: { jobPositionId: string; trainingId: string; exists: boolean; entryId?: string }) => {
      if (!company) throw new Error("Sem empresa");
      if (exists && entryId) {
        const { error } = await supabase.from("training_matrix").delete().eq("id", entryId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("training_matrix").insert({ company_id: company.id, job_position_id: jobPositionId, training_id: trainingId });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["training-matrix"] }); toast({ title: "Matriz atualizada" }); },
    onError: () => { toast({ title: "Erro ao atualizar matriz", variant: "destructive" }); },
  });
}

// ─── Employee Training Records ───
export function useEmployeeRecords(employeeId: string | null) {
  return useQuery({
    queryKey: ["employee-records", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from("employee_training_records")
        .select("*, trainings(id, name, alert_days_before), profiles:registered_by(full_name)")
        .eq("employee_id", employeeId)
        .order("done_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!employeeId,
  });
}

export function useAllRecords() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["all-training-records", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("employee_training_records")
        .select("*, trainings(id, name, alert_days_before), employees(id, name, status, job_position_id)")
        .order("expires_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useRegisterCertificate() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: {
      employee_id: string;
      training_id: string;
      done_at: string;
      expires_at: string;
      certificate_url?: string | null;
      certificate_name?: string | null;
      notes?: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const { error } = await supabase.from("employee_training_records").insert({
        company_id: company.id,
        employee_id: v.employee_id,
        training_id: v.training_id,
        done_at: v.done_at,
        expires_at: v.expires_at,
        certificate_url: v.certificate_url || null,
        certificate_name: v.certificate_name || null,
        notes: v.notes || null,
        registered_by: profile.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employee-records"] });
      qc.invalidateQueries({ queryKey: ["all-training-records"] });
      toast({ title: "Certificado registrado com sucesso" });
    },
    onError: () => { toast({ title: "Erro ao registrar certificado", variant: "destructive" }); },
  });
}
