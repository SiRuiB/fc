import { requireUser } from "@/lib/supabase/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ScenarioCreate } from "@/lib/scenarios/schema";

export async function GET() {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("scenarios")
    .select("id, name, country_code, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ rows: data ?? [] });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ScenarioCreate.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = {
    user_id: user.id,
    name: parsed.data.name,
    country_code: parsed.data.country_code ?? null,
    inputs: parsed.data.inputs,
    shocks: parsed.data.shocks,
    notes: parsed.data.notes ?? null,
  };

  const { data, error } = await supabaseAdmin
    .from("scenarios")
    .insert(payload)
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, id: data.id });
}