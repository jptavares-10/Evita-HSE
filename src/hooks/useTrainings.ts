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
    mutationFn: async (v: { id?: string; name: string; description?: string | null; has_expiry?: boolean; validity_months: number | null; alert_days_before: number; reference_standard?: string | null; reference_document_id?: string | null }) => {
      if (!company) throw new Error("Sem empresa");
      const hasExpiry = v.has_expiry !== false;
      const payload = { company_id: company.id, name: v.name, description: v.description || null, has_expiry: hasExpiry, validity_months: hasExpiry ? v.validity_months : null, alert_days_before: v.alert_days_before, reference_standard: v.reference_standard || null, reference_document_id: v.reference_document_id || null } as any;
      if (v.id) {
        const { error } = await supabase.from("trainings").update(payload).eq("id", v.id);
        if (error) throw error;
        return v.id;
      } else {
        const { data, error } = await supabase.from("trainings").insert(payload).select("id").single();
        if (error) throw error;
        return data.id as string;
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

// ─── Sectors ───
export function useSectors() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["sectors", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("sectors").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveSector() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: { id?: string; name: string }) => {
      if (!company) throw new Error("Sem empresa");
      if (v.id) {
        const { error } = await supabase.from("sectors").update({ name: v.name }).eq("id", v.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("sectors").insert({ company_id: company.id, name: v.name }).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sectors"] }); },
    onError: () => { toast({ title: "Erro ao salvar setor", variant: "destructive" }); },
  });
}

export function useDeleteSector() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { count } = await supabase.from("job_positions").select("id", { count: "exact", head: true }).eq("sector_id", id);
      if ((count ?? 0) > 0) throw new Error("HAS_DEPS");
      const { error } = await supabase.from("sectors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sectors"] }); toast({ title: "Setor excluído" }); },
    onError: (e: Error) => {
      toast({ title: e.message === "HAS_DEPS" ? "Existem cargos vinculados a este setor. Remova-os primeiro." : "Erro ao excluir setor", variant: "destructive" });
    },
  });
}

// ─── Training Sector Rules ───
export function useTrainingSectorRules() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["training-sector-rules", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("training_sector_rules").select("*");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveTrainingSectorRules() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ trainingId, sectorIds }: { trainingId: string; sectorIds: string[] }) => {
      if (!company) throw new Error("Sem empresa");

      // 1. Delete existing sector rules for this training
      const { error: delError } = await supabase.from("training_sector_rules").delete().eq("training_id", trainingId);
      if (delError) throw delError;

      // 2. Insert new sector rules
      if (sectorIds.length > 0) {
        const rows = sectorIds.map(sid => ({ company_id: company.id, training_id: trainingId, sector_id: sid }));
        const { error } = await supabase.from("training_sector_rules").insert(rows);
        if (error) throw error;
      }

      // 3. Sync training_matrix
      const { data: allPositions } = await supabase.from("job_positions").select("id, sector_id").eq("company_id", company.id);
      if (!allPositions) return;

      // Get old sector rules to know which sectors were removed
      const { data: existingMatrix } = await supabase.from("training_matrix").select("id, job_position_id").eq("training_id", trainingId).eq("company_id", company.id);

      const sectorSet = new Set(sectorIds);
      const positionsInSelectedSectors = allPositions.filter(p => p.sector_id && sectorSet.has(p.sector_id));
      const positionIdsInSelectedSectors = new Set(positionsInSelectedSectors.map(p => p.id));
      const existingPositionIds = new Set((existingMatrix ?? []).map(m => m.job_position_id));

      // Remove matrix entries for positions whose sector was removed
      const positionsInRemovedSectors = allPositions.filter(p => p.sector_id && !sectorSet.has(p.sector_id));
      const toRemoveIds = (existingMatrix ?? [])
        .filter(m => positionsInRemovedSectors.some(p => p.id === m.job_position_id))
        .map(m => m.id);

      if (toRemoveIds.length > 0) {
        const { error: rmErr } = await supabase.from("training_matrix").delete().in("id", toRemoveIds);
        if (rmErr) throw rmErr;
      }

      // Insert missing matrix entries for positions in selected sectors
      const toInsert = positionsInSelectedSectors
        .filter(p => !existingPositionIds.has(p.id))
        .map(p => ({ company_id: company.id, training_id: trainingId, job_position_id: p.id }));

      if (toInsert.length > 0) {
        const { error: insertErr } = await supabase.from("training_matrix").insert(toInsert);
        if (insertErr) throw insertErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training-sector-rules"] });
      qc.invalidateQueries({ queryKey: ["training-matrix"] });
    },
    onError: () => { toast({ title: "Erro ao salvar regras de setor", variant: "destructive" }); },
  });
}


export function useJobPositions() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["job-positions", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("job_positions").select("*, sectors(id, name)").order("name");
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
    mutationFn: async (v: { id?: string; name: string; sector_id?: string | null }) => {
      if (!company) throw new Error("Sem empresa");
      const sectorId = v.sector_id && v.sector_id !== "none" ? v.sector_id : null;
      let positionId: string | undefined;

      if (v.id) {
        const { error } = await supabase.from("job_positions").update({ name: v.name, sector_id: sectorId }).eq("id", v.id);
        if (error) throw error;
        positionId = v.id;
      } else {
        const { data, error } = await supabase.from("job_positions").insert({ company_id: company.id, name: v.name, sector_id: sectorId }).select("id").single();
        if (error) throw error;
        positionId = data.id;
      }

      // Auto-link trainings from sector rules to the matrix
      if (sectorId && positionId) {
        const { data: sectorRules } = await supabase.from("training_sector_rules").select("training_id").eq("sector_id", sectorId).eq("company_id", company.id);
        if (sectorRules && sectorRules.length > 0) {
          const { data: existingMatrix } = await supabase.from("training_matrix").select("training_id").eq("job_position_id", positionId).eq("company_id", company.id);
          const existingTrainingIds = new Set((existingMatrix ?? []).map(m => m.training_id));
          const toInsert = sectorRules
            .filter(r => !existingTrainingIds.has(r.training_id))
            .map(r => ({ company_id: company.id, job_position_id: positionId!, training_id: r.training_id }));
          if (toInsert.length > 0) {
            await supabase.from("training_matrix").insert(toInsert);
          }
        }
      }

      return positionId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-positions"] });
      qc.invalidateQueries({ queryKey: ["training-matrix"] });
    },
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
      const { data, error } = await supabase.from("employees").select("*, job_positions(id, name, sector_id, sectors(id, name))").order("name");
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
      // Delete training records first
      const { error: recErr } = await supabase.from("employee_training_records").delete().eq("employee_id", id);
      if (recErr) throw recErr;
      // Delete occurrence_employees links
      const { error: occErr } = await supabase.from("occurrence_employees").delete().eq("employee_id", id);
      if (occErr) throw occErr;
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["employee-records"] });
      qc.invalidateQueries({ queryKey: ["all-training-records"] });
      toast({ title: "Colaborador excluído" });
    },
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
