import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth-server";

export async function GET() {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("policy_log")
    .select("id, created_at, jurisdiction, source_url, parse_status, parse_error")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ rows: data ?? [] });
}