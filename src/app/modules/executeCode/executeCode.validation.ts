import { z } from "zod";

export const submissionCreateSchema = z.object({
  problemId: z.string().uuid("problemId must be a valid UUID"),

  sourceCode: z.string().min(1, "Source code cannot be empty"),

  language: z.enum(["JAVASCRIPT", "PYTHON", "CPP", "GO"], {
    error: "Unsupported language",
  }),

  stdin: z.array(z.string()),

  expected_outputs: z.array(z.string()),
});

export type SubmissionCreateInput = z.infer<typeof submissionCreateSchema>;

export const runCodeSchema = z.object({
  sourceCode: z.string().min(1, "Source code cannot be empty"),

  language: z.enum(["JAVASCRIPT", "PYTHON", "CPP", "GO"], {
    error: "Unsupported language",
  }),

  stdin: z.string().optional().default(""),

  expectedOutput: z.string().optional(),
});

export type RunCodeInput = z.infer<typeof runCodeSchema>;
