import { z } from "zod";

export const createPlayListSchema = z.object({
  title: z.string("Title is required"),
  thumbnail: z.string("Thumbnail is required").url().optional(),
  description: z.string("Description is required").optional()
});
export type CreatePlayListType = z.infer<typeof createPlayListSchema>;

export const updatePlayListSchema = createPlayListSchema.partial();
export type UpdatePlayListType = z.infer<typeof updatePlayListSchema>;

