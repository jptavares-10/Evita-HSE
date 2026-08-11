import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate } from "../supabase";

export default defineTool({
  name: "list_epi_deliveries",
  title: "List EPI deliveries",
  description: "List recent PPE (EPI) deliveries with employee, item and quantity.",
  inputSchema: { limit: z.number().int().min(1).max(200).default(50) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    const { data, error } = await supabaseForUser(ctx)
      .from("epi_deliveries")
      .select("id,delivered_at,quantity,reason,employees(name),epi_types(name,unit)")
      .order("delivered_at", { ascending: false })
      .limit(limit);
    if (error) return errorResult(error.message);
    return textResult(data);
  },
});