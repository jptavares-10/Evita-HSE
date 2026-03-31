import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ─── EPI Types (Catálogo) ───

export function useEpiTypes() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["epi-types", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("epi_types").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveEpiType() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: {
      id?: string;
      name: string;
      description?: string | null;
      ca_number?: string | null;
      ca_expires_at?: string | null;
      ca_alert_days_before?: number;
      ca_file_url?: string | null;
      ca_file_name?: string | null;
      unit?: string;
      minimum_stock?: number;
    }) => {
      if (!company) throw new Error("Sem empresa");
      const payload: any = {
        company_id: company.id,
        name: v.name,
        description: v.description || null,
        ca_number: v.ca_number || null,
        ca_expires_at: v.ca_expires_at || null,
        ca_alert_days_before: v.ca_alert_days_before ?? 60,
        ca_file_url: v.ca_file_url || null,
        ca_file_name: v.ca_file_name || null,
        unit: v.unit || "un",
        minimum_stock: v.minimum_stock ?? 0,
      };
      if (v.id) {
        const { error } = await supabase.from("epi_types").update(payload).eq("id", v.id);
        if (error) throw error;
        return v.id;
      } else {
        const { data, error } = await supabase.from("epi_types").insert(payload).select("id").single();
        if (error) throw error;
        return data.id as string;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["epi-types"] }); toast({ title: "EPI salvo" }); },
    onError: () => { toast({ title: "Erro ao salvar EPI", variant: "destructive" }); },
  });
}

export function useDeleteEpiType() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { count: movCount } = await supabase.from("epi_stock_movements").select("id", { count: "exact", head: true }).eq("epi_type_id", id);
      const { count: delCount } = await supabase.from("epi_deliveries").select("id", { count: "exact", head: true }).eq("epi_type_id", id);
      if ((movCount ?? 0) > 0 || (delCount ?? 0) > 0) throw new Error("HAS_DEPS");
      const { error } = await supabase.from("epi_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["epi-types"] }); toast({ title: "EPI excluído" }); },
    onError: (e: Error) => {
      toast({ title: e.message === "HAS_DEPS" ? "Este EPI possui movimentações ou entregas. Remova-as primeiro." : "Erro ao excluir", variant: "destructive" });
    },
  });
}

// ─── Stock Movements ───

export function useEpiStockMovements(epiTypeId?: string) {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["epi-stock-movements", company?.id, epiTypeId],
    queryFn: async () => {
      if (!company) return [];
      let q = supabase.from("epi_stock_movements").select("*, epi_types(id, name, unit), profiles:registered_by(full_name)").order("moved_at", { ascending: false });
      if (epiTypeId) q = q.eq("epi_type_id", epiTypeId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveStockMovement() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: {
      epi_type_id: string;
      movement_type: "entry" | "exit";
      quantity: number;
      notes?: string | null;
      moved_at: string;
      delivery_id?: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const { error } = await supabase.from("epi_stock_movements").insert({
        company_id: company.id,
        epi_type_id: v.epi_type_id,
        movement_type: v.movement_type,
        quantity: v.quantity,
        notes: v.notes || null,
        moved_at: v.moved_at,
        registered_by: profile.id,
        delivery_id: v.delivery_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["epi-stock-movements"] });
      qc.invalidateQueries({ queryKey: ["epi-stock"] });
      toast({ title: "Movimentação registrada" });
    },
    onError: () => { toast({ title: "Erro ao registrar movimentação", variant: "destructive" }); },
  });
}

// ─── EPI Stock (calculated) ───

export function useEpiStock() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["epi-stock", company?.id],
    queryFn: async () => {
      if (!company) return {};
      const { data, error } = await supabase.from("epi_stock_movements").select("epi_type_id, movement_type, quantity");
      if (error) throw error;
      const stock: Record<string, number> = {};
      (data ?? []).forEach((m) => {
        if (!stock[m.epi_type_id]) stock[m.epi_type_id] = 0;
        if (m.movement_type === "entry") stock[m.epi_type_id] += m.quantity;
        else stock[m.epi_type_id] -= m.quantity;
      });
      return stock;
    },
    enabled: !!company,
  });
}

// ─── Deliveries ───

export function useEpiDeliveries(epiTypeId?: string) {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["epi-deliveries", company?.id, epiTypeId],
    queryFn: async () => {
      if (!company) return [];
      let q = supabase.from("epi_deliveries").select("*, epi_types(id, name, unit), employees(id, name), profiles:registered_by(full_name)").order("delivered_at", { ascending: false });
      if (epiTypeId) q = q.eq("epi_type_id", epiTypeId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useSaveDelivery() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: {
      epi_type_id: string;
      employee_id: string;
      delivered_at: string;
      quantity: number;
      reason?: string | null;
      notes?: string | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      // 1. Insert delivery
      const { data: delivery, error: delErr } = await supabase.from("epi_deliveries").insert({
        company_id: company.id,
        epi_type_id: v.epi_type_id,
        employee_id: v.employee_id,
        delivered_at: v.delivered_at,
        quantity: v.quantity,
        reason: v.reason || null,
        notes: v.notes || null,
        registered_by: profile.id,
      }).select("id").single();
      if (delErr) throw delErr;

      // 2. Auto-create stock exit
      const { error: movErr } = await supabase.from("epi_stock_movements").insert({
        company_id: company.id,
        epi_type_id: v.epi_type_id,
        movement_type: "exit",
        quantity: v.quantity,
        moved_at: v.delivered_at,
        registered_by: profile.id,
        delivery_id: delivery.id,
        notes: `Entrega a colaborador`,
      });
      if (movErr) throw movErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["epi-deliveries"] });
      qc.invalidateQueries({ queryKey: ["epi-stock-movements"] });
      qc.invalidateQueries({ queryKey: ["epi-stock"] });
      toast({ title: "Entrega registrada" });
    },
    onError: () => { toast({ title: "Erro ao registrar entrega", variant: "destructive" }); },
  });
}
