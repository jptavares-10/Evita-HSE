import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "list_aso_records",
  title: "List ASO (occupational health) records",
  description:
    "List occupational health certificates (ASO) with employee, exam type, exam date, expiry and result for the signed-in user's company.",
  inputSchema: {
    expiring_within_days: z
      .number()
      .int()
      .min(1)
      .max(365)
      .optional()
      .describe("Only ASOs expiring within this many days (includes already expired)."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ expiring_within_days, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    let q = supabaseForUser(ctx)
      .from("aso_records")
      .select("id,exam_date,expires_at,result,doctor_name,employees(name),aso_exam_types(name)")
      .order("expires_at", { ascending: true })
      .limit(limit);
    if (expiring_within_days) {
      const until = new Date(Date.now() + expiring_within_days * 86400000).toISOString().slice(0, 10);
      q = q.lte("expires_at", until);
    }
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return textResult((data ?? []).map((r) => ({ ...r, url: deepLink("/aso") })));
  },
});
