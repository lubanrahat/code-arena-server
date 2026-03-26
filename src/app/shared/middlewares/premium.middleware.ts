import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app-error";
import HttpStatus from "../constants/http-status";

export const requirePremium = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || (!req.user.isPremium && req.user.role !== "ADMIN")) {
    return next(
      new AppError(
        "Premium subscription required to access this resource",
        HttpStatus.FORBIDDEN,
        "FORBIDDEN",
      ),
    );
  }
  next();
};
