import {
  getJudgeOLanguageId,
  getLanguageName,
  poolBatchResult,
  submitToJudge0,
  type Judge0Submission,
} from "../../lib/judge0.lib";
import prisma from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import { logger } from "../../shared/logger/logger";
import type { SubmissionCreateInput } from "./executeCode.validation";

class ExecuteCodeService {
  public executeCode = async (payload: SubmissionCreateInput, userId: string) => {
    const { sourceCode, language, stdin, expected_outputs, problemId } =
      payload;

    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      throw new AppError("Invalid or Missing test cases", HttpStatus.BAD_REQUEST);
    }

    // 1. Derive language_id
    const language_id = getJudgeOLanguageId(language);
    const source_code = sourceCode;

    // 2. Prepare each test case for judge0 batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    // 3. Send batch of submissions to judge0
    const submitResponse = await submitToJudge0(submissions);

    // Handle different response formats (array vs { submissions: [...] })
    const tokenList = Array.isArray(submitResponse)
      ? submitResponse
      : submitResponse?.submissions || [];

    const tokens = tokenList.map((res: Judge0Submission) => res.token);

    // 4. Poll judge0 for results of all submitted test cases
    const results = await poolBatchResult(tokens);

    console.log("Result-------------");
    console.log(results);

    // 5. Analyze test case results
    let allPassed = true;
    const detailedResults = results.map((result: any, i: number) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();
      const passed = stdout === expected_output;

      if (!passed) allPassed = false;

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output ?? "",
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
    });

    logger.info(detailedResults);

    // 6. Store submission summary
    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId,
        sourceCode,
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
        stderr: detailedResults.some((r) => r.stderr)
          ? JSON.stringify(detailedResults.map((r) => r.stderr))
          : null,
        compileOutput: detailedResults.some((r) => r.compile_output)
          ? JSON.stringify(detailedResults.map((r) => r.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResults.some((r) => r.memory)
          ? JSON.stringify(detailedResults.map((r) => r.memory))
          : null,
        time: detailedResults.some((r) => r.time)
          ? JSON.stringify(detailedResults.map((r) => r.time))
          : null,
      },
    });

    // 7. If all passed, mark problem as solved for the current user
    if (allPassed) {
      await prisma.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }

    // 8. Save individual test case results using detailedResults
    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

    await prisma.testCaseResult.createMany({
      data: testCaseResults,
    });

    const submissionWithTestCase = await prisma.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });

    return submissionWithTestCase;
  };
}

export default ExecuteCodeService;
