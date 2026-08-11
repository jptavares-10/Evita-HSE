import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

export function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export function textResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
}

export function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

/** Base URL used to build deep links back into the app. */
export const APP_URL = "https://evita-hse-br.lovable.app";

export function deepLink(path: string) {
  return `${APP_URL}${path}`;
}

/**
 * Two-phase write confirmation.
 *
 * Write tools accept `confirm` (default false). Without it nothing is
 * persisted: the tool returns a draft preview that the assistant must show to
 * the user and get an explicit "yes" for, then re-call with `confirm: true`.
 */
export const confirmField = (what: string) =>
  `Set to true ONLY after the user has explicitly approved the draft. With false (default) nothing is saved — a draft preview of the ${what} is returned for review.`;

export function draftResult(kind: string, draft: Record<string, unknown>, hint: string) {
  return textResult({
    persisted: false,
    status: "draft_pending_confirmation",
    kind,
    draft,
    next_step: hint,
  });
}

/**
 * Write gate: the caller must have editor permission on the module,
 * validated server-side by the same RPC the app uses.
 */
export async function editorGate(ctx: ToolContext, module: string) {
  const { data, error } = await supabaseForUser(ctx).rpc("has_module_editor_permission", {
    p_module: module,
  });
  if (error) return errorResult(`Could not verify permissions: ${error.message}`);
  if (data !== true) {
    return errorResult(
      `You don't have editor permission on the "${module}" module, so this record was not created.`,
    );
  }
  return null;
}

/**
 * MCP/API access is an Enterprise-plan feature (trial included).
 * Returns an error result when the caller's company is not entitled, else null.
 */
export async function planGate(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
  const { data, error } = await supabaseForUser(ctx).rpc("get_company_access_status");
  const obj = data as any;
  if (error || !obj || obj.error) return errorResult("Could not verify the company plan.");
  if (obj.status === "expired") return errorResult("The company plan is expired. Renew it to use the API.");
  if (obj.plan !== "enterprise" && obj.status !== "trial") {
    return errorResult("Agent/API (MCP) access is available on the Enterprise plan only.");
  }
  return null;
}