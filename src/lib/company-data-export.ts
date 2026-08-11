import { supabase } from "@/integrations/supabase/client";

/**
 * Portabilidade (LGPD art. 18, V): exporta todos os dados da empresa
 * visíveis ao usuário autenticado em um único arquivo JSON.
 * As consultas respeitam as políticas de RLS — nada fora da empresa é retornado.
 */
const TABLES = [
  "companies",
  "profiles",
  "employees",
  "sectors",
  "job_positions",
  "periodic_services",
  "service_categories",
  "service_history",
  "service_attachments",
  "trainings",
  "training_matrix",
  "training_sector_rules",
  "employee_training_records",
  "aso_exam_types",
  "aso_records",
  "epi_types",
  "epi_deliveries",
  "epi_stock_movements",
  "occurrences",
  "occurrence_causes",
  "occurrence_employees",
  "occurrence_witnesses",
  "occurrence_bowtie",
  "occurrence_attachments",
  "corrective_actions",
  "inspection_models",
  "inspection_checklist_items",
  "inspection_assets",
  "inspection_executions",
  "inspection_execution_answers",
  "inspection_entries",
  "inspection_corrective_actions",
  "mtrs",
  "mtr_waste_items",
  "waste_categories",
  "environmental_licenses",
  "license_types",
  "license_renewals",
  "license_conditionants",
  "conditionant_compliances",
  "conditionant_evidence_files",
  "conditionant_document_links",
  "documents",
  "document_types",
  "document_revisions",
  "document_review_cycles",
  "document_review_assignments",
  "document_review_comments",
  "document_service_links",
  "suppliers",
  "supplier_categories",
  "supplier_folders",
  "supplier_documents",
  "calendar_events",
  "calendar_event_attachments",
  "user_permissions",
] as const;

export type ExportProgress = { current: number; total: number; table: string };

export async function exportCompanyData(onProgress?: (p: ExportProgress) => void) {
  const payload: Record<string, unknown> = {
    _meta: {
      generated_at: new Date().toISOString(),
      source: "Evita HSE — exportação de dados (portabilidade LGPD)",
      note:
        "Arquivos anexados (PDFs, fotos, assinaturas) não estão embutidos neste JSON; os caminhos de storage estão nos registros correspondentes.",
    },
  };

  for (let i = 0; i < TABLES.length; i++) {
    const table = TABLES[i];
    onProgress?.({ current: i + 1, total: TABLES.length, table });
    const { data, error } = await supabase.from(table as any).select("*").limit(5000);
    payload[table] = error ? { error: error.message } : data ?? [];
  }

  return payload;
}

export function downloadJson(payload: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}