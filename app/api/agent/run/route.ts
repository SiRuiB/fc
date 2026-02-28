import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth-server";
import { extractActionCard } from "@/lib/agent/extract";
import { recomputeCountryRisk } from "@/lib/risk/recompute";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { policyId } = await req.json();
    if (!policyId) {
      return Response.json({ error: "policyId required" }, { status: 400 });
    }

    // Fetch policy
    const { data: policy, error: fetchErr } = await supabaseAdmin
      .from("policy_log")
      .select("*")
      .eq("id", policyId)
      .single();

    if (fetchErr || !policy) {
      return Response.json(
        { error: fetchErr?.message ?? "Policy not found" },
        { status: 400 }
      );
    }

    // Mark as PARSING
    await supabaseAdmin
      .from("policy_log")
      .update({ parse_status: "PARSING", parse_error: null })
      .eq("id", policyId);

    // Run AI extraction
    const extracted = await extractActionCard(
      policy.raw_text,
      policy.jurisdiction
    );

    // Insert action card
    const { data: card, error: insertErr } = await supabaseAdmin
      .from("action_cards")
      .insert({
        title: extracted.title,
        jurisdiction: extracted.jurisdiction,
        route: extracted.route,
        hs_codes: extracted.hs_codes,
        policy_type: extracted.policy_type,
        what_changed_1l: extracted.what_changed_1l,
        why_it_matters_1l: extracted.why_it_matters_1l,
        risk_level: extracted.risk_level,
        confidence: extracted.confidence,
        source: policy.source,
        source_url: policy.source_url,
        publish_date: policy.publish_date,
        effective_date: policy.effective_date,
        derived_from_policy_id: policyId,
      })
      .select("id")
      .single();

    if (insertErr) {
      await supabaseAdmin
        .from("policy_log")
        .update({ parse_status: "ERROR", parse_error: insertErr.message })
        .eq("id", policyId);

      return Response.json({ error: insertErr.message }, { status: 500 });
    }

    // Mark DONE
    await supabaseAdmin
      .from("policy_log")
      .update({ parse_status: "DONE", parsed_json: extracted })
      .eq("id", policyId);

    // 🔥 Recompute country risk automatically
    await recomputeCountryRisk(
      extracted.jurisdiction ?? policy.jurisdiction
    );

    return Response.json({
      ok: true,
      actionCardId: card.id,
    });
  } catch (err: any) {
    // Ensure policy row doesn't get stuck in PARSING
    try {
      const body = await req.clone().json();
      if (body?.policyId) {
        await supabaseAdmin
          .from("policy_log")
          .update({
            parse_status: "ERROR",
            parse_error: err?.message ?? "Unknown error",
          })
          .eq("id", body.policyId);
      }
    } catch {}

    return Response.json(
      { error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}