
-- RPC to activate a plan from Stripe webhook (SECURITY DEFINER, no RLS bypass needed)
CREATE OR REPLACE FUNCTION public.activate_plan_from_stripe(
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_price_id text,
  p_plan_key text,
  p_billing text,
  p_company_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
  v_plan_def record;
  v_old_plan text;
  v_interval_days integer;
BEGIN
  -- Find company by stripe_customer_id or by p_company_id
  IF p_company_id IS NOT NULL THEN
    SELECT id, plan INTO v_company_id, v_old_plan FROM companies WHERE id = p_company_id;
  ELSE
    SELECT id, plan INTO v_company_id, v_old_plan FROM companies WHERE stripe_customer_id = p_stripe_customer_id;
  END IF;

  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'company_not_found');
  END IF;

  -- Get plan definition
  SELECT * INTO v_plan_def FROM plan_definitions WHERE plan_key = p_plan_key;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'plan_not_found');
  END IF;

  -- Calculate expiration
  v_interval_days := CASE WHEN p_billing = 'annual' THEN 365 ELSE 30 END;

  -- Update company
  UPDATE companies SET
    plan = p_plan_key,
    plan_billing = p_billing,
    plan_started_at = now(),
    plan_expires_at = now() + (v_interval_days || ' days')::interval,
    max_users = v_plan_def.max_users,
    storage_gb = v_plan_def.storage_gb,
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    stripe_price_id = p_stripe_price_id
  WHERE id = v_company_id;

  -- Log change
  INSERT INTO plan_change_history (company_id, from_plan, to_plan, billing_type, reason)
  VALUES (v_company_id, v_old_plan, p_plan_key, p_billing, 'stripe_checkout');

  RETURN jsonb_build_object('success', true, 'company_id', v_company_id);
END;
$$;

-- RPC to handle subscription cancellation
CREATE OR REPLACE FUNCTION public.cancel_plan_from_stripe(
  p_stripe_subscription_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company record;
BEGIN
  SELECT id, plan INTO v_company FROM companies WHERE stripe_subscription_id = p_stripe_subscription_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'company_not_found');
  END IF;

  -- Set plan_expires_at to now (grace period logic in get_company_access_status handles the rest)
  UPDATE companies SET
    plan_expires_at = now(),
    stripe_subscription_id = NULL,
    stripe_price_id = NULL
  WHERE id = v_company.id;

  INSERT INTO plan_change_history (company_id, from_plan, to_plan, billing_type, reason)
  VALUES (v_company.id, v_company.plan, v_company.plan, NULL, 'stripe_cancellation');

  RETURN jsonb_build_object('success', true);
END;
$$;

-- RPC to renew plan on invoice.paid
CREATE OR REPLACE FUNCTION public.renew_plan_from_stripe(
  p_stripe_subscription_id text,
  p_billing text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company record;
  v_interval_days integer;
BEGIN
  SELECT id, plan INTO v_company FROM companies WHERE stripe_subscription_id = p_stripe_subscription_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'company_not_found');
  END IF;

  v_interval_days := CASE WHEN p_billing = 'annual' THEN 365 ELSE 30 END;

  UPDATE companies SET
    plan_expires_at = now() + (v_interval_days || ' days')::interval
  WHERE id = v_company.id;

  RETURN jsonb_build_object('success', true);
END;
$$;
