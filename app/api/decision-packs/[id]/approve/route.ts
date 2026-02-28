import { requireUser } from "@/lib/supabase/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const { error } = await supabaseAdmin
    .from("decision_packs")
    .update({ status: "APPROVED" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("decision_pack_events").insert({
    user_id: user.id,
    decision_pack_id: id,
    event_type: "APPROVED",
    payload: {},
  });

  return Response.json({ ok: true });
}