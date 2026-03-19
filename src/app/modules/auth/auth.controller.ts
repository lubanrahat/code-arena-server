import { catchAsync } from "../../shared/utils/async-handler.util";
import type { Request, Response } from "express";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";
import AuthService from "./auth.service";
import { CookieService } from "../../shared/utils/cookie.utils";

class AuthController {
  private authService = new AuthService();

  public registerUser = catchAsync(async (req: Request, res) => {
    const user = await this.authService.registerUser(req.body);

    CookieService.set(res, "token", user.token);

    ResponseUtil.success(
      res,
      user,
      "User registered successfully",
      HttpStatus.OK,
    );
  });

  public loginUser = catchAsync(async (req: Request, res: Response) => {
    const user = await this.authService.loginUser(req.body);

    CookieService.set(res, "token", user.token);

    ResponseUtil.success(
      res,
      user,
      "User logged in successfully",
      HttpStatus.OK,
    );
  });

  public check = catchAsync(async (req: Request, res: Response) => {
    const user = req?.user;
    ResponseUtil.success(
      res,
      user,
      "User authenticated successfully",
      HttpStatus.OK,
    );
  });
}

export default AuthController;
