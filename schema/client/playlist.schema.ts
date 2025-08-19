import { z } from "zod";

export const createPlayListSchema = z.object({
  title: z.string("Title is required"),
  thumbnail: z.string().url("Thumbnail is not valid").optional(),
  description: z.string().optional()
});

export const updatePlayListSchema = createPlayListSchema.partial();

