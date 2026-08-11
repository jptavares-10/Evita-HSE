import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, errorResult, planGate, deepLink } from "../supabase";

export default defineTool({
  name: "search_records",
  title: "Search HSE records",
  description:
    "Cross-module free-text search over periodic services, incidents, environmental licenses, documents, suppliers and employees. Returns the record type, a label and a deep link into the app.",
  inputSchema: {
    query: z.string().describe("Free text to search for."),
    limit_per_module: z.number().int().min(1).max(20).default(5),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit_per_module }, ctx) => {
    const denied = await planGate(ctx);
    if (denied) return denied;
    const sb = supabaseForUser(ctx);
    const like = `%${query}%`;
    const n = limit_per_module;

    const [srv, occ, lic, doc, sup, emp] = await Promise.all([
      sb.from("periodic_services").select("id,name,next_due_at").ilike("name", like).limit(n),
      sb.from("occurrences").select("id,description,type,occurred_at").ilike("description", like).limit(n),
      sb.from("environmental_licenses").select("id,license_number,title,expires_at").or(`license_number.ilike.${like},title.ilike.${like}`).limit(n),
      sb.from("documents").select("id,code,title").or(`code.ilike.${like},title.ilike.${like}`).limit(n),
      sb.from("suppliers_safe").select("id,name").ilike("name", like).limit(n),
      sb.from("employees").select("id,name").ilike("name", like).limit(n),
    ]);

    const firstError = [srv, occ, lic, doc, sup, emp].find((r) => r.error)?.error;
    if (firstError) return errorResult(firstError.message);

    return textResult([
      ...(srv.data ?? []).map((r) => ({ type: "periodic_service", label: r.name, detail: `Vence em ${r.next_due_at}`, url: deepLink("/servicos") })),
      ...(occ.data ?? []).map((r) => ({ type: "occurrence", label: r.description?.slice(0, 120), detail: `${r.type} — ${r.occurred_at}`, url: deepLink("/incidentes") })),
      ...(lic.data ?? []).map((r) => ({ type: "environmental_license", label: r.title ?? r.license_number, detail: `Validade ${r.expires_at ?? "permanente"}`, url: deepLink("/licencas") })),
      ...(doc.data ?? []).map((r) => ({ type: "document", label: `${r.code} — ${r.title}`, url: deepLink("/documentos") })),
      ...(sup.data ?? []).map((r) => ({ type: "supplier", label: r.name, url: deepLink("/fornecedores") })),
      ...(emp.data ?? []).map((r) => ({ type: "employee", label: r.name, url: deepLink("/treinamentos/colaboradores") })),
    ]);
  },
});
