import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate } from "../supabase";

export default defineTool({
  name: "list_suppliers",
  title: "List suppliers",
  description: "List suppliers registered by the signed-in user's company.",
  inputSchema: {
    search: z.string().optional().describe("Substring match on supplier name."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    let q = supabaseForUser(ctx)
      .from("suppliers_safe")
      .select("*")
      .order("name", { ascending: true })
      .limit(limit);
    if (search) q = q.ilike("name", `%${search}%`);
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return textResult(data);
  },
});