import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "list_inspections",
  title: "List inspection executions",
  description:
    "List inspection executions with model, asset, due date, status and signature data for the signed-in user's company.",
  inputSchema: {
    status: z.string().optional().describe("Filter by execution status."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    let q = supabaseForUser(ctx)
      .from("inspection_executions")
      .select(
        "id,reference,due_date,status,completed_at,signed_at,signer_name,inspection_models(name,related_nr),inspection_assets(name,code)",
      )
      .order("due_date", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return textResult((data ?? []).map((r) => ({ ...r, url: deepLink(`/inspecoes/execucoes/${r.id}`) })));
  },
});
