import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string("Email is required").email("Invalid email format"),
  password: z.string("Password is required")
});
