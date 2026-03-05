import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth-server";

function basicClean(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { rawSourceId } = await req.json();
  if (!rawSourceId) return Response.json({ error: "rawSourceId required" }, { status: 400 });

  const { data: raw, error } = await supabaseAdmin
    .from("raw_sources")
    .select("*")
    .eq("id", rawSourceId)
    .single();

  if (error || !raw) return Response.json({ error: error?.message ?? "Not found" }, { status: 404 });

  const cleanedText = basicClean(raw.raw_text);

  const { data: cleaned, error: cErr } = await supabaseAdmin
    .from("cleaned_sources")
    .upsert(
      {
        raw_source_id: rawSourceId,
        cleaning_version: "v1",
        cleaned_text: cleanedText,
        boilerplate_removed: false,
      },
      { onConflict: "raw_source_id" }
    )
    .select("id")
    .single();

  if (cErr) return Response.json({ error: cErr.message }, { status: 500 });

  return Response.json({ ok: true, cleanedSourceId: cleaned.id });
}