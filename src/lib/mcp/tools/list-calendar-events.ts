import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "list_calendar_events",
  title: "List calendar events",
  description:
    "List HSE calendar entries created by the company (events, campaigns, audits, meetings, internal trainings) with area, date and status.",
  inputSchema: {
    from: z.string().optional().describe("Start date (YYYY-MM-DD). Defaults to today."),
    to: z.string().optional().describe("End date (YYYY-MM-DD)."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, to, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    const start = from ?? new Date().toISOString().slice(0, 10);
    let q = supabaseForUser(ctx)
      .from("calendar_events")
      .select("id,title,description,area,category,status,starts_at,ends_at,all_day,location")
      .gte("starts_at", `${start}T00:00:00Z`)
      .order("starts_at", { ascending: true })
      .limit(limit);
    if (to) q = q.lte("starts_at", `${to}T23:59:59Z`);
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return textResult((data ?? []).map((r) => ({ ...r, url: deepLink("/calendario") })));
  },
});
