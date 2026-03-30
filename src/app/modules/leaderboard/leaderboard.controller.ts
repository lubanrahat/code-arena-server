import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import LeaderboardService from "./leaderboard.service";

class LeaderboardController {
  private leaderboardService = new LeaderboardService();

  /**
   * GET /leaderboard
   * Full paginated leaderboard. Optionally includes current user's rank if authenticated.
   */
  public getLeaderboard = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const reqUser = req.user as any;
    const userId = reqUser?.id || reqUser?.userId || undefined;

    const result = await this.leaderboardService.getLeaderboard(
      page,
      limit,
      userId,
    );

    return ResponseUtil.success(res, result, "Leaderboard retrieved successfully");
  });

  /**
   * GET /leaderboard/top
   * Top 3 users + optionally the current user's rank.
   */
  public getTopThree = catchAsync(async (req: Request, res: Response) => {
    const reqUser = req.user as any;
    const userId = reqUser?.id || reqUser?.userId || undefined;

    const result = await this.leaderboardService.getTopThreeAndUserRank(userId);

    return ResponseUtil.success(res, result, "Top leaderboard retrieved successfully");
  });
}

export default LeaderboardController;
