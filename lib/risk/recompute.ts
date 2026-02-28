import { supabaseAdmin } from "@/lib/supabase/admin";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function recomputeCountryRisk(jurisdiction: string) {
  const { data: cards, error } = await supabaseAdmin
    .from("action_cards")
    .select("id, risk_level, confidence")
    .eq("jurisdiction", jurisdiction)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  const rows = cards ?? [];

  if (rows.length === 0) {
    await supabaseAdmin.from("country_risk").upsert({
      country_code: jurisdiction,
      risk_level: 0,
      top_cards: [],
      updated_at: new Date().toISOString(),
    });
    return;
  }

  const weightSum = rows.reduce(
    (s, r) => s + (r.confidence ?? 0.5),
    0
  );

  const weighted = rows.reduce(
    (s, r) =>
      s + (r.risk_level ?? 50) * (r.confidence ?? 0.5),
    0
  );

  const score =
    weightSum > 0 ? weighted / weightSum : 50;

  const risk_level = clamp(Math.round(score), 0, 100);

  const top_cards = rows.slice(0, 5).map((r) => r.id);

  const { error: upErr } = await supabaseAdmin
    .from("country_risk")
    .upsert({
      country_code: jurisdiction,
      risk_level,
      top_cards,
      updated_at: new Date().toISOString(),
    });

  if (upErr) throw new Error(upErr.message);
}