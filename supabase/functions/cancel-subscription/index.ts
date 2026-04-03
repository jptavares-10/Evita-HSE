import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("company_id, role")
      .eq("id", userData.user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Perfil não encontrado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Apenas administradores podem cancelar assinaturas" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("stripe_subscription_id, plan, plan_expires_at")
      .eq("id", profile.company_id)
      .single();

    if (!company || company.plan === "trial") {
      return new Response(JSON.stringify({ error: "Nenhuma assinatura ativa encontrada" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Case 1: Has Stripe subscription — cancel at period end
    if (company.stripe_subscription_id) {
      logStep("Cancelling at period end", { subscriptionId: company.stripe_subscription_id });

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      const subscription = await stripe.subscriptions.update(company.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      const cancelAt = subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

      await supabaseAdmin
        .from("companies")
        .update({ subscription_cancel_at: cancelAt })
        .eq("id", profile.company_id);

      logStep("Subscription scheduled for cancellation", { cancelAt });

      return new Response(JSON.stringify({ success: true, cancel_at: cancelAt }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Case 2: No Stripe subscription — plan was activated manually
    // Set plan to expire immediately (grace period logic handles the rest)
    logStep("No Stripe subscription, expiring plan directly", { companyId: profile.company_id });

    const cancelAt = company.plan_expires_at || new Date().toISOString();

    await supabaseAdmin
      .from("companies")
      .update({
        subscription_cancel_at: cancelAt,
        plan_expires_at: cancelAt,
        stripe_subscription_id: null,
        stripe_price_id: null,
      })
      .eq("id", profile.company_id);

    // Log the change
    await supabaseAdmin.from("plan_change_history").insert({
      company_id: profile.company_id,
      from_plan: company.plan,
      to_plan: company.plan,
      billing_type: null,
      reason: "manual_cancellation",
    });

    logStep("Plan expiration set", { cancelAt });

    return new Response(JSON.stringify({ success: true, cancel_at: cancelAt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    logStep("ERROR", { error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
