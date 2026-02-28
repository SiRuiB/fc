import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth-server";

export async function GET() {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Join country_risk -> country_codes (iso3 + name)
  const { data: riskRows, error } = await supabaseAdmin
    .from("country_risk")
    .select(
      "country_code, updated_at, risk_level, top_cards, country_codes(iso3,name)"
    )
    .order("risk_level", { ascending: false })
    .limit(300);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = riskRows ?? [];

  // Collect unique top card IDs
  const ids = Array.from(
    new Set(
      rows
        .flatMap((r: any) => (Array.isArray(r.top_cards) ? r.top_cards : []))
        .filter(Boolean)
    )
  );

  // Fetch card metadata for hover/details
  let cardsById: Record<string, any> = {};
  if (ids.length) {
    const { data: cards, error: cardErr } = await supabaseAdmin
      .from("action_cards")
      .select("id, title, jurisdiction, risk_level, confidence, created_at")
      .in("id", ids);

    if (cardErr) {
      return Response.json({ error: cardErr.message }, { status: 500 });
    }

    cardsById = Object.fromEntries((cards ?? []).map((c: any) => [c.id, c]));
  }

  // Enrich rows with iso3/name and expanded top cards
  const enriched = rows.map((r: any) => ({
    country_code: r.country_code,
    iso3: r.country_codes?.iso3 ?? null,
    name: r.country_codes?.name ?? null,
    risk_level: r.risk_level,
    updated_at: r.updated_at,
    top_cards: r.top_cards ?? [],
    top_cards_expanded: Array.isArray(r.top_cards)
      ? r.top_cards.map((id: string) => cardsById[id]).filter(Boolean)
      : [],
  }));

  return Response.json({ rows: enriched });
}