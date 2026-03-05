import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Pull pending tasks + the linked policy_event
  // NOTE: this relies on review_tasks.policy_event_id -> policy_events.id FK
  const { data, error } = await supabaseAdmin
    .from("review_tasks")
    .select(
      `
      id,
      status,
      priority,
      reason,
      reviewer_note,
      created_at,
      policy_event:policy_events (
        id,
        status,
        jurisdiction,
        hs_codes,
        policy_type,
        change_type,
        publish_date,
        effective_date,
        summary_1l,
        why_it_matters_1l,
        actions,
        citations,
        confidence,
        updated_at,
        raw_source_id
      )
    `
    )
    .in("status", ["PENDING", "APPROVED"])
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ rows: data ?? [] });
}