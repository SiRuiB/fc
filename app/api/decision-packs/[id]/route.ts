import { requireUser } from "@/lib/supabase/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const { data, error } = await supabaseAdmin
    .from("decision_packs")
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

  const { error } = await supabaseAdmin
    .from("decision_packs")
    .update({
      title: body.title,
      owner: body.owner ?? null,
      due_date: body.due_date ?? null,
      impact: body.impact ?? {},
      recommended_actions: body.recommended_actions ?? [],
      evidence: body.evidence ?? {},
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("decision_pack_events").insert({
    user_id: user.id,
    decision_pack_id: id,
    event_type: "EDITED",
    payload: { fields: Object.keys(body ?? {}) },
  });

  return Response.json({ ok: true });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const { error } = await supabaseAdmin
    .from("decision_packs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}