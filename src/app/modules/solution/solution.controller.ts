import type { Request, Response } from "express";
import HttpStatus from "../../shared/constants/http-status";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import SolutionService from "./solution.service";

class SolutionController {
  private solutionService = new SolutionService();

  /**
   * POST / — Create a solution
   */
  public createSolution = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { problemId, title, description, sourceCode, language } = req.body;

    if (!problemId || !title || !sourceCode || !language) {
      return ResponseUtil.error(
        res,
        "problemId, title, sourceCode, and language are required",
        HttpStatus.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    if (title.length > 100) {
      return ResponseUtil.error(
        res,
        "Title must be at most 100 characters",
        HttpStatus.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    if (description && description.length > 2000) {
      return ResponseUtil.error(
        res,
        "Description must be at most 2000 characters",
        HttpStatus.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    if (sourceCode.length > 10000) {
      return ResponseUtil.error(
        res,
        "Source code must be at most 10000 characters",
        HttpStatus.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    const result = await this.solutionService.createSolution(userId, {
      problemId,
      title,
      description,
      sourceCode,
      language,
    });

    return ResponseUtil.success(
      res,
      result,
      "Solution created successfully",
      HttpStatus.CREATED,
    );
  });

  /**
   * GET /problem/:problemId — List solutions for a problem
   */
  public getSolutionsForProblem = catchAsync(
    async (req: Request, res: Response) => {
      const { problemId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "recent";
      const userId = (req as any).user?.id;

      const result = await this.solutionService.getSolutionsForProblem(
        problemId as string,
        page,
        limit,
        sortBy,
        userId,
      );

      return ResponseUtil.paginated(
        res,
        result.solutions,
        result.page,
        result.limit,
        result.total,
        "Solutions retrieved successfully",
      );
    },
  );

  /**
   * GET /:id — Get single solution
   */
  public getSolutionById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const result = await this.solutionService.getSolutionById(id as string, userId as string);
    return ResponseUtil.success(res, result, "Solution retrieved successfully");
  });

  /**
   * POST /:id/vote — Vote on a solution
   */
  public voteSolution = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { type } = req.body;

    if (!type || !["LIKE", "DISLIKE"].includes(type)) {
      return ResponseUtil.error(
        res,
        "type must be 'LIKE' or 'DISLIKE'",
        HttpStatus.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    const result = await this.solutionService.voteSolution(userId, id as string, type);
    return ResponseUtil.success(res, result, "Vote processed successfully");
  });

  /**
   * POST /:id/comments — Add a comment
   */
  public addComment = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return ResponseUtil.error(
        res,
        "Comment content is required",
        HttpStatus.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    if (content.length > 2000) {
      return ResponseUtil.error(
        res,
        "Comment must be at most 2000 characters",
        HttpStatus.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    const result = await this.solutionService.addComment(userId, id as string, content.trim());
    return ResponseUtil.success(
      res,
      result,
      "Comment added successfully",
      HttpStatus.CREATED,
    );
  });

  /**
   * GET /:id/comments — Get comments for a solution
   */
  public getComments = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.solutionService.getComments(id as string, page, limit);

    return ResponseUtil.paginated(
      res,
      result.comments,
      result.page,
      result.limit,
      result.total,
      "Comments retrieved successfully",
    );
  });

  /**
   * DELETE /:id — Delete own solution
   */
  public deleteSolution = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const result = await this.solutionService.deleteSolution(userId, id as string);
    return ResponseUtil.success(res, result, "Solution deleted successfully");
  });

  /**
   * DELETE /comments/:commentId — Delete own comment
   */
  public deleteComment = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { commentId } = req.params;

    const result = await this.solutionService.deleteComment(userId, commentId as string);
    return ResponseUtil.success(res, result, "Comment deleted successfully");
  });
}

export default SolutionController;
