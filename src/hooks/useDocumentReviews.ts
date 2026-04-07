import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/* ── Queries ── */

export function useCompanyProfiles() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["company-profiles", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, role")
        .eq("company_id", company.id)
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useDocumentReviewCycles(documentId: string | null) {
  return useQuery({
    queryKey: ["review-cycles", documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const { data, error } = await supabase
        .from("document_review_cycles")
        .select("*, profiles:created_by(full_name, avatar_url), approver:approved_by(full_name)")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!documentId,
  });
}

export function useReviewAssignments(cycleId: string | null) {
  return useQuery({
    queryKey: ["review-assignments", cycleId],
    queryFn: async () => {
      if (!cycleId) return [];
      const { data, error } = await supabase
        .from("document_review_assignments")
        .select("*, profiles:reviewer_id(id, full_name, email, avatar_url)")
        .eq("cycle_id", cycleId)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!cycleId,
  });
}

export function useReviewComments(cycleId: string | null) {
  return useQuery({
    queryKey: ["review-comments", cycleId],
    queryFn: async () => {
      if (!cycleId) return [];
      const { data, error } = await supabase
        .from("document_review_comments")
        .select("*, profiles:author_id(full_name, avatar_url), resolver:resolved_by(full_name)")
        .eq("cycle_id", cycleId)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!cycleId,
  });
}

/** Pending assignments for current user across all documents */
export function useMyPendingReviews() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["my-pending-reviews", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("document_review_assignments")
        .select(`
          *,
          document_review_cycles(
            id, title, status, due_date, message, require_all_responses, comments_visible, created_at,
            profiles:created_by(full_name, avatar_url),
            documents(id, code, title, status, current_file_url, current_file_name, current_revision, current_revision_date),
            document_revisions:revision_id(id, revision_number, revision_date, file_url, file_name)
          )
        `)
        .eq("reviewer_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile,
  });
}

export function useMyPendingReviewCount() {
  const { data: reviews = [] } = useMyPendingReviews();
  return reviews.filter((r: any) => r.status === "pending" && (r.document_review_cycles?.status === "open" || r.document_review_cycles?.status === "reviewing")).length;
}

/** Cycles where current user is the author and all reviewers responded */
export function useAuthorNotifications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["author-notifications", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data: cycles, error } = await supabase
        .from("document_review_cycles")
        .select("id, title, document_id, status, documents(title, code)")
        .eq("created_by", profile.id)
        .in("status", ["open", "reviewing"]);
      if (error) throw error;
      if (!cycles?.length) return [];

      const results: any[] = [];
      for (const cycle of cycles) {
        const { data: assignments } = await supabase
          .from("document_review_assignments")
          .select("status")
          .eq("cycle_id", cycle.id);
        if (assignments && assignments.length > 0) {
          const allResponded = assignments.every((a: any) => a.status !== "pending" && a.status !== "read");
          if (allResponded) results.push(cycle);
        }
      }
      return results;
    },
    enabled: !!profile,
  });
}

/* ── Mutations ── */

export function useStartReviewCycle() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      documentId: string;
      revisionId: string;
      title: string;
      reviewerIds: string[];
      dueDate: string | null;
      message: string | null;
      requireAllResponses: boolean;
      commentsVisible: boolean;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      const { data: cycle, error } = await supabase
        .from("document_review_cycles")
        .insert({
          company_id: company.id,
          document_id: values.documentId,
          revision_id: values.revisionId,
          title: values.title,
          due_date: values.dueDate,
          message: values.message,
          require_all_responses: values.requireAllResponses,
          comments_visible: values.commentsVisible,
          created_by: profile.id,
        })
        .select("id")
        .single();
      if (error) throw error;

      const assignments = values.reviewerIds.map((rid) => ({
        cycle_id: cycle.id,
        company_id: company.id,
        reviewer_id: rid,
      }));
      const { error: assErr } = await supabase.from("document_review_assignments").insert(assignments);
      if (assErr) throw assErr;

      return { cycleId: cycle.id, count: values.reviewerIds.length };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["review-cycles"] });
      qc.invalidateQueries({ queryKey: ["my-pending-reviews"] });
      toast({ title: `Ciclo de revisão iniciado. ${res.count} revisores foram notificados.` });
    },
    onError: () => {
      toast({ title: "Erro ao iniciar ciclo de revisão.", variant: "destructive" });
    },
  });
}

