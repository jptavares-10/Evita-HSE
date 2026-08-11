import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, textResult, errorResult, planGate } from "../supabase";

export default defineTool({
  name: "get_dashboard_summary",
  title: "HSE dashboard summary",
  description:
    "Summary counts for the signed-in user's company: open incidents, services and licenses needing attention, overdue CDFs, open corrective actions, deadlines in the next 30 days and total suppliers.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    const sb = supabaseForUser(ctx);
    const today = new Date().toISOString().slice(0, 10);
    const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const soon = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    const [occ, srv, lic, sup, cdf, act, due] = await Promise.all([
      sb.from("occurrences").select("id", { count: "exact", head: true }).neq("status", "closed"),
      sb
        .from("periodic_services")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .lte("next_due_at", soon),
      sb
        .from("environmental_licenses")
        .select("id", { count: "exact", head: true })
        .eq("has_expiry", true)
        .lte("expires_at", in30),
      sb.from("suppliers_safe").select("id", { count: "exact", head: true }),
      sb
        .from("mtrs")
        .select("id", { count: "exact", head: true })
        .neq("cdf_status", "received")
        .lt("cdf_deadline_at", today),
      sb.from("corrective_actions").select("id", { count: "exact", head: true }).neq("status", "completed"),
      sb.from("calendar_due_items").select("source_id", { count: "exact", head: true }).lte("due_date", in30),
    ]);

    const err = [occ, srv, lic, sup, cdf, act, due].find((r) => r.error)?.error;
    if (err) return errorResult(err.message);

    return textResult({
      open_incidents: occ.count ?? 0,
      services_needing_attention: srv.count ?? 0,
      licenses_expiring_30d: lic.count ?? 0,
      overdue_cdf: cdf.count ?? 0,
      open_corrective_actions: act.count ?? 0,
      deadlines_next_30d: due.count ?? 0,
      suppliers_total: sup.count ?? 0,
    });
  },
});
