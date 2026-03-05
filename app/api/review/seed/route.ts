import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createHash } from "crypto";

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

export async function POST() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 5–10 synthetic raw notices (messy paragraphs)
  const samples = [
    {
      jurisdiction: "GBR",
      source_url: "https://example.gov.uk/policy/food-checks",
      doc_type: "guidance",
      language: "en",
      raw_text:
        "Guidance\n\nFrom 1 March 2026, documentary checks will be expanded for selected food categories.\n\nImporters must ensure commercial invoices and ingredient composition statements are available at clearance.\n\nThis notice clarifies the scope of products and references HS headings 2009 and 2106.\n\nFurther details will be published in an updated operational note.",
      cleaned_text:
        "From 1 March 2026, documentary checks expand for selected food categories. Importers must provide invoices and composition statements. Scope references HS 2009 and 2106.",
      event: {
        hs_codes: ["2009", "2106"],
        policy_type: "customs_requirement",
        change_type: "clarification",
        publish_date: "2026-02-12",
        effective_date: "2026-03-01",
        summary_1l: "UK expands documentary checks for selected food imports.",
        why_it_matters_1l: "Higher clearance time variance; increase broker readiness and buffer stock.",
        actions: [
          { action: "Pre-validate documents", owner: "Importer", horizon: "Now" },
          { action: "Add clearance buffer to lead time", owner: "Ops", horizon: "2-4 weeks" },
        ],
        citations: [
          { source_url: "https://example.gov.uk/policy/food-checks", section_idx: 0, paragraph_idx: 1 },
        ],
        confidence: 0.78,
      },
      priority: "MED",
      reason: "New requirement affects clearance time and documentation completeness.",
    },
    {
      jurisdiction: "USA",
      source_url: "https://example.gov/policy/steel-review",
      doc_type: "notice",
      language: "en",
      raw_text:
        "Notice\n\nEffective 15 February 2026, additional documentation may be requested for selected steel products.\n\nImporters should retain mill test certificates and origin statements.\n\nThis notice references HS 7208 and 7210.\n\nEnforcement posture may vary by port of entry.",
      cleaned_text:
        "Effective 15 Feb 2026, additional documentation may be requested for selected steel products (HS 7208, 7210). Retain mill test certificates and origin statements.",
      event: {
        hs_codes: ["7208", "7210"],
        policy_type: "tariff_change",
        change_type: "amendment",
        publish_date: "2026-01-28",
        effective_date: "2026-02-15",
        summary_1l: "US tightens documentation review for selected steel imports.",
        why_it_matters_1l: "Raises landed cost uncertainty and hold risk; consider alternative sourcing and contract clauses.",
        actions: [
          { action: "Collect origin proofs upfront", owner: "Supplier", horizon: "Now" },
          { action: "Add port contingency plan", owner: "Logistics", horizon: "2-6 weeks" },
        ],
        citations: [{ source_url: "https://example.gov/policy/steel-review", section_idx: 0, paragraph_idx: 1 }],
        confidence: 0.74,
      },
      priority: "HIGH",
      reason: "Potential enforcement variance by port; high operational uncertainty.",
    },
    {
      jurisdiction: "DEU",
      source_url: "https://example.eu/policy/battery-label",
      doc_type: "guidance",
      language: "en",
      raw_text:
        "Guidance\n\nFrom 1 April 2026, labeling requirements are clarified for battery-containing electronic devices.\n\nEconomic operators must ensure packaging includes required markings.\n\nScope includes HS 8507 and certain subheadings commonly used for devices under 8517.\n\nThis guidance does not replace applicable directives but clarifies implementation.",
      cleaned_text:
        "From 1 Apr 2026, clarified labeling requirements apply to battery-containing electronics. Ensure packaging markings. Scope references HS 8507 and devices often under 8517.",
      event: {
        hs_codes: ["8507", "8517"],
        policy_type: "compliance_labeling",
        change_type: "clarification",
        publish_date: "2026-02-05",
        effective_date: "2026-04-01",
        summary_1l: "EU clarifies battery labeling requirements for electronics.",
        why_it_matters_1l: "Non-compliance risks seizure and delisting; update packaging specs and supplier QC.",
        actions: [
          { action: "Update packaging artwork", owner: "Brand", horizon: "2-8 weeks" },
          { action: "Add QC checklist for markings", owner: "QA", horizon: "Now" },
        ],
        citations: [{ source_url: "https://example.eu/policy/battery-label", section_idx: 0, paragraph_idx: 1 }],
        confidence: 0.82,
      },
      priority: "MED",
      reason: "Compliance failure risk; needs packaging changes.",
    },
    {
      jurisdiction: "CHN",
      source_url: "https://example.mofcom.gov.cn/notice/export",
      doc_type: "notice",
      language: "zh",
      raw_text:
        "公告\n\n自2026年3月10日起，部分产品出口申报信息填报口径调整。\n\n企业需在报关单中补充相关字段，确保申报要素完整。\n\n涉及若干HS章节，建议企业提前与报关行确认。\n\n本公告为实施细则补充说明。",
      cleaned_text:
        "自2026年3月10日起，部分产品出口申报信息口径调整，需补充字段以确保申报要素完整，建议提前与报关行确认。",
      event: {
        hs_codes: ["84", "85"],
        policy_type: "customs_requirement",
        change_type: "amendment",
        publish_date: "2026-02-20",
        effective_date: "2026-03-10",
        summary_1l: "China updates export declaration data requirements for selected categories.",
        why_it_matters_1l: "Incorrect declaration increases delays and penalties; align broker templates early.",
        actions: [
          { action: "Update broker templates", owner: "Broker", horizon: "Now" },
          { action: "Run pre-shipment declaration check", owner: "Ops", horizon: "1-2 weeks" },
        ],
        citations: [{ source_url: "https://example.mofcom.gov.cn/notice/export", section_idx: 0, paragraph_idx: 1 }],
        confidence: 0.68,
      },
      priority: "HIGH",
      reason: "Low confidence + scope broad; requires validation.",
    },
  ];

  const created: any[] = [];

  for (const s of samples) {
    const raw_hash = sha256(s.raw_text);

    // 1) raw_sources (idempotent)
    const { data: rawRow, error: rawErr } = await supabaseAdmin
      .from("raw_sources")
      .upsert(
        {
          jurisdiction: s.jurisdiction,
          source_url: s.source_url,
          source_domain: (() => {
            try {
              return new URL(s.source_url).hostname;
            } catch {
              return null;
            }
          })(),
          doc_type: s.doc_type,
          language: s.language,
          retrieved_at: nowIso(),
          raw_text: s.raw_text,
          raw_sections: null,
          raw_hash,
        },
        { onConflict: "raw_hash" }
      )
      .select("id")
      .single();

    if (rawErr) return NextResponse.json({ error: rawErr.message }, { status: 500 });

    // 2) cleaned_sources
    const { data: cleanRow, error: cErr } = await supabaseAdmin
      .from("cleaned_sources")
      .upsert(
        {
          raw_source_id: rawRow.id,
          cleaning_version: "v1",
          cleaned_text: s.cleaned_text,
          cleaned_sections: null,
          boilerplate_removed: false,
        },
        { onConflict: "raw_source_id" }
      )
      .select("id")
      .single();

    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

    // 3) policy_events (DRAFT)
    const ev = s.event;
    const { data: evRow, error: evErr } = await supabaseAdmin
      .from("policy_events")
      .insert({
        raw_source_id: rawRow.id,
        cleaned_source_id: cleanRow.id,
        jurisdiction: s.jurisdiction,
        hs_codes: ev.hs_codes ?? [],
        policy_type: ev.policy_type ?? null,
        change_type: ev.change_type ?? null,
        publish_date: ev.publish_date ?? null,
        effective_date: ev.effective_date ?? null,
        summary_1l: ev.summary_1l ?? null,
        why_it_matters_1l: ev.why_it_matters_1l ?? null,
        actions: ev.actions ?? null,
        assumptions: null,
        citations: ev.citations ?? null,
        confidence: ev.confidence ?? null,
        status: "DRAFT",
      })
      .select("id")
      .single();

    if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 });

    // 4) review_tasks (PENDING)
    const { data: taskRow, error: tErr } = await supabaseAdmin
      .from("review_tasks")
      .insert({
        policy_event_id: evRow.id,
        priority: s.priority,
        reason: s.reason,
        status: "PENDING",
      })
      .select("id")
      .single();

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

    created.push({ raw_source_id: rawRow.id, cleaned_source_id: cleanRow.id, policy_event_id: evRow.id, task_id: taskRow.id });
  }

  return NextResponse.json({ ok: true, created });
}