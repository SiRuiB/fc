import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth-server";
import { createHash } from "crypto";

function domainFromUrl(u: string) {
  try { return new URL(u).hostname; } catch { return null; }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const rawText = String(body.rawText ?? "").trim();
    const jurisdiction = String(body.jurisdiction ?? "UNKNOWN").trim();
    const sourceUrl = String(body.sourceUrl ?? "").trim();

    if (!rawText) return Response.json({ error: "rawText is required" }, { status: 400 });

    const rawHash = createHash("sha256").update(rawText).digest("hex");
    const sourceDomain = sourceUrl ? domainFromUrl(sourceUrl) : null;

    // 1) Insert into new raw_sources (idempotent via unique raw_hash)
    const { data: rawRow, error: rawErr } = await supabaseAdmin
      .from("raw_sources")
      .upsert(
        {
          raw_text: rawText,
          raw_hash: rawHash,
          jurisdiction,
          source_url: sourceUrl || null,
          source_domain: sourceDomain,
          doc_type: body.docType ?? null,
          language: body.language ?? "en",
        },
        { onConflict: "raw_hash" }
      )
      .select("id, created_at")
      .single();

    if (rawErr) return Response.json({ error: rawErr.message }, { status: 400 });

    // 2) Keep your existing pipeline alive (policy_log)
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

    return Response.json({
      id: data.id,                 // existing policy_log id (keeps current UI working)
      raw_source_id: rawRow.id,    // new raw_sources id
      created_at: data.created_at,
    });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}