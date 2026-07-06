import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult } from "../supabase";

export default defineTool({
  name: "list_environmental_licenses",
  title: "List environmental licenses",
  description: "List environmental licenses (expiring, valid, expired) for the signed-in user's company.",
  inputSchema: { limit: z.number().int().min(1).max(200).default(50) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("environmental_licenses")
      .select("id,license_number,issuing_body,issued_at,expires_at,status")
      .order("expires_at", { ascending: true })
      .limit(limit);
    if (error) return errorResult(error.message);
    return textResult(data);
  },
});