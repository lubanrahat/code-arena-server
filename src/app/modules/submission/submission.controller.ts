import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import SubmissionService from "./submission.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";

class SubmissionController {
  public getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const submissionService = new SubmissionService();

    const submissions = await submissionService.getAllSubmissions(userId);

    ResponseUtil.success(res, {
      message: "Submissions fetched successfully",
      data: submissions,
      statusCode: HttpStatus.OK,
    });
  });

  public getSubmissionsForProblem = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user?.id;
      const problemId = req.params.problemId;

      const submissionService = new SubmissionService();

      const submissions = await submissionService.getSubmissionsForProblem(
        userId,
        problemId as string,
      );

      ResponseUtil.success(res, {
        message: "Submissions fetched successfully",
        data: submissions,
        statusCode: HttpStatus.OK,
      });
    },
  );

  public getAllTheSubmissionsForProblem = catchAsync(async (req: Request, res: Response) => {
    const problemId = req.params.problemId;

    const submissionService = new SubmissionService();

    const submissions = await submissionService.getAllTheSubmissionsForProblem(problemId as string);

    ResponseUtil.success(res, {
      message: "Submissions fetched successfully",
      data: submissions,
      statusCode: HttpStatus.OK,
    });
  });   
}

export default SubmissionController;
