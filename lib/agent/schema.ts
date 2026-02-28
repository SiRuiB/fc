import { z } from "zod";

export const ActionCardExtract = z.object({
  title: z.string().min(5),
  jurisdiction: z.string().optional(),
  route: z.string().optional(),
  hs_codes: z.array(z.string()).default([]),
  policy_type: z.string().optional(),
  what_changed_1l: z.string().min(5),
  why_it_matters_1l: z.string().min(5),
  risk_level: z.number().min(0).max(100).default(50),
  confidence: z.number().min(0).max(1).default(0.6),
});

export type ActionCardExtractType = z.infer<typeof ActionCardExtract>;