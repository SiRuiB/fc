import { requireUser } from "@/lib/supabase/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { suggestShocksFromCards } from "@/lib/agent/shocks/suggest";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const country_code = (body?.country_code as string | undefined)?.toUpperCase();

  if (!country_code) {
    return Response.json({ error: "country_code required" }, { status: 400 });
  }

  // Pull recent/high-risk cards for that country
  const { data: cards, error } = await supabaseAdmin
    .from("action_cards")
    .select("title, risk_level, confidence")
    .eq("jurisdiction", country_code)
    .order("risk_level", { ascending: false })
    .limit(8);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const list = (cards ?? []).map((c: any) => ({
    title: c.title ?? "",
    risk_level: Number(c.risk_level ?? 50),
    confidence: Number(c.confidence ?? 0.5),
  }));

  if (!list.length) {
    return Response.json(
      { error: `No action cards found for ${country_code}` },
      { status: 404 }
    );
  }

  try {
    const suggestion = await suggestShocksFromCards({
      country_code,
      cards: list,
    });

    return Response.json({ ok: true, suggestion });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "suggestion failed" },
      { status: 500 }
    );
  }
}