import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "list_environmental_licenses",
  title: "List environmental licenses",
  description: "List environmental licenses (valid, expiring, expired or permanent) for the signed-in user's company.",
  inputSchema: { limit: z.number().int().min(1).max(200).default(50) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    const { data, error } = await supabaseForUser(ctx)
      .from("environmental_licenses")
      .select("id,license_number,title,issuing_body,sphere,issued_at,expires_at,has_expiry,status,alert_days_before")
      .order("expires_at", { ascending: true, nullsFirst: false })
      .limit(limit);
    if (error) return errorResult(error.message);
    return textResult((data ?? []).map((r) => ({ ...r, url: deepLink("/licencas") })));
  },
});
