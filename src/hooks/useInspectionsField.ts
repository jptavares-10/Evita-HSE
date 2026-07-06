import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";

// ── Assets ──

export function useInspectionAssets() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["inspection-assets", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("inspection_assets")
        .select("*, sectors(id, name)")
        .order("tag_code");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useAssetByQrToken(qrToken: string | null) {
  return useQuery({
    queryKey: ["inspection-asset-qr", qrToken],
    queryFn: async () => {
      if (!qrToken) return null;
      const { data, error } = await supabase
        .from("inspection_assets")
        .select("*, sectors(id, name)")
        .eq("qr_token", qrToken)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!qrToken,
  });
}

export function useSaveAsset() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: {
      id?: string;
      tag_code: string;
      name: string;
      asset_type: string;
      sector_id?: string | null;
      location_description?: string | null;
      status?: string;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");
      const payload: any = {
        company_id: company.id,
        tag_code: v.tag_code.trim(),
        name: v.name.trim(),
        asset_type: v.asset_type,
        sector_id: v.sector_id || null,
        location_description: v.location_description?.trim() || null,
        status: v.status ?? "active",
      };
      if (v.id) {
        const { error } = await supabase.from("inspection_assets").update(payload).eq("id", v.id);
        if (error) throw error;
        return v.id;
      } else {
        payload.created_by = profile.id;
        const { data, error } = await supabase.from("inspection_assets").insert(payload).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-assets"] });
      toast({ title: "Ativo salvo." });
    },
    onError: (e: any) => {
      const msg = e?.message?.includes("inspection_assets_company_tag_uk")
        ? "Já existe um ativo com esse código de etiqueta."
        : "Erro ao salvar ativo.";
      toast({ title: msg, variant: "destructive" });
    },
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { count } = await supabase
        .from("inspection_executions")
        .select("id", { count: "exact", head: true })
        .eq("asset_id", id);
      if (count && count > 0) throw new Error("HAS_EXECUTIONS");
      const { error } = await supabase.from("inspection_assets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-assets"] });
      toast({ title: "Ativo excluído." });
    },
    onError: (e: any) => {
      if (e.message === "HAS_EXECUTIONS") {
        toast({ title: "Este ativo tem inspeções vinculadas. Inative em vez de excluir.", variant: "destructive" });
      } else {
        toast({ title: "Erro ao excluir.", variant: "destructive" });
      }
    },
  });
}

// ── Checklist items ──

export function useChecklistItems(modelId: string | null) {
  return useQuery({
    queryKey: ["inspection-checklist-items", modelId],
    queryFn: async () => {
      if (!modelId) return [];
      const { data, error } = await supabase
        .from("inspection_checklist_items")
        .select("*")
        .eq("model_id", modelId)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!modelId,
  });
}

export function useSaveChecklistItem() {
  const qc = useQueryClient();
  const { company } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: {
      id?: string;
      model_id: string;
      position: number;
      question: string;
      response_type: string;
      is_critical: boolean;
      photo_required: boolean;
      reference?: string | null;
      expected_answer?: string | null;
      help_text?: string | null;
    }) => {
      if (!company) throw new Error("Sem empresa");
      const payload: any = {
        company_id: company.id,
        model_id: v.model_id,
        position: v.position,
        question: v.question.trim(),
        response_type: v.response_type,
        is_critical: v.is_critical,
        photo_required: v.photo_required,
        reference: v.reference?.trim() || null,
        expected_answer: v.expected_answer?.trim() || null,
        help_text: v.help_text?.trim() || null,
      };
      if (v.id) {
        const { error } = await supabase.from("inspection_checklist_items").update(payload).eq("id", v.id);
        if (error) throw error;
        return v.id;
      } else {
        const { data, error } = await supabase.from("inspection_checklist_items").insert(payload).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ["inspection-checklist-items", v.model_id] });
    },
    onError: () => toast({ title: "Erro ao salvar item.", variant: "destructive" }),
  });
}

export function useDeleteChecklistItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, model_id }: { id: string; model_id: string }) => {
      const { error } = await supabase.from("inspection_checklist_items").delete().eq("id", id);
      if (error) throw error;
      return model_id;
    },
    onSuccess: (model_id) => {
      qc.invalidateQueries({ queryKey: ["inspection-checklist-items", model_id] });
    },
    onError: () => toast({ title: "Erro ao excluir item.", variant: "destructive" }),
  });
}

// ── Answers (execution field flow) ──

export function useExecutionAnswers(executionId: string | null) {
  return useQuery({
    queryKey: ["inspection-answers", executionId],
    queryFn: async () => {
      if (!executionId) return [];
      const { data, error } = await supabase
        .from("inspection_execution_answers")
        .select("*")
        .eq("execution_id", executionId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!executionId,
  });
}

async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, {
      maxSizeMB: 1.2,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      initialQuality: 0.82,
    });
  } catch {
    return file;
  }
}

