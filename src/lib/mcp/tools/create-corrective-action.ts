import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, editorGate, deepLink } from "../supabase";

export default defineTool({
  name: "create_corrective_action",
  title: "Create corrective action (5W2H)",
  description:
    "Create a 5W2H corrective action linked to an existing occurrence. Requires editor permission on the IC & NC module.",
  inputSchema: {
    occurrence_id: z.string().describe("ID of the occurrence this action belongs to."),
    description: z.string().describe("What will be done (What)."),
    why: z.string().optional().describe("Why it will be done."),
    where_location: z.string().optional().describe("Where it will be done."),
    how_method: z.string().optional().describe("How it will be done."),
    due_date: z.string().optional().describe("Deadline (YYYY-MM-DD)."),
    control_hierarchy: z
      .enum(["elimination", "substitution", "engineering", "administrative", "ppe"])
      .optional()
      .describe("Hierarchy of controls level."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const denied = (await planGate(ctx)) ?? (await editorGate(ctx, "ic_nc"));
    if (denied) return denied;
    const sb = supabaseForUser(ctx);
    const { data: companyId, error: cErr } = await sb.rpc("get_user_company_id");
    if (cErr || !companyId) return errorResult("Could not resolve the user's company.");
    const { data: occ } = await sb
      .from("occurrences")
      .select("id")
      .eq("id", input.occurrence_id)
      .maybeSingle();
    if (!occ) return errorResult("Occurrence not found in your company.");
    const { data, error } = await sb
      .from("corrective_actions")
      .insert({
        company_id: companyId as string,
        occurrence_id: input.occurrence_id,
        created_by: ctx.getUserId(),
        description: input.description,
        why: input.why ?? null,
        where_location: input.where_location ?? null,
        how_method: input.how_method ?? null,
        due_date: input.due_date ?? null,
        control_hierarchy: input.control_hierarchy ?? null,
        status: "pending",
      })
      .select("id,description,due_date,status")
      .single();
    if (error) return errorResult(error.message);
    return textResult({ created: data, url: deepLink("/incidentes") });
  },
});
