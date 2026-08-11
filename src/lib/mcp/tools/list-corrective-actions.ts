import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "list_corrective_actions",
  title: "List corrective actions",
  description:
    "List corrective actions from incident investigations (5W2H) and from inspections, with description, responsible, due date and status.",
  inputSchema: {
    open_only: z.boolean().default(true).describe("Only actions that are not completed."),
    source: z.string().optional().describe("'occurrence' or 'inspection' to restrict the origin."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ open_only, source, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    const sb = supabaseForUser(ctx);
    const out: Array<Record<string, unknown>> = [];

    if (source !== "inspection") {
      let q = sb
        .from("corrective_actions")
        .select("id,description,status,due_date,why,how_method,occurrence_id,completed_at")
        .order("due_date", { ascending: true })
        .limit(limit);
      if (open_only) q = q.neq("status", "completed");
      const { data, error } = await q;
      if (error) return errorResult(error.message);
      out.push(...(data ?? []).map((r) => ({ ...r, source: "occurrence", url: deepLink("/incidentes") })));
    }

    if (source !== "occurrence") {
      let q = sb
        .from("inspection_corrective_actions")
        .select("id,description,status,due_date,priority,responsible_name,execution_id,completed_at")
        .order("due_date", { ascending: true })
        .limit(limit);
      if (open_only) q = q.neq("status", "completed");
      const { data, error } = await q;
      if (error) return errorResult(error.message);
      out.push(...(data ?? []).map((r) => ({ ...r, source: "inspection", url: deepLink("/inspecoes/execucoes") })));
    }

    return textResult(out.slice(0, limit));
  },
});
