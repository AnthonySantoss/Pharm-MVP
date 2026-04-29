import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["admin", "pharmacist", "patient"]),
  created_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const InteractionCheckSchema = z.object({
  drug1: z.string(),
  drug1_dcb: z.string(),
  drug2: z.string(),
  drug2_dcb: z.string(),
  severity: z.enum(["Grave", "Moderada", "Leve"]),
  description: z.string().optional(),
  description_en: z.string().optional(),
  confidence: z.number().optional(),
});

export type InteractionCheck = z.infer<typeof InteractionCheckSchema>;

export const HistoryEntrySchema = z.object({
  id: z.string(),
  drug1: z.string(),
  drug1_dcb: z.string(),
  drug2: z.string(),
  drug2_dcb: z.string(),
  severity: z.enum(["Grave", "Moderada", "Leve"]),
  timestamp: z.string(),
});

export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

export const StatsSchema = z.object({
  totalInteractions: z.number(),
  graveCount: z.number(),
  moderadaCount: z.number(),
  leveCount: z.number(),
  topDrugs: z.array(z.object({ drug: z.string(), count: z.number() })),
});

export type Stats = z.infer<typeof StatsSchema>;

export const ModelMetricsSchema = z.object({
  model: z.string(),
  accuracy: z.number(),
  f1_weighted: z.number(),
  f1_macro: z.number(),
});

export const ModelsCompareSchema = z.object({
  models: z.array(ModelMetricsSchema),
  classes: z.array(z.string()),
});

export type ModelsCompare = z.infer<typeof ModelsCompareSchema>;

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  user: UserSchema,
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

export const DrugSchema = z.object({
  inn: z.string(),
  dcb: z.string(),
  class: z.string(),
  display: z.string(),
});

export type Drug = z.infer<typeof DrugSchema>;