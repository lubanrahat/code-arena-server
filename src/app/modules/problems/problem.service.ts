import {
  getJudgeOLanguageId,
  poolBatchResult,
  submitToJudge0,
  type Judge0Submission,
} from "../../lib/judge0.lib";
import prisma from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import ErrorCodes from "../../shared/errors/error-codes";
import { logger } from "../../shared/logger/logger";
import { Difficulty } from "../../../../generated/prisma/client";
import type { ProblemCreateInput, ProblemUpdateInput } from "./problem.validation";
import type {
  IProblemFilterRequest,
  IPaginationOptions,
} from "./problem.interface";

type WhereClause = {
  OR?: any[];
  difficulty?: Difficulty;
  topic?: string;
  askedIn?: {
    hasSome: string[];
  };
  solvedBy?:
    | {
        some: {
          userId: string;
        };
      }
    | {
        none: {
          userId: string;
        };
      };
  submissions?: {
    some?: {
      userId: string;
    };
  };
};

class ProblemService {
  public createProblem = async (
    payload: ProblemCreateInput,
    userId: string,
  ) => {
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
      topic,
      askedIn,
      videoUrl,
      isPremium,
    } = payload;

    // Validate reference solutions and prepare submissions

    for (const [language, solution] of Object.entries(referenceSolutions)) {
      if (typeof solution !== "string") {
        throw new AppError(
          "Reference solution must be a string",
          HttpStatus.BAD_REQUEST,
          ErrorCodes.INVALID_INPUT,
        );
      }

      const languageId = getJudgeOLanguageId(language);
      if (!languageId) {
        throw new AppError(
          "Unsupported language",
          HttpStatus.BAD_REQUEST,
          ErrorCodes.INVALID_INPUT,
        );
      }

      const submissions = testCases.map((testCase) => ({
        source_code: solution,
        language_id: Number(languageId),
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      const submissionResult = await submitToJudge0(submissions);
      logger.info("Submission result:", submissionResult);

      // Handle different response formats
      const tokens = Array.isArray(submissionResult)
        ? submissionResult.map(
            (submission: Judge0Submission) => submission.token,
          )
        : submissionResult?.submissions?.map(
            (submission: Judge0Submission) => submission.token,
          ) || [];

      const results = await poolBatchResult(tokens);
      logger.info("Results:", results);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        logger.info("Result:", result);

        if (result && result.status.id !== 3) {
          const errorDetails = {
            language,
            testCase: i + 1,
            stdin: submissions[i]?.stdin,
            expectedOutput: submissions[i]?.expected_output,
            actualOutput: result.stdout,
            compileError: result.compile_output,
            runtimeError: result.stderr,
            statusDescription: result.status.description,
          };
          logger.error({ error: `Reference solution failed verification for ${language}`, ...errorDetails });
          throw new AppError(
            `Reference solution for ${language} failed on test case ${i + 1}: status "${result.status.description}". Check your reference solution and test cases are correct.`,
            HttpStatus.BAD_REQUEST,
            ErrorCodes.INVALID_INPUT,
          );
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
        hints,
        editorial,
        testCases,
        referenceSolutions,
        codeSnippets,
        topic,
        askedIn,
        videoUrl,
        isPremium: isPremium ?? false,
        userId,
      },
    });

    return newProblem;
  };
  public getAllProblems = async (
    filters: IProblemFilterRequest,
    paginationOptions: IPaginationOptions,
    userId?: string,
  ) => {
    const { search, difficulty, topic, askedIn, status } = filters;
    const { page = 1, limit = 10, sortBy, sortOrder } = paginationOptions;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: WhereClause = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (topic) {
      where.topic = topic;
    }

    if (askedIn) {
      where.askedIn = {
        hasSome: [askedIn],
      };
    }

    if (status && userId) {
      if (status === "SOLVED") {
        where.solvedBy = {
          some: {
            userId: userId,
          },
        };
      } else if (status === "UNSOLVED") {
        where.solvedBy = {
          none: {
            userId: userId,
          },
        };
      } else if (status === "ATTEMPTED") {
        where.submissions = {
          some: {
            userId: userId,
          },
        };
      }
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          solvedBy: userId
            ? {
                where: {
                  userId: userId,
                },
              }
            : false,
          _count: {
            select: {
              submissions: true,
            },
          },
        },
      }),
      prisma.problem.count({ where }),
    ]);

    return {
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
      data: problems,
    };
  };
  public getProblemById = async (id: string, user?: { id: string; isPremium: boolean; role: string }) => {
    const problem = await prisma.problem.findUnique({
      where: {
        id,
      },
    });
    if (!problem) {
      throw new AppError(
        "Problem not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
      );
    }

    if (problem.isPremium && (!user || (!user.isPremium && user.role !== "ADMIN"))) {
        throw new AppError(
          "Upgrade required to access this premium problem.",
          HttpStatus.FORBIDDEN,
          ErrorCodes.UNAUTHORIZED,
        );
    }

    return problem;
  };
  public updateProblem = async (id: string, payload: ProblemUpdateInput) => {
    const problem = await prisma.problem.update({
      where: {
        id,
      },
      data: payload,
    });

    if (!problem) {
      throw new AppError(
        "Problem not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
      );
    }

    return problem;
  };

  public deleteProblem = async (id: string) => {
    const problem = await prisma.problem.delete({
      where: {
        id,
      },
    });
    if (!problem) {
      throw new AppError(
        "Problem not found",
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
      );
    }
    return problem;
  };
  public getAllProblemSolveByUser = async (userId: string) => {
    const problems = await prisma.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        solvedBy: {
          where: {
            userId: userId,
          },
        },
      },
    });
    return problems;
  };
}

export default ProblemService;
