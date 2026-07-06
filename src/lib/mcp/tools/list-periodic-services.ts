import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult } from "../supabase";

export default defineTool({
  name: "list_periodic_services",
  title: "List periodic services",
  description: "List HSE periodic services for the signed-in user's company (name, category, next due date, status).",
  inputSchema: {
    status: z.enum(["ok", "warning", "expired", "all"]).optional().describe("Filter by compliance status."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("periodic_services")
      .select("id,name,category_id,next_due_date,status,is_active")
      .order("next_due_date", { ascending: true })
      .limit(limit);
    if (status && status !== "all") query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return textResult(data);
  },
});