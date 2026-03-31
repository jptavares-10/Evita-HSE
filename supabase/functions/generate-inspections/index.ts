import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREQUENCY_DAYS: Record<string, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Get all active models
    const { data: models, error: modelsErr } = await supabase
      .from("inspection_models")
      .select("id, company_id, name, frequency_type, frequency_days")
      .eq("status", "active");

    if (modelsErr) throw modelsErr;
    if (!models || models.length === 0) {
      return new Response(JSON.stringify({ message: "No active models" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let created = 0;
    let overdueMarked = 0;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    for (const model of models) {
      const freqDays =
        model.frequency_type === "custom"
          ? model.frequency_days ?? 1
          : FREQUENCY_DAYS[model.frequency_type] ?? 1;

      // Find the latest execution for this model
      const { data: latestExec } = await supabase
        .from("inspection_executions")
        .select("due_date")
        .eq("model_id", model.id)
        .order("due_date", { ascending: false })
        .limit(1);

      let nextDue: string;
      if (latestExec && latestExec.length > 0) {
        const lastDate = new Date(latestExec[0].due_date);
        lastDate.setDate(lastDate.getDate() + freqDays);
        nextDue = lastDate.toISOString().split("T")[0];
      } else {
        nextDue = todayStr;
      }

      // Create executions for all missed dates up to today
      while (nextDue <= todayStr) {
        // Check if execution already exists for this date+model
        const { data: existing } = await supabase
          .from("inspection_executions")
          .select("id")
          .eq("model_id", model.id)
          .eq("due_date", nextDue)
          .limit(1);

        if (!existing || existing.length === 0) {
          const dueDate = new Date(nextDue);
          const ref = `${model.name} — ${dueDate.toLocaleDateString("pt-BR")}`;
          await supabase.from("inspection_executions").insert({
            company_id: model.company_id,
            model_id: model.id,
            due_date: nextDue,
            reference: ref,
            status: "pending",
          });
          created++;
        }

        // Move to next period
        const d = new Date(nextDue);
        d.setDate(d.getDate() + freqDays);
        nextDue = d.toISOString().split("T")[0];
      }
    }

    // 2. Mark overdue executions
    const { data: overdueExecs } = await supabase
      .from("inspection_executions")
      .select("id")
      .eq("status", "pending")
      .lt("due_date", todayStr);

    if (overdueExecs && overdueExecs.length > 0) {
      for (const exec of overdueExecs) {
        await supabase
          .from("inspection_executions")
          .update({ status: "overdue" })
          .eq("id", exec.id);
        overdueMarked++;
      }
    }

    return new Response(
      JSON.stringify({ created, overdueMarked }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
