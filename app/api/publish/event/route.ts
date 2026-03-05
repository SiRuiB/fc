import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Body = { policyEventId: string };

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Body;
  const policyEventId = String(body.policyEventId ?? "").trim();
  if (!policyEventId) return NextResponse.json({ error: "policyEventId required" }, { status: 400 });

  const { data: ev, error: evErr } = await supabaseAdmin
    .from("policy_events")
    .select("*")
    .eq("id", policyEventId)
    .single();

  if (evErr || !ev) return NextResponse.json({ error: evErr?.message ?? "Not found" }, { status: 404 });
  if (ev.status !== "APPROVED") {
    return NextResponse.json({ error: `policy_event must be APPROVED to publish. Current: ${ev.status}` }, { status: 400 });
  }

  // Create an action card from the approved event (simple mapping)
  const title = ev.summary_1l ?? "Policy update";
  const whatChanged = ev.summary_1l ?? "";
  const whyMatters = ev.why_it_matters_1l ?? "";

  const riskLevel = Math.round(((Number(ev.confidence) || 0.6) * 100));
  const confidence = Number(ev.confidence) || 0.6;

  const { data: card, error: cErr } = await supabaseAdmin
    .from("action_cards")
    .insert({
      title,
      jurisdiction: ev.jurisdiction,
      route: null,
      hs_codes: ev.h_s_codes ?? ev.hs_codes ?? [],
      policy_type: ev.policy_type ?? null,
      what_changed_1l: whatChanged,
      why_it_matters_1l: whyMatters,
      risk_level: riskLevel,
      confidence,
      source: "review_publish",
      source_url: (Array.isArray(ev.citations) && ev.citations?.[0]?.source_url) ? ev.citations[0].source_url : null,
      publish_date: ev.publish_date ?? null,
      effective_date: ev.effective_date ?? null,
    })
    .select("id")
    .single();

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  // Mark policy_event as published
  const { error: uErr } = await supabaseAdmin
    .from("policy_events")
    .update({ status: "PUBLISHED", updated_at: new Date().toISOString() })
    .eq("id", policyEventId);

  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, actionCardId: card.id });
}