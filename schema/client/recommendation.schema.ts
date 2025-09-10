import { z } from "zod";

export const getRecommendationsSchema = z.object({
  type: z.enum(["collaborative", "content-based", "trending", "hybrid"]).default("hybrid"),
  limit: z.number().int().min(1).max(50).default(20)
});

export const getSimilarSongsSchema = z.object({
  songId: z.string().min(1, "Song ID is required"),
  limit: z.number().int().min(1).max(50).default(10)
});

export const getUserPreferencesSchema = z.object({
  days: z.number().int().min(1).max(365).default(30)
});

export type GetRecommendationsInput = z.infer<typeof getRecommendationsSchema>;
export type GetSimilarSongsInput = z.infer<typeof getSimilarSongsSchema>;
export type GetUserPreferencesInput = z.infer<typeof getUserPreferencesSchema>;
