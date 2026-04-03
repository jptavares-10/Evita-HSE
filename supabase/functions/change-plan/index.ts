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
  console.log(`[CHANGE-PLAN] ${step}${d}`);
};

const PRICE_MAP: Record<string, Record<string, string>> = {
  starter: {
    monthly: "price_1TI8mqGWbE9WbDuvBD0Sg1xm",
    annual: "price_1TI8nHGWbE9WbDuvy1QAHcjk",
  },
  professional: {
    monthly: "price_1TI8o1GWbE9WbDuvZAKbVA8m",
    annual: "price_1TI8oZGWbE9WbDuvVjqErqBk",
  },
  enterprise: {
    monthly: "price_1TI8q8GWbE9WbDuv733LKhMH",
    annual: "price_1TI8qgGWbE9WbDuvZ4WqLa4W",
  },
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

    const body = await req.json();
    const planKey = body.plan_key;
    const billingType = body.billing || "monthly";

    if (!planKey || !PRICE_MAP[planKey]) {
      return new Response(JSON.stringify({ error: "Plano inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["monthly", "annual"].includes(billingType)) {
      return new Response(JSON.stringify({ error: "Tipo de cobrança inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newPriceId = PRICE_MAP[planKey][billingType];

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
      return new Response(JSON.stringify({ error: "Apenas administradores podem alterar planos" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("id", profile.company_id)
      .single();

    if (!company?.stripe_subscription_id) {
      return new Response(JSON.stringify({ error: "Nenhuma assinatura ativa encontrada" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Changing plan", { planKey, billingType, subscriptionId: company.stripe_subscription_id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve current subscription to get item ID
    const subscription = await stripe.subscriptions.retrieve(company.stripe_subscription_id);
    const itemId = subscription.items.data[0]?.id;

    if (!itemId) {
      return new Response(JSON.stringify({ error: "Item da assinatura não encontrado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update subscription with new price (proration creates credit/debit automatically)
    const updatedSubscription = await stripe.subscriptions.update(company.stripe_subscription_id, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: "create_prorations",
      cancel_at_period_end: false, // Clear any pending cancellation
    });

    logStep("Subscription updated", { newPriceId, status: updatedSubscription.status });

    // Immediately update the database with the new plan
    const { error: rpcError } = await supabaseAdmin.rpc("activate_plan_from_stripe", {
      p_stripe_customer_id: company.stripe_customer_id || "",
      p_stripe_subscription_id: company.stripe_subscription_id,
      p_stripe_price_id: newPriceId,
      p_plan_key: planKey,
      p_billing: billingType,
      p_company_id: profile.company_id,
    });

    if (rpcError) {
      logStep("ERROR updating DB", { error: rpcError.message });
    }

    // Clear any scheduled cancellation
    await supabaseAdmin
      .from("companies")
      .update({ subscription_cancel_at: null })
      .eq("id", profile.company_id);

    return new Response(JSON.stringify({ success: true }), {
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
