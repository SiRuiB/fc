import { openai } from "@/lib/openai/server";
import { ActionCardExtract, type ActionCardExtractType } from "./schema";

export async function extractActionCard(
  rawText: string,
  jurisdiction?: string
): Promise<ActionCardExtractType> {
  // IMPORTANT: In strict mode, required must include ALL keys in properties
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      jurisdiction: { type: "string" },
      route: { type: "string" },
      hs_codes: { type: "array", items: { type: "string" } },
      policy_type: { type: "string" },
      what_changed_1l: { type: "string" },
      why_it_matters_1l: { type: "string" },
      risk_level: { type: "number", minimum: 0, maximum: 100 },
      confidence: { type: "number", minimum: 0, maximum: 1 },
    },
    required: [
      "title",
      "jurisdiction",
      "route",
      "hs_codes",
      "policy_type",
      "what_changed_1l",
      "why_it_matters_1l",
      "risk_level",
      "confidence",
    ],
  } as const;

  const systemPrompt = [
    "You are a policy-risk analyst for supply chain, commodities, and retail.",
    "Extract ONE structured action card from the policy text.",
    "Return ONLY valid JSON matching the schema exactly.",
    "",
    "Rules:",
    "- If unknown, still return the field with a safe default (empty string for strings).",
    "- jurisdiction: use the hint if provided, otherwise infer from text or use 'UNKNOWN'.",
    "- hs_codes: [] if none explicitly stated.",
    "- risk_level: 0-100, confidence: 0-1.",
  ].join("\n");

  const userPrompt = `Jurisdiction hint: ${jurisdiction ?? "UNKNOWN"}

Policy text:
${rawText}`;

  // Use Responses API + Structured Outputs via text.format
  // Note: OpenAI expects text.format.name (and schema + strict) at this level.
  const resp = await openai.responses.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_output_tokens: 500,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "action_card_extract",
        strict: true,
        schema,
      },
    },
  } as any);

  const anyResp = resp as any;

  // Safely extract the JSON text output (SDK versions differ)
  const outputText: string =
    (typeof anyResp.output_text === "string" && anyResp.output_text) ||
    anyResp.output?.[0]?.content?.[0]?.text ||
    "";

  if (!outputText || !outputText.trim()) {
    throw new Error("OpenAI returned empty output");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new Error(
      `Failed to parse JSON from model output: ${outputText.slice(0, 200)}`
    );
  }

  return ActionCardExtract.parse(parsed);
}