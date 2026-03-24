import { type Request, type Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import AdminService from "./admin.service";

class AdminController {
  private adminService = new AdminService();

  public getStats = catchAsync(async (req: Request, res: Response) => {
    const result = await this.adminService.getStats();
    return ResponseUtil.success(
      res,
      result,
      "Statistics retrieved successfully",
    );
  });

  public getUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await this.adminService.getAllUsers();
    return ResponseUtil.success(res, result, "Users retrieved successfully");
  });
}

export default AdminController;
