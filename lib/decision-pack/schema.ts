import { z } from "zod";

export const ImpactSchema = z.object({
  summary_1l: z.string().min(1),
  levers: z.object({
    duty_pp: z.number().nullable(),
    lead_days: z.number().nullable(),
    doc_burden: z.enum(["LOW", "MEDIUM", "HIGH"]).nullable(),
    penalties: z.enum(["LOW", "MEDIUM", "HIGH"]).nullable(),
  }),
  scope: z.object({
    hs_codes: z.array(z.string()),
    products: z.array(z.string()),
    routes: z.array(z.string()),
    affected_parties: z.array(z.string()),
  }),
});

export const RecommendedActionSchema = z.object({
  action: z.string().min(1),
  owner: z.string().nullable(),
  due_days: z.number().nullable(),
  priority: z.enum(["P0", "P1", "P2"]),
  checklist: z.array(z.string()),
});

export const EvidenceSchema = z.object({
  source_url: z.string().nullable(),
  authority: z.string().nullable(),
  publish_date: z.string().nullable(),
  key_quotes: z.array(z.string()),
});

export const DecisionPackAI = z.object({
  title: z.string().min(1),
  country_code: z.string().min(2).max(8),
  owner: z.string().nullable(),
  due_date: z.string().nullable(),
  impact: ImpactSchema,
  recommended_actions: z.array(RecommendedActionSchema).min(1),
  evidence: EvidenceSchema,
  confidence: z.number().min(0).max(1),
});

export type DecisionPackAIType = z.infer<typeof DecisionPackAI>;