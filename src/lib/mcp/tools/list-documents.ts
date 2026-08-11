import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "list_documents",
  title: "List library documents",
  description:
    "List documents in the HSE document library with code, title, type, current revision, status and next revision date.",
  inputSchema: {
    search: z.string().optional().describe("Substring match on code or title."),
    status: z.string().optional().describe("Filter by document status."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, status, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    let q = supabaseForUser(ctx)
      .from("documents")
      .select(
        "id,code,title,area,responsible,status,current_revision,current_revision_date,next_revision_at,document_types(name)",
      )
      .order("code", { ascending: true })
      .limit(limit);
    if (status) q = q.eq("status", status);
    if (search) q = q.or(`code.ilike.%${search}%,title.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return textResult((data ?? []).map((r) => ({ ...r, url: deepLink("/documentos") })));
  },
});
