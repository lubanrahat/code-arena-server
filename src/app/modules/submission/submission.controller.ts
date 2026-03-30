import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import SubmissionService from "./submission.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";

class SubmissionController {
  public getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const username = req.query.username as string;

    const submissionService = new SubmissionService();
    let submissions: any[] = [];

    if (username) {
      submissions = await submissionService.getAllSubmissionsByUsername(username);
    } else if (userId) {
      submissions = await submissionService.getAllSubmissions(userId);
    } else {
      submissions = [];
    }

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
