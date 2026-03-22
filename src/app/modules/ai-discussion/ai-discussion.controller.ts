import type { Request, Response } from "express";
import HttpStatus from "../../shared/constants/http-status";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import AiDiscussionService from "./ai-discussion.service";

class AiDiscussionController {
  private aiDiscussionService = new AiDiscussionService();

  public upsertDiscussion = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { problemId, messages } = req.body;

    const result = await this.aiDiscussionService.upsertDiscussion(
      userId,
      problemId,
      messages,
    );

    return ResponseUtil.success(res, result, "AI discussion synced successfully");
  });

  public getDiscussion = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const problemId = req.params.problemId as string;

    const result = await this.aiDiscussionService.getDiscussion(userId, problemId);

    return ResponseUtil.success(res, result, "AI discussion retrieved successfully");
  });
}

export default AiDiscussionController;
