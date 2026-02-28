import { requireUser } from "@/lib/supabase/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ScenarioCreate } from "@/lib/scenarios/schema";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const { data, error } = await supabaseAdmin
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ row: data });
}

export async function PUT(req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const body = await req.json();
  const parsed = ScenarioCreate.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = {
    name: parsed.data.name,
    country_code: parsed.data.country_code ?? null,
    inputs: parsed.data.inputs,
    shocks: parsed.data.shocks,
    notes: parsed.data.notes ?? null,
  };

  const { error } = await supabaseAdmin
    .from("scenarios")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const { error } = await supabaseAdmin
    .from("scenarios")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}