import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, editorGate, deepLink } from "../supabase";

const PRESET_DAYS: Record<string, number> = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  semiannual: 180,
  annual: 365,
};

function frequencyDays(type: string, preset: string | null, custom: number | null) {
  if (type === "custom" && custom) return custom;
  if (type === "fixed" && preset && PRESET_DAYS[preset]) return PRESET_DAYS[preset];
  return 30;
}

export default defineTool({
  name: "register_service_completion",
  title: "Register periodic service completion",
  description:
    "Record that a periodic service was performed and recalculate its next due date from the service frequency. Requires editor permission on the periodic services module.",
  inputSchema: {
    service_id: z.string().describe("ID of the periodic service."),
    done_at: z.string().describe("Date it was performed (YYYY-MM-DD)."),
    supplier: z.string().optional().describe("Supplier/provider that performed it."),
    notes: z.string().optional(),
    realization_type: z
      .enum(["scheduled", "corrective"])
      .default("scheduled")
      .describe("'scheduled' when done as planned, 'corrective' when triggered by a failure."),
    failure_description: z.string().optional().describe("Failure description for corrective completions."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  needsApproval: true,
  handler: async (input, ctx) => {
    const denied = (await planGate(ctx)) ?? (await editorGate(ctx, "periodic_services"));
    if (denied) return denied;
    const sb = supabaseForUser(ctx);
    const { data: svc, error: sErr } = await sb
      .from("periodic_services")
      .select("id,company_id,name,frequency_type,frequency_preset,frequency_days,supplier")
      .eq("id", input.service_id)
      .maybeSingle();
    if (sErr) return errorResult(sErr.message);
    if (!svc) return errorResult("Periodic service not found in your company.");

    const days = frequencyDays(svc.frequency_type, svc.frequency_preset, svc.frequency_days);
    const next = new Date(new Date(`${input.done_at}T00:00:00Z`).getTime() + days * 86400000)
      .toISOString()
      .slice(0, 10);

    const { data: hist, error: hErr } = await sb
      .from("service_history")
      .insert({
        service_id: svc.id,
        company_id: svc.company_id,
        done_at: input.done_at,
        supplier: input.supplier ?? svc.supplier ?? null,
        notes: input.notes ?? null,
        registered_by: ctx.getUserId(),
        realization_type: input.realization_type,
        failure_description:
          input.realization_type === "corrective" ? input.failure_description ?? null : null,
      })
      .select("id")
      .single();
    if (hErr) return errorResult(hErr.message);

    const { error: uErr } = await sb
      .from("periodic_services")
      .update({
        last_done_at: input.done_at,
        next_due_at: next,
        updated_at: new Date().toISOString(),
        ...(input.supplier ? { supplier: input.supplier } : {}),
      })
      .eq("id", svc.id);
    if (uErr) return errorResult(uErr.message);

    return textResult({
      service: svc.name,
      history_id: hist.id,
      done_at: input.done_at,
      next_due_at: next,
      url: deepLink("/servicos"),
    });
  },
});
