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

    const { token, file_path } = await req.json();

    if (!token || !file_path) {
      return new Response(
        JSON.stringify({ success: false, error: "Campos obrigatórios: token, file_path" }),
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

    // Verify the file belongs to this supplier (path starts with company_id/supplier_id)
    const expectedPrefix = `${supplier.company_id}/${supplier.id}/`;
    const cleanPath = file_path.startsWith("http")
      ? extractPath(file_path)
      : file_path;

    if (!cleanPath.startsWith(expectedPrefix)) {
      return new Response(
        JSON.stringify({ success: false, error: "Acesso negado ao arquivo" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from("supplier-documents")
      .createSignedUrl(cleanPath, 3600);

    if (error || !data?.signedUrl) {
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao gerar URL: " + (error?.message || "unknown") }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, signed_url: data.signedUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno: " + (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractPath(url: string): string {
  const marker = "/storage/v1/object/public/supplier-documents/";
  const idx = url.indexOf(marker);
  if (idx !== -1) return decodeURIComponent(url.substring(idx + marker.length));
  const signMarker = "/storage/v1/object/sign/supplier-documents/";
  const signIdx = url.indexOf(signMarker);
  if (signIdx !== -1) {
    const after = url.substring(signIdx + signMarker.length);
    return decodeURIComponent(after.split("?")[0]);
  }
  return url;
}
