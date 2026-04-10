import { z } from "zod";

const playerNameSchema = z
  .string()
  .trim()
  .min(2, "Player name must be at least 2 characters.")
  .max(40, "Player name must be 40 characters or fewer.");

const playerEmailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .max(100, "Email address must be 100 characters or fewer.");

export const registerFormSchema = z.object({
  name: playerNameSchema,
  email: playerEmailSchema,
});

export const sendScoreSchema = z.object({
  name: playerNameSchema,
  email: playerEmailSchema,
  score: z
    .number({ message: "Score must be a number." })
    .int("Score must be an integer.")
    .min(0, "Score cannot be negative."),
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type SendScoreInput = z.infer<typeof sendScoreSchema>;
