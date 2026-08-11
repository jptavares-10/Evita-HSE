import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

function statusOf(nextDueAt: string | null, alertDaysBefore: number | null) {
  if (!nextDueAt) return "unknown";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((new Date(nextDueAt + "T00:00:00").getTime() - today.getTime()) / 86400000);
  if (diff < 0) return "expired";
  if (diff <= (alertDaysBefore ?? 30)) return "warning";
  return "ok";
}

export default defineTool({
  name: "list_periodic_services",
  title: "List periodic services",
  description:
    "List HSE periodic services for the signed-in user's company (name, category, last done, next due date and compliance status).",
  inputSchema: {
    status: z.enum(["ok", "warning", "expired", "all"]).optional().describe("Filter by compliance status."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    const { data, error } = await supabaseForUser(ctx)
      .from("periodic_services")
      .select("id,name,last_done_at,next_due_at,alert_days_before,supplier,status,service_categories(name)")
      .eq("status", "active")
      .order("next_due_at", { ascending: true })
      .limit(200);
    if (error) return errorResult(error.message);
    let rows = (data ?? []).map((r) => ({
      ...r,
      compliance_status: statusOf(r.next_due_at, r.alert_days_before),
      url: deepLink("/servicos"),
    }));
    if (status && status !== "all") rows = rows.filter((r) => r.compliance_status === status);
    return textResult(rows.slice(0, limit));
  },
});
