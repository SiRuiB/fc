import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { openai } from "@/lib/openai/server";
import { DecisionPackAI } from "@/lib/decision-pack/schema";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const action_card_id = body?.action_card_id as string | undefined;

    if (!action_card_id) {
      return NextResponse.json(
        { error: "action_card_id required" },
        { status: 400 }
      );
    }

    // Fetch action card
    const { data: card, error: cardErr } = await supabaseAdmin
      .from("action_cards")
      .select("*")
      .eq("id", action_card_id)
      .single();

    if (cardErr || !card) {
      return NextResponse.json(
        { error: cardErr?.message ?? "Action card not found" },
        { status: 404 }
      );
    }

    // Optional: fetch policy raw text
    let rawPolicy = "";
    if ((card as any).policy_log_id) {
      const { data: plog } = await supabaseAdmin
        .from("policy_log")
        .select("raw_text")
        .eq("id", (card as any).policy_log_id)
        .single();

      if (plog?.raw_text) {
        rawPolicy = String(plog.raw_text).slice(0, 4000);
      }
    }

    // STRICT JSON schema (OpenAI structured output compliant)
    const jsonSchema = {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        country_code: { type: "string" },
        owner: { anyOf: [{ type: "string" }, { type: "null" }] },
        due_date: { anyOf: [{ type: "string" }, { type: "null" }] },

        impact: {
          type: "object",
          additionalProperties: false,
          properties: {
            summary_1l: { type: "string" },
            levers: {
              type: "object",
              additionalProperties: false,
              properties: {
                duty_pp: { anyOf: [{ type: "number" }, { type: "null" }] },
                lead_days: { anyOf: [{ type: "number" }, { type: "null" }] },
                doc_burden: {
                  anyOf: [
                    { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
                    { type: "null" },
                  ],
                },
                penalties: {
                  anyOf: [
                    { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
                    { type: "null" },
                  ],
                },
              },
              required: ["duty_pp", "lead_days", "doc_burden", "penalties"],
            },
            scope: {
              type: "object",
              additionalProperties: false,
              properties: {
                hs_codes: { type: "array", items: { type: "string" } },
                products: { type: "array", items: { type: "string" } },
                routes: { type: "array", items: { type: "string" } },
                affected_parties: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: [
                "hs_codes",
                "products",
                "routes",
                "affected_parties",
              ],
            },
          },
          required: ["summary_1l", "levers", "scope"],
        },

        recommended_actions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              action: { type: "string" },
              owner: { anyOf: [{ type: "string" }, { type: "null" }] },
              due_days: { anyOf: [{ type: "number" }, { type: "null" }] },
              priority: { type: "string", enum: ["P0", "P1", "P2"] },
              checklist: { type: "array", items: { type: "string" } },
            },
            required: ["action", "owner", "due_days", "priority", "checklist"],
          },
        },

        evidence: {
          type: "object",
          additionalProperties: false,
          properties: {
            source_url: { anyOf: [{ type: "string" }, { type: "null" }] },
            authority: { anyOf: [{ type: "string" }, { type: "null" }] },
            publish_date: { anyOf: [{ type: "string" }, { type: "null" }] },
            key_quotes: { type: "array", items: { type: "string" } },
          },
          required: ["source_url", "authority", "publish_date", "key_quotes"],
        },

        confidence: { type: "number", minimum: 0, maximum: 1 },
      },
      required: [
        "title",
        "country_code",
        "owner",
        "due_date",
        "impact",
        "recommended_actions",
        "evidence",
        "confidence",
      ],
    } as const;

    const system = `You are a compliance and commercial risk analyst for cross-border trade.
Generate a concrete, operational Decision Pack.
Return JSON only.
Do not omit required fields.
If unknown, use null where allowed.`;

    const userPrompt = [
      "Action Card:",
      JSON.stringify(
        {
          id: card.id,
          title: card.title,
          jurisdiction: card.jurisdiction,
          policy_type: (card as any).policy_type ?? null,
          what_changed_1l: (card as any).what_changed_1l ?? null,
          why_it_matters_1l: (card as any).why_it_matters_1l ?? null,
          hs_codes: (card as any).hs_codes ?? [],
          risk_level: card.risk_level,
          confidence: card.confidence,
        },
        null,
        2
      ),
      rawPolicy ? "\nRaw policy excerpt:\n" + rawPolicy : "",
    ].join("\n");

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_output_tokens: 900,
      input: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "decision_pack",
          schema: jsonSchema,
          strict: true,
        } as any,
      },
    });

    const textOut = (resp.output_text ?? "").trim();
    if (!textOut) {
      return NextResponse.json(
        { error: "Model returned empty output" },
        { status: 500 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(textOut);
    } catch {
      return NextResponse.json(
        { error: `Invalid JSON: ${textOut.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const validated = DecisionPackAI.parse(parsed);

    const payload = {
      user_id: user.id,
      action_card_id,
      country_code: validated.country_code,
      title: validated.title,
      status: "DRAFT",
      owner: validated.owner ?? null,
      due_date: validated.due_date ?? null,
      impact: validated.impact,
      recommended_actions: validated.recommended_actions,
      evidence: validated.evidence,
      model_meta: {
        model: "gpt-4o-mini",
        confidence: validated.confidence,
        generated_at: new Date().toISOString(),
      },
    };

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("decision_packs")
      .insert(payload)
      .select("id")
      .single();

    if (insertErr || !inserted?.id) {
      return NextResponse.json(
        { error: insertErr?.message ?? "Insert failed" },
        { status: 500 }
      );
    }

    await supabaseAdmin.from("decision_pack_events").insert({
      user_id: user.id,
      decision_pack_id: inserted.id,
      event_type: "GENERATED",
      payload: { action_card_id },
    });

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch (e: any) {
    console.error("decision-pack route crashed:", e);
    return NextResponse.json(
      { error: e?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}