export function useSubmitReviewResponse() {
  const qc = useQueryClient();
  const { company, profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: {
      assignmentId: string;
      cycleId: string;
      decision: "approved" | "rejected";
      content: string;
      file?: File | null;
    }) => {
      if (!company || !profile) throw new Error("Sem empresa");

      let attachmentUrl: string | null = null;
      let attachmentName: string | null = null;
      if (values.file) {
        const ext = values.file.name.split(".").pop();
        const ts = Date.now();
        const path = `${company.id}/${values.cycleId}/${values.assignmentId}/${ts}.${ext}`;
        const { error: upErr } = await supabase.storage.from("review-attachments").upload(path, values.file, { upsert: true });
        if (upErr) throw upErr;
        attachmentUrl = path;
        attachmentName = values.file.name;
      }

      if (values.content || attachmentUrl) {
        const { error: cmtErr } = await supabase.from("document_review_comments").insert({
          cycle_id: values.cycleId,
          assignment_id: values.assignmentId,
          company_id: company.id,
          author_id: profile.id,
          content: values.content || (values.decision === "approved" ? "Aprovado" : "Solicitação de modificação"),
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          comment_type: values.decision === "approved" ? "approval" : "modification",
        });
        if (cmtErr) throw cmtErr;
      }

      const { error: updErr } = await supabase
        .from("document_review_assignments")
        .update({
          status: values.decision,
          responded_at: new Date().toISOString(),
        })
        .eq("id", values.assignmentId);
      if (updErr) throw updErr;

      // Update cycle status to 'reviewing' if first response
      const { data: cycle } = await supabase
        .from("document_review_cycles")
        .select("status")
        .eq("id", values.cycleId)
        .single();
      if (cycle && cycle.status === "open") {
        await supabase
          .from("document_review_cycles")
          .update({ status: "reviewing", updated_at: new Date().toISOString() })
          .eq("id", values.cycleId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-assignments"] });
      qc.invalidateQueries({ queryKey: ["review-comments"] });
      qc.invalidateQueries({ queryKey: ["review-cycles"] });
      qc.invalidateQueries({ queryKey: ["my-pending-reviews"] });
      qc.invalidateQueries({ queryKey: ["author-notifications"] });
      toast({ title: "Resposta enviada com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro ao enviar resposta.", variant: "destructive" });
    },
  });
}

export function useConfirmRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("document_review_assignments")
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-assignments"] });
      qc.invalidateQueries({ queryKey: ["my-pending-reviews"] });
    },
  });
}

export function useApproveCycle() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: { cycleId: string; comment?: string }) => {
      if (!profile) throw new Error("Sem perfil");
      const { error } = await supabase
        .from("document_review_cycles")
        .update({
          status: "approved",
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", values.cycleId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-cycles"] });
      qc.invalidateQueries({ queryKey: ["my-pending-reviews"] });
      qc.invalidateQueries({ queryKey: ["author-notifications"] });
      toast({ title: "Revisão aprovada." });
    },
    onError: () => {
      toast({ title: "Erro ao aprovar revisão.", variant: "destructive" });
    },
  });
}

export function useRejectCycle() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: { cycleId: string; reason: string }) => {
      if (!profile) throw new Error("Sem perfil");
      const { error } = await supabase
        .from("document_review_cycles")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", values.cycleId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-cycles"] });
      qc.invalidateQueries({ queryKey: ["my-pending-reviews"] });
      qc.invalidateQueries({ queryKey: ["author-notifications"] });
      toast({ title: "Revisão reprovada. Envie uma nova revisão quando estiver pronta." });
    },
    onError: () => {
      toast({ title: "Erro ao reprovar revisão.", variant: "destructive" });
    },
  });
}

export function useCancelCycle() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (cycleId: string) => {
      const { error } = await supabase
        .from("document_review_cycles")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", cycleId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-cycles"] });
      qc.invalidateQueries({ queryKey: ["my-pending-reviews"] });
      toast({ title: "Ciclo de revisão cancelado." });
    },
    onError: () => {
      toast({ title: "Erro ao cancelar ciclo.", variant: "destructive" });
    },
  });
}

export function useResolveComment() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (values: { commentId: string; notes?: string }) => {
      if (!profile) throw new Error("Sem perfil");
      const { error } = await supabase
        .from("document_review_comments")
        .update({
          is_resolved: true,
          resolved_by: profile.id,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", values.commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-comments"] });
      toast({ title: "Comentário marcado como resolvido." });
    },
    onError: () => {
      toast({ title: "Erro ao resolver comentário.", variant: "destructive" });
    },
  });
}
