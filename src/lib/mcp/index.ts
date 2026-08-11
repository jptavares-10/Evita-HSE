import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getDashboardSummary from "./tools/get-dashboard-summary";
import getUpcomingDeadlines from "./tools/get-upcoming-deadlines";
import getHseIndicators from "./tools/get-hse-indicators";
import searchRecords from "./tools/search-records";
import listPeriodicServices from "./tools/list-periodic-services";
import listOccurrences from "./tools/list-occurrences";
import listEnvironmentalLicenses from "./tools/list-environmental-licenses";
import listConditionants from "./tools/list-conditionants";
import listSuppliers from "./tools/list-suppliers";
import listEpiDeliveries from "./tools/list-epi-deliveries";
import listTrainingCompliance from "./tools/list-training-compliance";
import listAsoRecords from "./tools/list-aso-records";
import listMtrs from "./tools/list-mtrs";
import listCalendarEvents from "./tools/list-calendar-events";
import listCorrectiveActions from "./tools/list-corrective-actions";
import listInspections from "./tools/list-inspections";
import listDocuments from "./tools/list-documents";
import createOccurrence from "./tools/create-occurrence";
import createCalendarEvent from "./tools/create-calendar-event";
import createCorrectiveAction from "./tools/create-corrective-action";
import registerServiceCompletion from "./tools/register-service-completion";

// VITE_SUPABASE_PROJECT_ID is inlined at build time by Vite, keeping this
// module import-safe (no runtime env read). The fallback keeps the issuer
// well-formed during the manifest-extract eval where tokens don't verify.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "evita-hse-mcp",
  title: "Evita HSE",
  version: "0.2.0",
  instructions:
    "Access to the signed-in user's HSE data in Evita: periodic services, incidents (IC & NC), environmental licenses and conditionants, suppliers, EPI deliveries, trainings, ASO, MTR, inspections, documents, calendar and consolidated deadlines. Use `get_upcoming_deadlines` for anything about due dates, `get_hse_indicators` for TF/TG safety rates and `search_records` to locate a record and get a deep link. Write tools (create_occurrence, create_calendar_event, create_corrective_action, register_service_completion) require editor permission on the module and always confirm with the user first. All results are scoped to the user's company via Supabase RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getDashboardSummary,
    getUpcomingDeadlines,
    getHseIndicators,
    searchRecords,
    listPeriodicServices,
    listOccurrences,
    listCorrectiveActions,
    listEnvironmentalLicenses,
    listConditionants,
    listMtrs,
    listInspections,
    listDocuments,
    listTrainingCompliance,
    listAsoRecords,
    listEpiDeliveries,
    listSuppliers,
    listCalendarEvents,
    createOccurrence,
    createCalendarEvent,
    createCorrectiveAction,
    registerServiceCompletion,
  ],
});
