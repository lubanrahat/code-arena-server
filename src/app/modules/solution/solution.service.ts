import prisma from "../../lib/prisma";
import type { VoteType } from "../../../../generated/prisma/client";
import AppError from "../../shared/errors/app-error";
import HttpStatus from "../../shared/constants/http-status";

class SolutionService {
  public createSolution = async (
    userId: string,
    data: {
      problemId: string;
      title: string;
      description?: string;
      sourceCode: string;
      language: string;
    },
  ) => {
    // Verify the problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: data.problemId },
    });
    if (!problem) {
      throw new AppError("Problem not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
    }

    const solution = await prisma.solution.create({
      data: {
        userId,
        problemId: data.problemId,
        title: data.title,
        description: data.description || null,
        sourceCode: data.sourceCode,
        language: data.language,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            imageUrl: true,
          },
        },
      },
    });

    return solution;
  };

  
  public getSolutionsForProblem = async (
    problemId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "recent",
    userId?: string,
  ) => {
    const skip = (page - 1) * limit;

    const orderBy: any =
      sortBy === "likes"
        ? { votes: { _count: "desc" as const } }
        : { createdAt: "desc" as const };

    const [solutions, total] = await Promise.all([
      prisma.solution.findMany({
        where: { problemId },
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userName: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      prisma.solution.count({ where: { problemId } }),
    ]);

    // Get vote counts and user's vote for each solution
    const solutionIds = solutions.map((s) => s.id);

    const [likeCounts, dislikeCounts, userVotes] = await Promise.all([
      prisma.solutionVote.groupBy({
        by: ["solutionId"],
        where: { solutionId: { in: solutionIds }, type: "LIKE" },
        _count: true,
      }),
      prisma.solutionVote.groupBy({
        by: ["solutionId"],
        where: { solutionId: { in: solutionIds }, type: "DISLIKE" },
        _count: true,
      }),
      userId
        ? prisma.solutionVote.findMany({
            where: { solutionId: { in: solutionIds }, userId },
            select: { solutionId: true, type: true },
          })
        : Promise.resolve([]),
    ]);

    const likeMap = new Map(likeCounts.map((v) => [v.solutionId, v._count]));
    const dislikeMap = new Map(dislikeCounts.map((v) => [v.solutionId, v._count]));
    const userVoteMap = new Map(userVotes.map((v) => [v.solutionId, v.type]));

    const enrichedSolutions = solutions.map((s) => ({
      ...s,
      likeCount: likeMap.get(s.id) || 0,
      dislikeCount: dislikeMap.get(s.id) || 0,
      userVote: userVoteMap.get(s.id) || null,
      commentCount: s._count.comments,
    }));

    return { solutions: enrichedSolutions, total, page, limit };
  };

  /**
   * Get a single solution by ID
   */
  public getSolutionById = async (solutionId: string, userId?: string) => {
    const solution = await prisma.solution.findUnique({
      where: { id: solutionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!solution) {
      throw new AppError("Solution not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
    }

    // Get vote counts
    const [likeCount, dislikeCount, userVote] = await Promise.all([
      prisma.solutionVote.count({
        where: { solutionId, type: "LIKE" },
      }),
      prisma.solutionVote.count({
        where: { solutionId, type: "DISLIKE" },
      }),
      userId
        ? prisma.solutionVote.findUnique({
            where: { userId_solutionId: { userId, solutionId } },
            select: { type: true },
          })
        : null,
    ]);

    return {
      ...solution,
      likeCount,
      dislikeCount,
      userVote: userVote?.type || null,
      commentCount: solution._count.comments,
    };
  };

  
  public voteSolution = async (
    userId: string,
    solutionId: string,
    type: VoteType,
  ) => {
    const solution = await prisma.solution.findUnique({
      where: { id: solutionId },
    });
    if (!solution) {
      throw new AppError("Solution not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
    }

    const existingVote = await prisma.solutionVote.findUnique({
      where: { userId_solutionId: { userId, solutionId } },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Same vote type — remove the vote (toggle off)
        await prisma.solutionVote.delete({
          where: { id: existingVote.id },
        });
        return { action: "removed", type: null };
      } else {
        // Different vote type — switch
        await prisma.solutionVote.update({
          where: { id: existingVote.id },
          data: { type },
        });
        return { action: "switched", type };
      }
    } else {
      // No existing vote — create new one
      await prisma.solutionVote.create({
        data: { userId, solutionId, type },
      });
      return { action: "created", type };
    }
  };

  /**
   * Add a comment to a solution
   */
  public addComment = async (
    userId: string,
    solutionId: string,
    content: string,
  ) => {
    const solution = await prisma.solution.findUnique({
      where: { id: solutionId },
    });
    if (!solution) {
      throw new AppError("Solution not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
    }

    const comment = await prisma.solutionComment.create({
      data: { userId, solutionId, content },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            imageUrl: true,
          },
        },
      },
    });

    return comment;
  };

  /**
   * Get comments for a solution (paginated)
   */
  public getComments = async (
    solutionId: string,
    page: number = 1,
    limit: number = 20,
  ) => {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.solutionComment.findMany({
        where: { solutionId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userName: true,
              imageUrl: true,
            },
          },
        },
      }),
      prisma.solutionComment.count({ where: { solutionId } }),
    ]);

    return { comments, total, page, limit };
  };

  /**
   * Delete own solution
   */
  public deleteSolution = async (userId: string, solutionId: string) => {
    const solution = await prisma.solution.findUnique({
      where: { id: solutionId },
    });
    if (!solution) {
      throw new AppError("Solution not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
    }
    if (solution.userId !== userId) {
      throw new AppError(
        "You can only delete your own solutions",
        HttpStatus.FORBIDDEN,
        "FORBIDDEN",
      );
    }

    await prisma.solution.delete({ where: { id: solutionId } });
    return { deleted: true };
  };

  /**
   * Delete own comment
   */
  public deleteComment = async (userId: string, commentId: string) => {
    const comment = await prisma.solutionComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new AppError("Comment not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
    }
    if (comment.userId !== userId) {
      throw new AppError(
        "You can only delete your own comments",
        HttpStatus.FORBIDDEN,
        "FORBIDDEN",
      );
    }

    await prisma.solutionComment.delete({ where: { id: commentId } });
    return { deleted: true };
  };
}

export default SolutionService;
