import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "list_mtrs",
  title: "List MTRs (waste manifests)",
  description:
    "List waste transport manifests (MTR) with number, transporter, issue date, CDF status and CDF deadline for the signed-in user's company.",
  inputSchema: {
    pending_cdf_only: z.boolean().default(false).describe("Only MTRs whose CDF has not been received yet."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ pending_cdf_only, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    let q = supabaseForUser(ctx)
      .from("mtrs")
      .select(
        "id,mtr_number,transporter,issued_at,cdf_deadline_at,cdf_status,cdf_number,cdf_received_at,mtr_waste_items(quantity_tons,waste_categories(name))",
      )
      .order("issued_at", { ascending: false })
      .limit(limit);
    if (pending_cdf_only) q = q.neq("cdf_status", "received");
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    const today = new Date().toISOString().slice(0, 10);
    return textResult(
      (data ?? []).map((r) => ({
        ...r,
        cdf_overdue: r.cdf_status !== "received" && r.cdf_deadline_at < today,
        url: deepLink("/mtr"),
      })),
    );
  },
});
