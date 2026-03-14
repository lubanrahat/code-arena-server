import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import ProblemService from "./problem.service";
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
    const problemService = new ProblemService();
    const result = await problemService.getAllProblems();

    return ResponseUtil.success(
      res,
      result,
      "Problems fetched successfully",
      HttpStatus.OK,
    );
  });
  public getProblemById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const problemService = new ProblemService();
    const result = await problemService.getProblemById(id as string);

    return ResponseUtil.success(
      res,
      result,
      "Problem fetched successfully",
      HttpStatus.OK,
    );
  });
}

export default ProblemController;
