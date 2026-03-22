import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import UserService from "./user.service";

class UserController {
  private userService = new UserService();

  public getProfile = catchAsync(async (req: Request, res: Response) => {
    const reqUser = req.user as any; // Assuming auth middleware attaches user
    const userId = reqUser?.id || reqUser?.userId;
    console.log("[UserController] getProfile - userId:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized: User ID missing from token",
      });
    }

    const result = await this.userService.getProfile(userId);

    return ResponseUtil.success(res, result, "Profile retrieved successfully");
  });

  public updateProfile = catchAsync(async (req: Request, res: Response) => {
    const reqUser = req.user as any;
    const userId = reqUser?.id || reqUser?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized: User ID missing from token",
      });
    }

    const data = req.body;
    const result = await this.userService.updateProfile(userId, data);

    return ResponseUtil.success(res, result, "Profile updated successfully");
  });
}

export default UserController;
