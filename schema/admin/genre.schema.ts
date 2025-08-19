import { z } from "zod";

export const createGenreSchema = z.object({
  title: z.string("Title is required").min(1, "Title is required"),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
});

export const updateGenreSchema = createGenreSchema.partial();
