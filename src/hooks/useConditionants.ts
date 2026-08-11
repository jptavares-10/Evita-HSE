import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { computeEffectiveStatus, resolveDueDate, nextRecurringDueDate, type EffectiveStatus } from "@/lib/conditionants";
import { storageUpload } from "@/lib/storage-utils";

export interface ConditionantRow {
  id: string;
  company_id: string;
  license_id: string;
  item_code: string | null;
  description: string;
  responsible_id: string | null;
  criticality: string;
  deadline_type: string;
  due_date: string | null;
  recurrence: string | null;
  days_before_license_expiry: number | null;
  alert_days_before: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  environmental_licenses?: { id: string; license_number: string; title: string; expires_at: string | null; has_expiry: boolean } | null;
  responsible?: { id: string; full_name: string | null } | null;
  _resolved_due: string | null;
  _status: EffectiveStatus;
  _compliance_count: number;
}

export function useConditionants(licenseId?: string) {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["license-conditionants", company?.id, licenseId ?? "all"],
    queryFn: async (): Promise<ConditionantRow[]> => {
      if (!company) return [];
      let query = (supabase.from as any)("license_conditionants")
        .select(
          "*, environmental_licenses:license_id(id, license_number, title, expires_at, has_expiry), responsible:responsible_id(id, full_name), conditionant_compliances(id)",
        )
        .order("due_date", { ascending: true, nullsFirst: false });
      if (licenseId) query = query.eq("license_id", licenseId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((c: any) => {
        const resolved = resolveDueDate(
          c.deadline_type,
          c.due_date,
          c.days_before_license_expiry,
          c.environmental_licenses?.has_expiry ? c.environmental_licenses?.expires_at : null,
        );
        return {
          ...c,
          _resolved_due: resolved,
          _status: computeEffectiveStatus(c.status, c.deadline_type, resolved, c.alert_days_before),
          _compliance_count: c.conditionant_compliances?.length ?? 0,
        } as ConditionantRow;
      });
    },
    enabled: !!company,
  });
}

export function useCompanyMembers() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["company-members", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("company_id", company.id)
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useConditionantCompliances(conditionantId: string | null) {
  return useQuery({
    queryKey: ["conditionant-compliances", conditionantId],
    queryFn: async () => {
      if (!conditionantId) return [];
      const { data, error } = await (supabase.from as any)("conditionant_compliances")
        .select(
          "*, registered:registered_by(full_name), conditionant_evidence_files(*), conditionant_document_links(id, document_id, documents:document_id(id, title, code))",
        )
        .eq("conditionant_id", conditionantId)
        .order("fulfilled_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!conditionantId,
  });
}

export interface SaveConditionantValues {
  id?: string;
  license_id: string;
  item_code: string | null;
  description: string;
  responsible_id: string | null;
  criticality: string;
  deadline_type: string;
  due_date: string | null;
  recurrence: string | null;
  days_before_license_expiry: number | null;
  alert_days_before: number;
  status: string;
  notes: string | null;
}

export function useSaveConditionant() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: SaveConditionantValues) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const payload: any = {
        company_id: company.id,
        license_id: values.license_id,
        item_code: values.item_code || null,
        description: values.description,
        responsible_id: values.responsible_id || null,
        criticality: values.criticality,
        deadline_type: values.deadline_type,
        due_date: values.deadline_type === "continuous" || values.deadline_type === "license_linked" ? null : values.due_date,
        recurrence: values.deadline_type === "recurring" ? values.recurrence : null,
        days_before_license_expiry: values.deadline_type === "license_linked" ? values.days_before_license_expiry : null,
        alert_days_before: values.alert_days_before,
        status: values.status,
        notes: values.notes || null,
      };

      if (values.id) {
        const { error } = await (supabase.from as any)("license_conditionants").update(payload).eq("id", values.id);
        if (error) throw error;
        return values.id;
      }
      const { data, error } = await (supabase.from as any)("license_conditionants")
        .insert({ ...payload, created_by: profile.id })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["license-conditionants"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-due-items"] });
      toast({ title: "Condicionante salva." });
    },
    onError: (e: any) => {
      toast({ title: "Erro ao salvar condicionante.", description: e?.message, variant: "destructive" });
    },
  });
}

export interface RegisterComplianceValues {
  conditionant: ConditionantRow;
  fulfilled_at: string;
  notes: string | null;
  protocol_number: string | null;
  protocol_date: string | null;
  protocol_body: string | null;
  protocol_channel: string | null;
  files: File[];
  documentIds: string[];
  /** When recurring: keep the conditionant open with the next due date. */
  markFulfilled: boolean;
}

