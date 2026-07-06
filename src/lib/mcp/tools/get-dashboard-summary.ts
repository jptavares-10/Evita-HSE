import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, textResult, errorResult } from "../supabase";

export default defineTool({
  name: "get_dashboard_summary",
  title: "HSE dashboard summary",
  description: "Summary counts of open incidents, expiring services, expiring licenses, and active suppliers for the signed-in user's company.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const sb = supabaseForUser(ctx);
    const [occ, srv, lic, sup] = await Promise.all([
      sb.from("occurrences").select("id", { count: "exact", head: true }).neq("status", "closed"),
      sb.from("periodic_services").select("id", { count: "exact", head: true }).in("status", ["warning", "expired"]).eq("is_active", true),
      sb.from("environmental_licenses").select("id", { count: "exact", head: true }).neq("status", "vigente"),
      sb.from("suppliers_safe").select("id", { count: "exact", head: true }),
    ]);
    return textResult({
      open_incidents: occ.count ?? 0,
      services_needing_attention: srv.count ?? 0,
      licenses_needing_attention: lic.count ?? 0,
      suppliers_total: sup.count ?? 0,
    });
  },
});