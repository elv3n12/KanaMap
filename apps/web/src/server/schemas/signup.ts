import { z } from "zod";

export const signupInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  termsAccepted: z.literal("on"),
  charterAccepted: z.literal("on"),
});
