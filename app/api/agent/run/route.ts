import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth-server";
import { extractActionCard } from "@/lib/agent/extract";

function toTextArray(v: any): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function toNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function priorityFromConfidence(conf: number): "LOW" | "MED" | "HIGH" {
  if (conf < 0.7) return "HIGH";
  if (conf < 0.85) return "MED";
  return "LOW";
}

function buildActions(extracted: {
  risk_level: number;
  what_changed_1l: string;
  why_it_matters_1l: string;
  policy_type?: string;
}) {
  // Minimal, deterministic “actions” so pipeline is realistic even before you extend extractor schema.
  const risk = toNumber(extracted.risk_level, 60);
  const base = [
    {
      action: "Verify scope and dates against source",
      owner: "Risk/Compliance",
      horizon: "Now",
      rationale: extracted.what_changed_1l,
    },
    {
      action: "Assess operational impact and update SOP",
      owner: "Ops/Commercial",
      horizon: "This week",
      rationale: extracted.why_it_matters_1l,
    },
  ];

  if (risk >= 80) {
    base.unshift({
      action: "Escalate to decision maker and prepare contingency plan",
      owner: "Head of Commercial",
      horizon: "24-48h",
      rationale: "High risk score from extraction",
    });
  }

  if ((extracted.policy_type ?? "").includes("customs")) {
    base.push({
      action: "Confirm broker documentation checklist and port requirements",
      owner: "Logistics",
      horizon: "This week",
      rationale: "Customs requirement type detected",
    });
  }

  return base;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const policyId = body?.policyId ?? body?.policy_id ?? body?.id;
    if (!policyId) {
      return Response.json({ error: "policyId required" }, { status: 400 });
    }

    // Fetch policy
    const { data: policy, error: fetchErr } = await supabaseAdmin
      .from("policy_log")
      .select("*")
      .eq("id", policyId)
      .single();

    if (fetchErr || !policy) {
      return Response.json(
        { error: fetchErr?.message ?? "Policy not found" },
        { status: 400 }
      );
    }

    // Mark as PARSING
    await supabaseAdmin
      .from("policy_log")
      .update({ parse_status: "PARSING", parse_error: null })
      .eq("id", policyId);

    // Run AI extraction
    const extracted = await extractActionCard(policy.raw_text, policy.jurisdiction);

    // Minimal mapping -> policy_events draft
    const jurisdiction = String(extracted?.jurisdiction ?? policy.jurisdiction ?? "UNKNOWN");
    const hs_codes = toTextArray(extracted?.hs_codes);
    const policy_type = extracted?.policy_type ?? null;

    const summary_1l = extracted?.what_changed_1l ?? extracted?.title ?? null;
    const why_it_matters_1l = extracted?.why_it_matters_1l ?? null;

    const confidence = toNumber(extracted?.confidence, 0.75);
    const risk_level = toNumber(extracted?.risk_level, 60);

    // Create deterministic actions for now (since extractor doesn't return actions yet)
    const actions = buildActions({
      risk_level,
      what_changed_1l: summary_1l ?? "",
      why_it_matters_1l: why_it_matters_1l ?? "",
      policy_type: policy_type ?? undefined,
    });

    // Create policy_events (DRAFT)
    const { data: ev, error: evErr } = await supabaseAdmin
      .from("policy_events")
      .insert({
        jurisdiction,
        hs_codes,
        policy_type,
        publish_date: policy.publish_date ?? null,
        effective_date: policy.effective_date ?? null,
        summary_1l,
        why_it_matters_1l,
        actions, // ✅ now always present, no TS error
        citations: policy.source_url ? [{ source_url: policy.source_url }] : null,
        confidence,
        status: "DRAFT",
        raw_source_id: null,
        cleaned_source_id: null,
      })
      .select("id")
      .single();

    if (evErr || !ev) {
      await supabaseAdmin
        .from("policy_log")
        .update({
          parse_status: "ERROR",
          parse_error: evErr?.message ?? "Failed to insert policy_event",
        })
        .eq("id", policyId);

      return Response.json(
        { error: evErr?.message ?? "Failed to insert policy_event" },
        { status: 500 }
      );
    }

    // Create review task (PENDING)
    const priority = priorityFromConfidence(confidence);
    const reason =
      confidence < 0.7
        ? "Low confidence extraction; requires careful review."
        : "Draft extracted from source; please verify HS scope, dates, and actions.";

    const { error: taskErr } = await supabaseAdmin.from("review_tasks").insert({
      policy_event_id: ev.id,
      priority,
      reason,
      status: "PENDING",
    });

    if (taskErr) {
      await supabaseAdmin
        .from("policy_log")
        .update({
          parse_status: "ERROR",
          parse_error: taskErr.message,
          parsed_json: extracted,
        })
        .eq("id", policyId);

      return Response.json({ error: taskErr.message }, { status: 500 });
    }

    // Mark DRAFT + store parsed json
    await supabaseAdmin
      .from("policy_log")
      .update({ parse_status: "DRAFT", parsed_json: extracted })
      .eq("id", policyId);

    return Response.json({
      ok: true,
      policyEventId: ev.id,
    });
  } catch (err: any) {
    // Ensure policy row doesn't get stuck in PARSING
    try {
      const body = await req.clone().json();
      const policyId = body?.policyId ?? body?.policy_id ?? body?.id;
      if (policyId) {
        await supabaseAdmin
          .from("policy_log")
          .update({
            parse_status: "ERROR",
            parse_error: err?.message ?? "Unknown error",
          })
          .eq("id", policyId);
      }
    } catch {}

    return Response.json(
      { error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}