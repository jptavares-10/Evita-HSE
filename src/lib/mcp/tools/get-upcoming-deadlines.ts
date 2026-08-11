import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "get_upcoming_deadlines",
  title: "Upcoming HSE deadlines",
  description:
    "All upcoming due dates across every module (periodic services, environmental licenses, license renewals, MTR/CDF, inspections, document reviews) for the signed-in user's company.",
  inputSchema: {
    days: z.number().int().min(1).max(365).default(30).describe("Look-ahead window in days."),
    include_overdue: z.boolean().default(true).describe("Include items already past due."),
    limit: z.number().int().min(1).max(200).default(100),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days, include_overdue, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const until = new Date(today.getTime() + days * 86400000);
    let q = supabaseForUser(ctx)
      .from("calendar_due_items")
      .select("source_module,source_id,title,subtitle,due_date,deep_link")
      .lte("due_date", iso(until))
      .order("due_date", { ascending: true })
      .limit(limit);
    if (!include_overdue) q = q.gte("due_date", iso(today));
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    const todayStr = iso(today);
    return textResult(
      (data ?? []).map((r) => ({
        ...r,
        overdue: r.due_date < todayStr,
        url: r.deep_link ? deepLink(r.deep_link) : null,
      })),
    );
  },
});
