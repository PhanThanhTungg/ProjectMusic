import { z } from "zod";

export const createSongSchema = z.object({
  title: z.string("Title is required").min(1),
  thumbnail: z.string().url("Thumbnail must be a valid URL").optional(),
  background: z.string().url("Background must be a valid URL").optional(),
  description: z.string().optional(),
  lyrics: z.string().url("Lyrics must be a valid URL").optional(),
  audio: z.string("Audio is required").url("Audio must be a valid URL"),
  genreId: z.string("Genre is required"),
  albumId: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateSongSchema = z.infer<typeof createSongSchema>;

export const updateSongSchema = createSongSchema.partial();
