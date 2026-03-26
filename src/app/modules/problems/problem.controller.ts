import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import ProblemService from "./problem.service";
import { Difficulty } from "../../../../generated/prisma/client";
import type { ProblemCreateInput, ProblemUpdateInput } from "./problem.validation";

import type {
  IProblemFilterRequest,
  IPaginationOptions,
} from "./problem.interface";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";

class ProblemController {
  public createProblem = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const userId = req.user.id;

    const problemService = new ProblemService();
    const result = await problemService.createProblem(payload, userId);

    return ResponseUtil.success(
      res,
      result,
      "Problem created successfully",
      HttpStatus.CREATED,
    );
  });
  public getAllProblems = catchAsync(async (req: Request, res: Response) => {
    const {
      search,
      difficulty,
      topic,
      askedIn,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;
    const userId = req.user?.id;

    const filters: IProblemFilterRequest = {
      search: search as string,
      difficulty: difficulty as any,
      topic: topic as string,
      askedIn: askedIn as string,
      status: status as any,
    };

    const paginationOptions: IPaginationOptions = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as any,
    };

    const problemService = new ProblemService();
    const result = await problemService.getAllProblems(
      filters,
      paginationOptions,
      userId,
    );

    return ResponseUtil.paginated(
      res,
      result.data,
      result.meta.page,
      result.meta.limit,
      result.meta.total,
      "Problems fetched successfully",
    );
  });
  public getProblemById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = req.user; // Might be undefined if the route is entirely public, but typically req.user is set by auth middleware
    const problemService = new ProblemService();
    const result = await problemService.getProblemById(id as string, user as any);

    return ResponseUtil.success(
      res,
      result,
      "Problem fetched successfully",
      HttpStatus.OK,
    );
  });
  public updateProblem = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;

    const problemService = new ProblemService();
    const result = await problemService.updateProblem(id as string, payload);


    return ResponseUtil.success(
      res,
      result,
      "Problem updated successfully",
      HttpStatus.OK,
    );
  });
  public deleteProblem = catchAsync(async (req: Request, res: Response) => {

    const id = req.params.id;
    const problemService = new ProblemService();
    const result = await problemService.deleteProblem(id as string);

    return ResponseUtil.success(
      res,
      result,
      "Problem deleted successfully",
      HttpStatus.OK,
    );
  });
  public getAllProblemSolveByUser = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const problemService = new ProblemService();
      const result = await problemService.getAllProblemSolveByUser(userId);
      return ResponseUtil.success(
        res,
        result,
        "Problems fetched successfully",
        HttpStatus.OK,
      );
    },
  );
}

export default ProblemController;
