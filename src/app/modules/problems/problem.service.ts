import { getJudgeOLanguageId, poolBatchResult, submitToJudge0, type Judge0Submission } from "../../lib/judge0.lib";
import prisma from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import ErrorCodes from "../../shared/errors/error-codes";
import { logger } from "../../shared/logger/logger";
import type { ProblemCreateInput } from "./problem.validation";

class ProblemService {
  public createProblem = async (payload: ProblemCreateInput, userId: string) => {
    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      hints,
      editorial,
      testCases,
      codeSnippets,
      referenceSolutions,
    } = payload;

    // Validate reference solutions and prepare submissions


    for (const [language, solution] of Object.entries(referenceSolutions)) {
      if (typeof solution !== "string") {
        throw new AppError("Reference solution must be a string", HttpStatus.BAD_REQUEST,ErrorCodes.INVALID_INPUT);
      }

      const languageId = getJudgeOLanguageId(language);
      if (!languageId) {
        throw new AppError("Unsupported language", HttpStatus.BAD_REQUEST,ErrorCodes.INVALID_INPUT);
      }

      const submissions = testCases.map((testCase) => ({
        source_code: solution,
        language_id: Number(languageId),
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      const submissionResult = await submitToJudge0(submissions);
      console.log("Submission result:", submissionResult);

      // Handle different response formats
      const tokens = Array.isArray(submissionResult)
        ? submissionResult.map((submission: Judge0Submission) => submission.token)
        : submissionResult?.submissions?.map(
            (submission: Judge0Submission) => submission.token,
          ) || [];

      const results = await poolBatchResult(tokens);
      console.log(results);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log(result);

        if (result && result.status.id !== 3) {
          logger.error({
            error: `Failed to verify solution for ${language}`,
              testCaseIndex: submissions[i]?.stdin,
              expectedOutput: submissions[i]?.expected_output,
              actualOutput: result.stdout,
              compileError: result.compile_output,
              runtimeError: result.stderr,
          });
          throw new AppError("Failed to verify solution", HttpStatus.INTERNAL_SERVER_ERROR,ErrorCodes.INTERNAL_ERROR);  
        }
      }
    }

    const newProblem = await prisma.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        editorial,
        testCases,
        referenceSolutions,
        codeSnippets,
        userId,
      },
    });

    return newProblem;

  };
}

export default ProblemService;
