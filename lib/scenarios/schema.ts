import { z } from "zod";

export const ScenarioInputs = z.object({
  sellPrice: z.number(),
  supplierCost: z.number(),
  fx: z.number(),
  freight: z.number(),
  dutyPct: z.number(),
  vatPct: z.number(),
  otherCost: z.number(),
  leadDays: z.number(),
  capitalRate: z.number(),
});

export const ScenarioShocks = z.object({
  shockDuty: z.number(),
  shockFx: z.number(),
  shockLead: z.number(),
});

export const ScenarioCreate = z.object({
  name: z.string().min(1),
  country_code: z.string().nullable().optional(),
  inputs: ScenarioInputs,
  shocks: ScenarioShocks,
  notes: z.string().nullable().optional(),
});

export type ScenarioCreateType = z.infer<typeof ScenarioCreate>;