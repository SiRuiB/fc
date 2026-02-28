import { openai } from "@/lib/openai/server";
import { ShockSuggestion, type ShockSuggestionType } from "./schema";

export async function suggestShocksFromCards(args: {
  country_code: string;
  cards: { title: string; risk_level: number; confidence: number }[];
}): Promise<ShockSuggestionType> {
  // JSON Schema used for OpenAI Structured Outputs
  const jsonSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      shockDuty: { type: "number", minimum: -50, maximum: 200 },
      shockFx: { type: "number", minimum: -50, maximum: 50 },
      shockLead: { type: "number", minimum: -90, maximum: 365 },
      rationale: { type: "string" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
    },
    required: ["shockDuty", "shockFx", "shockLead", "rationale", "confidence"],
  } as const;

  const system = [
    "You are a supply-chain policy risk analyst.",
    "Given a set of action cards for one country, propose scenario shocks.",
    "Return deltas only:",
    "shockDuty is percentage-point change in duty, eg +10 means duty increases 10pp.",
    "shockFx is percent change in FX rate USD->GBP (or base FX) where negative means GBP weakens, increasing GBP cost of USD imports.",
    "shockLead is days added to lead time.",
    "Be conservative. Use rationale and confidence.",
    "Return ONLY valid JSON matching the schema.",
  ].join("\n");

  const user = [
    `Country: ${args.country_code}`,
    "",
    "Action cards (most important first):",
    ...args.cards.slice(0, 6).map((c, i) => {
      return `${i + 1}. ${c.title} (risk=${c.risk_level}, conf=${c.confidence})`;
    }),
  ].join("\n");

  // Use Responses API + Structured Outputs
  // NOTE: The OpenAI SDK types expect name/schema at the top-level of text.format.
  const resp = await openai.responses.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_output_tokens: 300,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "shock_suggestion",
        schema: jsonSchema,
        strict: true,
      } as any,
    },
  });

  const textOut = (resp.output_text ?? "").trim();
  if (!textOut) throw new Error("OpenAI returned empty output_text");

  const parsed = JSON.parse(textOut);
  return ShockSuggestion.parse(parsed);
}