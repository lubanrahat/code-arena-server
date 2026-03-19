import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/app-error";
import HttpStatus from "../constants/http-status";
import config from "../../config/env";
import JwtService from "../utils/jwt.util";
import type { Role } from "../../../../generated/prisma/client";
import { logger } from "../logger/logger";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return next(
        new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED"),
      );
    }

    const payload = JwtService.verifyToken(token, config.jwt.secret);
    req.user = payload;
    next();
  } catch (error) {
    next(new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED"));
  }
};

export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const payload = JwtService.verifyToken(token, config.jwt.secret);
      req.user = payload;
    }
  } catch (error) {
    // Ignore error and proceed without user
    logger.error("Optional authentication error", error);
  }
  next();
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(
        "Unauthorized",
        HttpStatus.UNAUTHORIZED,
        "UNAUTHORIZED",
      );
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError("Forbidden", HttpStatus.FORBIDDEN, "FORBIDDEN");
    }
    next();
  };
};

export const isAuthenticated = authenticate;