export function useSaveAnswer() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: {
      execution_id: string;
      item_id: string;
      answer_value: string | null;
      is_conformant: boolean | null;
      note?: string | null;
      photos?: File[];
      location?: GeolocationCoordinates | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      const uploadedPaths: string[] = [];
      if (v.photos && v.photos.length > 0) {
        for (const raw of v.photos) {
          const compressed = await compressImage(raw);
          const ext = (compressed.name.split(".").pop() || "jpg").toLowerCase();
          const path = `${company.id}/${v.execution_id}/answers/${v.item_id}/${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage.from("inspection-files").upload(path, compressed, { upsert: false, contentType: compressed.type });
          if (error) throw error;
          uploadedPaths.push(path);
        }
      }

      const payload: any = {
        company_id: company.id,
        execution_id: v.execution_id,
        item_id: v.item_id,
        answer_value: v.answer_value,
        is_conformant: v.is_conformant,
        note: v.note?.trim() || null,
        answered_by: profile.id,
        answered_at: new Date().toISOString(),
        location_lat: v.location?.latitude ?? null,
        location_lng: v.location?.longitude ?? null,
        location_accuracy: v.location?.accuracy ?? null,
      };

      // Merge with existing photos
      const { data: existing } = await supabase
        .from("inspection_execution_answers")
        .select("id, photo_urls")
        .eq("execution_id", v.execution_id)
        .eq("item_id", v.item_id)
        .maybeSingle();

      const mergedPhotos = [...((existing?.photo_urls as string[]) || []), ...uploadedPaths];
      payload.photo_urls = mergedPhotos;

      if (existing) {
        const { error } = await supabase
          .from("inspection_execution_answers")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("inspection_execution_answers").insert(payload);
        if (error) throw error;
      }

      // Bump execution to in_progress
      await supabase
        .from("inspection_executions")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("id", v.execution_id)
        .eq("status", "pending");
    },
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ["inspection-answers", v.execution_id] });
      qc.invalidateQueries({ queryKey: ["inspection-executions"] });
      qc.invalidateQueries({ queryKey: ["inspection-execution", v.execution_id] });
    },
    onError: () => toast({ title: "Erro ao salvar resposta.", variant: "destructive" }),
  });
}

export function useRemoveAnswerPhoto() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ execution_id, item_id, path }: { execution_id: string; item_id: string; path: string }) => {
      const { data: existing } = await supabase
        .from("inspection_execution_answers")
        .select("id, photo_urls")
        .eq("execution_id", execution_id)
        .eq("item_id", item_id)
        .maybeSingle();
      if (!existing) return;
      const newPhotos = ((existing.photo_urls as string[]) || []).filter((p) => p !== path);
      const { error } = await supabase
        .from("inspection_execution_answers")
        .update({ photo_urls: newPhotos })
        .eq("id", existing.id);
      if (error) throw error;
      await supabase.storage.from("inspection-files").remove([path]);
    },
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ["inspection-answers", v.execution_id] });
    },
    onError: () => toast({ title: "Erro ao remover foto.", variant: "destructive" }),
  });
}

// ── Signature / close with signature ──

export function useSignExecution() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (v: {
      execution_id: string;
      signature_png: string;
      signer_name: string;
      signer_role?: string | null;
      location?: GeolocationCoordinates | null;
      has_open_actions: boolean;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      // signature -> blob -> upload
      const res = await fetch(v.signature_png);
      const blob = await res.blob();
      const path = `${company.id}/${v.execution_id}/signature.png`;
      const { error: upErr } = await supabase.storage.from("inspection-files").upload(path, blob, { upsert: true, contentType: "image/png" });
      if (upErr) throw upErr;

      const status = v.has_open_actions ? "completed_with_issues" : "completed";
      const { error } = await supabase
        .from("inspection_executions")
        .update({
          status,
          completed_at: new Date().toISOString(),
          completed_by: profile.id,
          signature_url: path,
          signer_name: v.signer_name.trim(),
          signer_role: v.signer_role?.trim() || null,
          signed_at: new Date().toISOString(),
          signed_location_lat: v.location?.latitude ?? null,
          signed_location_lng: v.location?.longitude ?? null,
          signed_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        })
        .eq("id", v.execution_id);
      if (error) throw error;
      return status;
    },
    onSuccess: (status, v) => {
      qc.invalidateQueries({ queryKey: ["inspection-executions"] });
      qc.invalidateQueries({ queryKey: ["inspection-execution", v.execution_id] });
      toast({ title: status === "completed" ? "Inspeção concluída e assinada." : "Inspeção assinada com pendências abertas." });
    },
    onError: () => toast({ title: "Erro ao assinar inspeção.", variant: "destructive" }),
  });
}

// ── Open-or-create execution for QR flow ──

export function useOpenExecutionForAsset() {
  const qc = useQueryClient();
  const { company } = useAuth();
  return useMutation({
    mutationFn: async ({ assetId, modelId }: { assetId: string; modelId: string }) => {
      if (!company) throw new Error("Sem empresa");
      // Look for pending or in_progress execution for this asset+model
      const { data: existing } = await supabase
        .from("inspection_executions")
        .select("id, status")
        .eq("asset_id", assetId)
        .eq("model_id", modelId)
        .in("status", ["pending", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) return existing[0].id;

      // Fetch model info for reference
      const { data: model } = await supabase.from("inspection_models").select("name").eq("id", modelId).maybeSingle();
      const { data: asset } = await supabase.from("inspection_assets").select("tag_code, name").eq("id", assetId).maybeSingle();

      const ref = `${model?.name || "Inspeção"} — ${asset?.tag_code || ""} ${asset?.name || ""}`.trim();
      const today = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("inspection_executions")
        .insert({
          company_id: company.id,
          model_id: modelId,
          asset_id: assetId,
          reference: ref,
          due_date: today,
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["inspection-executions"] });
      return data.id;
    },
  });
}
