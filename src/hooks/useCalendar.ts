import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { extractStoragePath } from "@/lib/storage-utils";

export interface CalendarEvent {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  area: "meio_ambiente" | "seguranca" | "saude" | "geral";
  category:
    | "evento"
    | "campanha"
    | "auditoria"
    | "reuniao"
    | "treinamento_interno"
    | "outro";
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location: string | null;
  color: string | null;
  status: "planejado" | "concluido" | "cancelado";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarAttachment {
  id: string;
  event_id: string;
  company_id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface CalendarDueItem {
  source_module: string;
  source_id: string;
  title: string;
  due_date: string;
  company_id: string;
  deep_link: string;
  subtitle: string | null;
}

export function useCalendarEvents(rangeStart?: Date, rangeEnd?: Date) {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["calendar-events", company?.id, rangeStart?.toISOString(), rangeEnd?.toISOString()],
    queryFn: async () => {
      if (!company) return [] as CalendarEvent[];
      let q = (supabase.from as any)("calendar_events").select("*").order("starts_at", { ascending: true });
      if (rangeStart) q = q.gte("starts_at", rangeStart.toISOString());
      if (rangeEnd) q = q.lte("starts_at", rangeEnd.toISOString());
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CalendarEvent[];
    },
    enabled: !!company,
  });
}

export function useCalendarDueItems(rangeStart?: Date, rangeEnd?: Date) {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["calendar-due-items", company?.id, rangeStart?.toISOString(), rangeEnd?.toISOString()],
    queryFn: async () => {
      if (!company) return [] as CalendarDueItem[];
      let q = (supabase.from as any)("calendar_due_items").select("*").order("due_date", { ascending: true });
      if (rangeStart) q = q.gte("due_date", rangeStart.toISOString().slice(0, 10));
      if (rangeEnd) q = q.lte("due_date", rangeEnd.toISOString().slice(0, 10));
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CalendarDueItem[];
    },
    enabled: !!company,
  });
}

export function useCalendarAttachments(eventId: string | null) {
  return useQuery({
    queryKey: ["calendar-attachments", eventId],
    queryFn: async () => {
      if (!eventId) return [] as CalendarAttachment[];
      const { data, error } = await (supabase.from as any)("calendar_event_attachments")
        .select("*")
        .eq("event_id", eventId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CalendarAttachment[];
    },
    enabled: !!eventId,
  });
}

export function useUpsertCalendarEvent() {
  const { company, profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: Partial<CalendarEvent> & { id?: string }) => {
      if (!company || !profile) throw new Error("Sessão expirada");
      const base = {
        company_id: company.id,
        title: payload.title!.trim(),
        description: payload.description?.trim() || null,
        area: payload.area ?? "geral",
        category: payload.category ?? "evento",
        starts_at: payload.starts_at!,
        ends_at: payload.ends_at || null,
        all_day: !!payload.all_day,
        location: payload.location?.trim() || null,
        color: payload.color || null,
        status: payload.status ?? "planejado",
      };
      if (payload.id) {
        const { data, error } = await (supabase.from as any)("calendar_events")
          .update(base).eq("id", payload.id).select().single();
        if (error) throw error;
        return data as CalendarEvent;
      }
      const { data, error } = await (supabase.from as any)("calendar_events")
        .insert({ ...base, created_by: profile.id }).select().single();
      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast({ title: "Evento salvo" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      // Best-effort cleanup of storage for the event's attachments
      const { data: atts } = await (supabase.from as any)("calendar_event_attachments")
        .select("file_url").eq("event_id", id);
      const paths = (atts ?? []).map((a: any) => extractStoragePath("calendar-attachments", a.file_url));
      if (paths.length) {
        await supabase.storage.from("calendar-attachments").remove(paths);
      }
      const { error } = await (supabase.from as any)("calendar_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-attachments"] });
      toast({ title: "Evento removido" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    },
  });
}

export function useUploadCalendarAttachment() {
  const { company, profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, file }: { eventId: string; file: File }) => {
      if (!company || !profile) throw new Error("Sessão expirada");
      const ext = file.name.split(".").pop() || "bin";
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${company.id}/${eventId}/${safeName}`;
      const { error: upErr } = await storageUpload("calendar-attachments", path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { error: insErr } = await (supabase.from as any)("calendar_event_attachments").insert({
        event_id: eventId,
        company_id: company.id,
        file_url: path,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: profile.id,
      });
      if (insErr) {
        // Rollback storage upload
        await supabase.storage.from("calendar-attachments").remove([path]);
        throw insErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-attachments"] });
      toast({ title: "Arquivo enviado" });
    },
    onError: (err: any) => {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteCalendarAttachment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (attachment: CalendarAttachment) => {
      const path = extractStoragePath("calendar-attachments", attachment.file_url);
      await supabase.storage.from("calendar-attachments").remove([path]);
      const { error } = await (supabase.from as any)("calendar_event_attachments")
        .delete().eq("id", attachment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-attachments"] });
      toast({ title: "Anexo removido" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    },
  });
}