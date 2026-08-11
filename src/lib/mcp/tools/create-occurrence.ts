import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  supabaseForUser,
  textResult,
  errorResult,
  planGate,
  editorGate,
  deepLink,
  draftResult,
  confirmField,
} from "../supabase";

export default defineTool({
  name: "create_occurrence",
  title: "Register incident / non-conformity",
  description:
    "Draft and then register an occurrence (incident, near miss, non-conformity or safety observation). Called without `confirm` it saves nothing and returns a draft for the user to review; call it again with confirm=true only after the user explicitly approves. The type cannot be changed afterwards. Requires editor permission on the IC & NC module.",
  inputSchema: {
    type: z
      .enum(["incident", "near_miss", "non_conformity", "safety_observation"])
      .describe("Occurrence type — immutable after creation."),
    severity: z.enum(["low", "medium", "high", "critical"]).describe("Severity level."),
    description: z.string().describe("What happened."),
    occurred_at: z.string().describe("Date it happened (YYYY-MM-DD)."),
    location: z.string().optional().describe("Where it happened."),
    with_leave: z.boolean().default(false).describe("Whether it caused time off work."),
    lost_days: z.number().int().min(0).optional().describe("Lost days, when there was time off work."),
    confirm: z.boolean().default(false).describe(confirmField("occurrence")),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const denied = (await planGate(ctx)) ?? (await editorGate(ctx, "ic_nc"));
    if (denied) return denied;

    const payload = {
      type: input.type,
      severity: input.severity,
      description: input.description,
      occurred_at: input.occurred_at,
      location: input.location ?? null,
      with_leave: input.with_leave,
      lost_days: input.with_leave ? input.lost_days ?? 0 : 0,
      status: "open",
    };

    if (!input.confirm) {
      return draftResult(
        "occurrence",
        payload,
        "Nothing was saved. Show this draft to the user, confirm the type (it cannot be changed later), and only after an explicit approval call create_occurrence again with the same fields plus confirm=true.",
      );
    }

    const sb = supabaseForUser(ctx);
    const { data: companyId, error: cErr } = await sb.rpc("get_user_company_id");
    if (cErr || !companyId) return errorResult("Could not resolve the user's company.");
    const { data, error } = await sb
      .from("occurrences")
      .insert({ ...payload, company_id: companyId as string, registered_by: ctx.getUserId() })
      .select("id,type,severity,occurred_at,status")
      .single();
    if (error) return errorResult(error.message);
    return textResult({ persisted: true, created: data, url: deepLink("/incidentes") });
  },
});
