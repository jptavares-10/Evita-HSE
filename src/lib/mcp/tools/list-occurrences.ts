import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "list_occurrences",
  title: "List incidents (IC & NC)",
  description:
    "List incidents, near misses, non-conformities and safety observations for the signed-in user's company.",
  inputSchema: {
    type: z
      .enum(["incident", "near_miss", "non_conformity", "safety_observation"])
      .optional()
      .describe("Filter by occurrence type."),
    open_only: z.boolean().default(false).describe("Only occurrences that are not closed."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ type, open_only, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    let query = supabaseForUser(ctx)
      .from("occurrences")
      .select(
        "id,description,type,severity,status,occurred_at,lost_days,with_leave,location,cat_required,cat_number,investigation_method",
      )
      .order("occurred_at", { ascending: false })
      .limit(limit);
    if (type) query = query.eq("type", type);
    if (open_only) query = query.neq("status", "closed");
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return textResult((data ?? []).map((r) => ({ ...r, url: deepLink("/incidentes") })));
  },
});
