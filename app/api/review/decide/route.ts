import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type DecideBody = {
  taskId: string;
  decision: "APPROVE" | "REJECT";
  note?: string;
};

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: DecideBody;
  try {
    body = (await req.json()) as DecideBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const taskId = String(body.taskId ?? "").trim();
  const decision = body.decision;
  const note = String(body.note ?? "").trim();

  if (!taskId) return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  if (decision !== "APPROVE" && decision !== "REJECT") {
    return NextResponse.json({ error: "decision must be APPROVE or REJECT" }, { status: 400 });
  }

  // Load the task to get policy_event_id
  const { data: task, error: tErr } = await supabaseAdmin
    .from("review_tasks")
    .select("id, policy_event_id, status")
    .eq("id", taskId)
    .single();

  if (tErr || !task) return NextResponse.json({ error: tErr?.message ?? "Task not found" }, { status: 404 });
  if (task.status !== "PENDING") {
    return NextResponse.json({ error: `Task already decided: ${task.status}` }, { status: 400 });
  }

  const newTaskStatus = decision === "APPROVE" ? "APPROVED" : "REJECTED";
  const newEventStatus = decision === "APPROVE" ? "APPROVED" : "REJECTED";

  // 1) Update review task
  const { error: u1 } = await supabaseAdmin
    .from("review_tasks")
    .update({
      status: newTaskStatus,
      reviewer_email: user.email ?? null,
      reviewer_note: note || null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (u1) return NextResponse.json({ error: u1.message }, { status: 500 });

  // 2) Update policy event status
  const { error: u2 } = await supabaseAdmin
    .from("policy_events")
    .update({
      status: newEventStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task.policy_event_id);

  if (u2) return NextResponse.json({ error: u2.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}