import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "list_training_compliance",
  title: "Training compliance",
  description:
    "Mandatory-training compliance per employee: which required courses are ok, expiring, expired or missing, based on the training matrix for each job position.",
  inputSchema: {
    only_problems: z.boolean().default(false).describe("Return only expiring, expired or missing items."),
    limit: z.number().int().min(1).max(500).default(200).describe("Max rows of employee x training."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ only_problems, limit }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    const sb = supabaseForUser(ctx);
    const [emp, mat, trn, rec] = await Promise.all([
      sb.from("employees").select("id,name,job_position_id,status"),
      sb.from("training_matrix").select("job_position_id,training_id"),
      sb.from("trainings").select("id,name,has_expiry,alert_days_before"),
      sb.from("employee_training_records").select("employee_id,training_id,done_at,expires_at"),
    ]);
    const err = emp.error || mat.error || trn.error || rec.error;
    if (err) return errorResult(err.message);

    const trainings = new Map((trn.data ?? []).map((t) => [t.id, t]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows: Array<Record<string, unknown>> = [];
    for (const e of emp.data ?? []) {
      if (e.status && e.status !== "active") continue;
      const required = (mat.data ?? []).filter((m) => m.job_position_id === e.job_position_id);
      for (const r of required) {
        const t = trainings.get(r.training_id);
        if (!t) continue;
        const records = (rec.data ?? [])
          .filter((x) => x.employee_id === e.id && x.training_id === r.training_id)
          .sort((a, b) => (a.done_at < b.done_at ? 1 : -1));
        const latest = records[0];
        let status = "missing";
        if (latest) {
          if (!t.has_expiry || !latest.expires_at) status = "ok";
          else {
            const exp = new Date(latest.expires_at + "T00:00:00");
            const diff = Math.floor((exp.getTime() - today.getTime()) / 86400000);
            status = diff < 0 ? "expired" : diff <= (t.alert_days_before ?? 30) ? "warning" : "ok";
          }
        }
        if (only_problems && status === "ok") continue;
        rows.push({
          employee: e.name,
          training: t.name,
          status,
          done_at: latest?.done_at ?? null,
          expires_at: latest?.expires_at ?? null,
          url: deepLink("/treinamentos/colaboradores"),
        });
        if (rows.length >= limit) return textResult(rows);
      }
    }
    return textResult(rows);
  },
});
