import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

// Price ID -> plan_key mapping
const PRICE_TO_PLAN: Record<string, { plan_key: string; billing: string }> = {
  "price_1TI8mqGWbE9WbDuvBD0Sg1xm": { plan_key: "starter", billing: "monthly" },
  "price_1TI8nHGWbE9WbDuvy1QAHcjk": { plan_key: "starter", billing: "annual" },
  "price_1TI8o1GWbE9WbDuvZAKbVA8m": { plan_key: "professional", billing: "monthly" },
  "price_1TI8oZGWbE9WbDuvVjqErqBk": { plan_key: "professional", billing: "annual" },
  "price_1TI8q8GWbE9WbDuv733LKhMH": { plan_key: "enterprise", billing: "monthly" },
  "price_1TI8qgGWbE9WbDuvZ4WqLa4W": { plan_key: "enterprise", billing: "annual" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    logStep("ERROR: Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response("Server configuration error", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    logStep("ERROR: Missing stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    logStep("ERROR: Signature verification failed", { error: msg });
    return new Response(`Webhook signature verification failed: ${msg}`, { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const companyId = session.metadata?.company_id;
        const planKey = session.metadata?.plan_key;
        const billing = session.metadata?.billing || "monthly";
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!companyId || !planKey) {
          logStep("ERROR: Missing metadata", { companyId, planKey });
          break;
        }

        // Get subscription to find price_id
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id || "";

        logStep("Activating plan", { companyId, planKey, billing, customerId });

        const { data, error } = await supabaseAdmin.rpc("activate_plan_from_stripe", {
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: subscriptionId,
          p_stripe_price_id: priceId,
          p_plan_key: planKey,
          p_billing: billing,
          p_company_id: companyId,
        });

        if (error) logStep("ERROR activating plan", { error: error.message });
        else logStep("Plan activated", data);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        // Determine billing from price
        const lineItem = invoice.lines?.data?.[0];
        const priceId = lineItem?.price?.id || "";
        const planInfo = PRICE_TO_PLAN[priceId];
        const billing = planInfo?.billing || "monthly";

        logStep("Renewing plan", { subscriptionId, billing });

        const { error } = await supabaseAdmin.rpc("renew_plan_from_stripe", {
          p_stripe_subscription_id: subscriptionId,
          p_billing: billing,
        });

        if (error) logStep("ERROR renewing plan", { error: error.message });
        else logStep("Plan renewed");
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Cancelling plan", { subscriptionId: subscription.id });

        const { error } = await supabaseAdmin.rpc("cancel_plan_from_stripe", {
          p_stripe_subscription_id: subscription.id,
        });

        if (error) logStep("ERROR cancelling plan", { error: error.message });
        else logStep("Plan cancelled");
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    logStep("ERROR processing event", { error: msg });
    return new Response(`Error processing event: ${msg}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
