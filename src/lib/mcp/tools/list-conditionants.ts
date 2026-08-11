import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "list_conditionants",
  title: "List license conditionants",
  description:
    "List environmental-license conditionants with deadline type, due date, criticality, status and latest compliance evidence.",
  inputSchema: {
    status: z.string().optional().describe("Filter by conditionant status."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    let q = supabaseForUser(ctx)
      .from("license_conditionants")
      .select(
        "id,item_code,description,criticality,deadline_type,due_date,recurrence,status,environmental_licenses(license_number,title),conditionant_compliances(fulfilled_at,protocol_number)",
      )
      .order("due_date", { ascending: true })
      .limit(limit);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return textResult((data ?? []).map((r) => ({ ...r, url: deepLink("/licencas/condicionantes") })));
  },
});
