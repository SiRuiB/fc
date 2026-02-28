import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth-server";
import { createHash } from "crypto";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const rawText = String(body.rawText ?? "").trim();
    const jurisdiction = String(body.jurisdiction ?? "UNKNOWN").trim();
    const sourceUrl = String(body.sourceUrl ?? "").trim();

    if (!rawText) {
      return Response.json({ error: "rawText is required" }, { status: 400 });
    }

    const rawHash = createHash("sha256").update(rawText).digest("hex");

    const { data, error } = await supabaseAdmin
      .from("policy_log")
      .insert({
        raw_text: rawText,
        raw_hash: rawHash,
        jurisdiction,
        source_url: sourceUrl || null,
        source: sourceUrl ? "manual_url" : "manual_text",
        parse_status: "NEW",
      })
      .select("id, created_at")
      .single();

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ id: data.id, created_at: data.created_at });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}