export function useRegisterCompliance() {
  const queryClient = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: RegisterComplianceValues) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const c = values.conditionant;

      const { data: compliance, error } = await (supabase.from as any)("conditionant_compliances")
        .insert({
          conditionant_id: c.id,
          company_id: company.id,
          fulfilled_at: values.fulfilled_at,
          reference_due_date: c._resolved_due,
          notes: values.notes || null,
          protocol_number: values.protocol_number || null,
          protocol_date: values.protocol_date || null,
          protocol_body: values.protocol_body || null,
          protocol_channel: values.protocol_channel || null,
          registered_by: profile.id,
        })
        .select("id")
        .single();
      if (error) throw error;

      for (const file of values.files) {
        const ext = file.name.split(".").pop();
        const path = `${company.id}/${c.id}/${compliance.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await storageUpload("license-conditionants", path, file);
        if (upErr) throw upErr;
        const { error: fileErr } = await (supabase.from as any)("conditionant_evidence_files").insert({
          compliance_id: compliance.id,
          company_id: company.id,
          file_url: path,
          file_name: file.name,
          file_type: file.type,
          uploaded_by: profile.id,
        });
        if (fileErr) throw fileErr;
      }

      if (values.documentIds.length) {
        const { error: linkErr } = await (supabase.from as any)("conditionant_document_links").insert(
          values.documentIds.map((document_id) => ({
            compliance_id: compliance.id,
            document_id,
            company_id: company.id,
          })),
        );
        if (linkErr) throw linkErr;
      }

      // Update the conditionant itself
      const update: any = {};
      if (c.deadline_type === "recurring") {
        const next = nextRecurringDueDate(values.fulfilled_at, c.recurrence);
        update.due_date = next;
        update.status = "pending";
      } else if (c.deadline_type === "continuous") {
        update.status = "in_progress";
      } else if (values.markFulfilled) {
        update.status = "fulfilled";
      }
      if (Object.keys(update).length) {
        const { error: updErr } = await (supabase.from as any)("license_conditionants").update(update).eq("id", c.id);
        if (updErr) throw updErr;
      }

      return update.due_date ?? null;
    },
    onSuccess: (nextDue) => {
      queryClient.invalidateQueries({ queryKey: ["license-conditionants"] });
      queryClient.invalidateQueries({ queryKey: ["conditionant-compliances"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-due-items"] });
      toast({
        title: nextDue
          ? `Cumprimento registrado. Próximo vencimento: ${nextDue.split("-").reverse().join("/")}.`
          : "Cumprimento registrado com evidências.",
      });
    },
    onError: (e: any) => {
      toast({ title: "Erro ao registrar cumprimento.", description: e?.message, variant: "destructive" });
    },
  });
}

export function useDeleteConditionant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (conditionant: { id: string; company_id: string }) => {
      const prefix = `${conditionant.company_id}/${conditionant.id}`;
      const { data: folders } = await supabase.storage.from("license-conditionants").list(prefix, { limit: 200 });
      if (folders?.length) {
        for (const folder of folders) {
          const { data: inner } = await supabase.storage.from("license-conditionants").list(`${prefix}/${folder.name}`, { limit: 200 });
          if (inner?.length) {
            await supabase.storage
              .from("license-conditionants")
              .remove(inner.map((f) => `${prefix}/${folder.name}/${f.name}`));
          }
        }
      }
      const { error } = await (supabase.from as any)("license_conditionants").delete().eq("id", conditionant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["license-conditionants"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-due-items"] });
      toast({ title: "Condicionante excluída." });
    },
    onError: (e: any) => {
      toast({ title: "Erro ao excluir condicionante.", description: e?.message, variant: "destructive" });
    },
  });
}

export function useDeleteCompliance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (compliance: { id: string; files: { file_url: string }[] }) => {
      if (compliance.files.length) {
        await supabase.storage.from("license-conditionants").remove(compliance.files.map((f) => f.file_url));
      }
      const { error } = await (supabase.from as any)("conditionant_compliances").delete().eq("id", compliance.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conditionant-compliances"] });
      queryClient.invalidateQueries({ queryKey: ["license-conditionants"] });
      toast({ title: "Registro de cumprimento removido." });
    },
    onError: () => toast({ title: "Erro ao remover registro.", variant: "destructive" }),
  });
}