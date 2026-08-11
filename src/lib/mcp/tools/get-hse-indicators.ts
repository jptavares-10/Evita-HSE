import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate } from "../supabase";

export default defineTool({
  name: "get_hse_indicators",
  title: "HSE indicators (TF / TG)",
  description:
    "Safety indicators for a period: frequency rate (TF) and severity rate (TG) per one million man-hours, plus incident counts by type and severity and total lost days.",
  inputSchema: {
    from: z.string().describe("Period start date (YYYY-MM-DD)."),
    to: z.string().describe("Period end date (YYYY-MM-DD)."),
    man_hours: z
      .number()
      .optional()
      .describe("Man-hours worked in the period. If omitted, TF/TG are returned as null."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, to, man_hours }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    const { data, error } = await supabaseForUser(ctx)
      .from("occurrences")
      .select("id,type,severity,with_leave,lost_days,occurred_at,status")
      .gte("occurred_at", from)
      .lte("occurred_at", to);
    if (error) return errorResult(error.message);

    const rows = data ?? [];
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let lostDays = 0;
    let withLeave = 0;
    for (const r of rows) {
      byType[r.type ?? "unknown"] = (byType[r.type ?? "unknown"] ?? 0) + 1;
      bySeverity[r.severity ?? "unknown"] = (bySeverity[r.severity ?? "unknown"] ?? 0) + 1;
      lostDays += r.lost_days ?? 0;
      if (r.with_leave) withLeave += 1;
    }
    const round = (n: number) => Math.round(n * 100) / 100;
    return textResult({
      period: { from, to },
      man_hours: man_hours ?? null,
      total_occurrences: rows.length,
      lost_time_incidents: withLeave,
      total_lost_days: lostDays,
      by_type: byType,
      by_severity: bySeverity,
      open_occurrences: rows.filter((r) => r.status !== "closed").length,
      frequency_rate_tf: man_hours ? round((withLeave * 1_000_000) / man_hours) : null,
      severity_rate_tg: man_hours ? round((lostDays * 1_000_000) / man_hours) : null,
      formula: "TF = (acidentes com afastamento x 1.000.000) / HHT; TG = (dias perdidos x 1.000.000) / HHT",
    });
  },
});
