import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPeriodicServices from "./tools/list-periodic-services";
import listOccurrences from "./tools/list-occurrences";
import listEnvironmentalLicenses from "./tools/list-environmental-licenses";
import listSuppliers from "./tools/list-suppliers";
import listEpiDeliveries from "./tools/list-epi-deliveries";
import getDashboardSummary from "./tools/get-dashboard-summary";

// VITE_SUPABASE_PROJECT_ID is inlined at build time by Vite, keeping this
// module import-safe (no runtime env read). The fallback keeps the issuer
// well-formed during the manifest-extract eval where tokens don't verify.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "evita-hse-mcp",
  title: "Evita HSE",
  version: "0.1.0",
  instructions:
    "Read-only access to the signed-in user's HSE data in Evita: periodic services, incidents (IC & NC), environmental licenses, suppliers, EPI deliveries, and a dashboard summary. All results are scoped to the user's company via Supabase RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getDashboardSummary,
    listPeriodicServices,
    listOccurrences,
    listEnvironmentalLicenses,
    listSuppliers,
    listEpiDeliveries,
  ],
});