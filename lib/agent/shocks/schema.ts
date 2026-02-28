import { z } from "zod";

export const ShockSuggestion = z.object({
  // all values are deltas, not absolute values
  shockDuty: z.number().min(-50).max(200), // percentage points, eg +10
  shockFx: z.number().min(-50).max(50),    // percent change in FX, eg -5
  shockLead: z.number().min(-90).max(365), // days, eg +14
  rationale: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export type ShockSuggestionType = z.infer<typeof ShockSuggestion>;