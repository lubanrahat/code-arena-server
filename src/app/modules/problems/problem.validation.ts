import { z } from "zod";

export const problemCreateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must not exceed 150 characters")
    .trim(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(10000, "Description must not exceed 10,000 characters")
    .trim(),

  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    error: "Difficulty must be EASY, MEDIUM, or HARD",
  }),

  tags: z
    .array(z.string().min(1).max(30).trim())
    .min(1, "At least one tag is required")
    .max(10, "Cannot have more than 10 tags"),

  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        explanation: z.string().optional(),
      }),
    )
    .min(1, "At least one example is required"),

  constraints: z
    .string()
    .min(1, "Constraints are required")
    .max(2000, "Constraints must not exceed 2,000 characters")
    .trim(),

  hints: z
    .string()
    .max(2000, "Hints must not exceed 2,000 characters")
    .trim()
    .optional(),

  editorial: z // now optional to match Prisma
    .string()
    .max(20000, "Editorial must not exceed 20,000 characters")
    .trim()
    .optional(),

  testCases: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        isHidden: z.boolean().default(false),
      }),
    )
    .min(1, "At least one test case is required"),

  codeSnippets: z.record(
    z.enum(["JAVASCRIPT", "PYTHON", "CPP", "GO"], {
      error: "Unsupported language",
    }),
    z.string().min(1, "Code snippet cannot be empty"),
  ),

  referenceSolutions: z.record(
    z.enum(["JAVASCRIPT", "PYTHON", "CPP", "GO"], {
      error: "Unsupported language",
    }),
    z.string().min(1, "Reference solution cannot be empty"),
  ),
});
