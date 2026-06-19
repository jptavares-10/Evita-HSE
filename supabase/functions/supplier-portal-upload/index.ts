import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const formData = await req.formData();
    const token = formData.get("token") as string;
    const file = formData.get("file") as File;
    const description = formData.get("description") as string;
    const referenceName = formData.get("reference_name") as string | null;
    const folderId = formData.get("folder_id") as string | null;

    if (!token || !file || !description) {
      return new Response(
        JSON.stringify({ success: false, error: "Campos obrigatórios: token, file, description" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side file type validation (allowlist) + size limit
    const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
    const ALLOWED_MIME: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    const extCheck = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extCheck)) {
      return new Response(
        JSON.stringify({ success: false, error: "Tipo de arquivo não permitido. Use PDF, JPG, PNG, DOC ou DOCX." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ success: false, error: "Arquivo excede o limite de 20MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate supplier token
    const { data: supplier, error: supErr } = await supabase
      .from("suppliers")
      .select("id, company_id, portal_enabled, status")
      .eq("portal_token", token)
      .eq("portal_enabled", true)
      .eq("status", "active")
      .maybeSingle();

    if (supErr || !supplier) {
      return new Response(
        JSON.stringify({ success: false, error: "Link inválido ou desativado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check plan
    const { data: company } = await supabase
      .from("companies")
      .select("plan")
      .eq("id", supplier.company_id)
      .single();

    if (company?.plan === "expired") {
      return new Response(
        JSON.stringify({ success: false, error: "O portal está temporariamente indisponível. Entre em contato com a empresa contratante." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upload file to storage
    const folderPath = folderId && folderId !== "root" ? folderId : "root";
    const filePath = `${supplier.company_id}/${supplier.id}/${folderPath}/${Date.now()}_${file.name}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("supplier-documents")
      .upload(filePath, arrayBuffer, {
        contentType: ALLOWED_MIME[extCheck],
        upsert: false,
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao fazer upload do arquivo: " + uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Register document in database
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const { error: insertError } = await supabase
      .from("supplier_documents")
      .insert({
        supplier_id: supplier.id,
        company_id: supplier.company_id,
        folder_id: folderId && folderId !== "root" ? folderId : null,
        description: description,
        reference_name: referenceName || null,
        file_url: filePath,
        file_name: file.name,
        file_type: ext,
        uploaded_by_supplier: true,
      });

    if (insertError) {
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao registrar documento: " + insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno: " + (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
