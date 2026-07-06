import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult } from "../supabase";

export default defineTool({
  name: "list_occurrences",
  title: "List incidents (IC & NC)",
  description: "List safety incidents and non-conformities for the signed-in user's company.",
  inputSchema: {
    type: z.string().optional().describe("Filter by occurrence type (e.g. 'incident', 'non_conformity')."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ type, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("occurrences")
      .select("id,description,type,severity,status,occurred_at,lost_days,location")
      .order("occurred_at", { ascending: false })
      .limit(limit);
    if (type) query = query.eq("type", type);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return textResult(data);
  },
});