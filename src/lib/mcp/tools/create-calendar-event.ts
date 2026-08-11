import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, editorGate, deepLink } from "../supabase";

export default defineTool({
  name: "create_calendar_event",
  title: "Create calendar event",
  description:
    "Create an HSE calendar entry (event, campaign, audit, meeting or internal training). Requires editor permission on the calendar module.",
  inputSchema: {
    title: z.string().describe("Event title."),
    area: z.enum(["meio_ambiente", "seguranca", "saude", "geral"]).describe("HSE area."),
    category: z
      .enum(["evento", "campanha", "auditoria", "reuniao", "treinamento_interno", "outro"])
      .describe("Event category."),
    starts_at: z.string().describe("Start date/time (YYYY-MM-DD or ISO timestamp)."),
    ends_at: z.string().optional().describe("End date/time (YYYY-MM-DD or ISO timestamp)."),
    all_day: z.boolean().default(true),
    location: z.string().optional(),
    description: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const denied = (await planGate(ctx)) ?? (await editorGate(ctx, "calendar"));
    if (denied) return denied;
    const sb = supabaseForUser(ctx);
    const { data: companyId, error: cErr } = await sb.rpc("get_user_company_id");
    if (cErr || !companyId) return errorResult("Could not resolve the user's company.");
    const norm = (v: string) => (v.length === 10 ? `${v}T12:00:00Z` : v);
    const { data, error } = await sb
      .from("calendar_events")
      .insert({
        company_id: companyId as string,
        created_by: ctx.getUserId(),
        title: input.title,
        description: input.description ?? null,
        area: input.area,
        category: input.category,
        starts_at: norm(input.starts_at),
        ends_at: input.ends_at ? norm(input.ends_at) : null,
        all_day: input.all_day,
        location: input.location ?? null,
        status: "planejado",
      })
      .select("id,title,area,category,starts_at,status")
      .single();
    if (error) return errorResult(error.message);
    return textResult({ created: data, url: deepLink("/calendario") });
  },
});
