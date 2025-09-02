import { z } from "zod";

const validatePassword = (password: string): boolean | null => {
  if (password === "") return null;
  return /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password) &&
    password.length > 4;
}

export const loginInputSchema = z.object({
  email: z.string("Email is required").email("Invalid email format"),
  password: z.string("Password is required")
});

export const registerInputSchema = z.object({
  email: z.string("Email is required").email("Invalid email format"),
  fullName: z.string("Full name is required").min(1, "Full name must be at least 1 character long"),
  password: z.string("Password is required").refine(validatePassword, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be longer than 4 characters"
  }),
  confirmPassword: z.string("Confirm password is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
});
export type RegisterInputSchema = z.infer<typeof registerInputSchema>;