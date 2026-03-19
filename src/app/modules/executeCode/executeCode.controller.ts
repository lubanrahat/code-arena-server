import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import ExecuteCodeService from "./executeCode.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";

class ExecuteCodeController {
  public executeCode = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const userId = req.user.id;

    const executeCodeService = new ExecuteCodeService();
    const result = await executeCodeService.executeCode(payload, userId);

    return ResponseUtil.success(
      res,
      result,
      "Code executed successfully",
      HttpStatus.OK,
    );
  });

  public runCode = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const executeCodeService = new ExecuteCodeService();
    const result = await executeCodeService.runCode(payload);

    return ResponseUtil.success(
      res,
      result,
      "Code ran successfully",
      HttpStatus.OK,
    );
  });
}

export default ExecuteCodeController;
