import { z } from "zod";

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum Language {
  JAVASCRIPT = "JAVASCRIPT",
  PYTHON = "PYTHON",
  CPP = "CPP",
  GO = "GO",
}

const problemBaseObject = z.object({
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

  difficulty: z.nativeEnum(Difficulty, {
    error: "Difficulty must be EASY, MEDIUM, or HARD",
  }),

  tags: z
    .array(z.string().min(1).max(30).trim())
    .min(1, "At least one tag is required")
    .max(10, "Cannot have more than 10 tags"),
  
  topic: z.string().max(100).trim().optional().or(z.literal("")),

  askedIn: z.array(z.string().min(1).max(100).trim()).optional(),

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
    .array(z.string().max(2000, "Each hint must not exceed 2,000 characters").trim())
    .optional(),

  editorial: z
    .string()
    .max(20000, "Editorial must not exceed 20,000 characters")
    .trim()
    .optional(),

  isPremium: z.boolean().default(false).optional(),

  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),

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
    z.string(),
    z.object({
      code: z.string().min(1, "Code snippet cannot be empty"),
      boilerplate: z.string().optional(),
      language: z.string(),
    }),
  ),

  referenceSolutions: z.record(
    z.string(),
    z.string().min(1, "Reference solution cannot be empty"),
  ),
});

export const problemCreateSchema = z.preprocess(
  (data: any) => {
    // Accept "example" (singular object) and convert to "examples" (array)
    if (data && !data.examples && data.example) {
      const example = data.example;
      data.examples = Array.isArray(example) ? example : [example];
      delete data.example;
    }
    return data;
  },
  problemBaseObject,
);

export const problemUpdateSchema = problemBaseObject.partial();

export type ProblemCreateInput = z.infer<typeof problemCreateSchema>;
export type ProblemUpdateInput = z.infer<typeof problemUpdateSchema>;
