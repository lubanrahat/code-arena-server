import prisma from "../../lib/prisma";
import HttpStatus from "../../shared/constants/http-status";
import AppError from "../../shared/errors/app-error";
import ErrorCodes from "../../shared/errors/error-codes";
import type { IAuthLogin, IAuthRegister } from "./auth.interface";
import bcrypt from "bcryptjs";
import JwtService from "../../shared/utils/jwt.util";
import config from "../../config/env";

class AuthService {
  public registerUser = async (payload: IAuthRegister) => {
    const { firstName, lastName, email, password } = payload;

    const isUserExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isUserExist) {
      throw new AppError(
        "User already exists ",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.USER_ALREADY_EXISTS,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userName =
      `${firstName}_${Math.random().toString(36).substring(2, 7)}`.toLowerCase();

    const isUserNameExist = await prisma.user.findUnique({
      where: {
        userName,
      },
    });

    if (isUserNameExist) {
      throw new AppError(
        "Username already exists ",
        HttpStatus.BAD_REQUEST,
        ErrorCodes.USER_ALREADY_EXISTS,
      );
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        userName: userName,
        email,
        password: hashedPassword,
        imageUrl:
          "https://res.cloudinary.com/dq4n6leek/image/upload/v1773448701/714_gbrhms.jpg",
      },
    });

    const token = JwtService.createToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn as any,
      },
    );

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  };

  public loginUser = async (payload: IAuthLogin) => {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new AppError(
        "User not found ",
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(
        "Invalid password ",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.INVALID_CREDENTIALS,
      );
    }

    const token = JwtService.createToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn as any,
      },
    );

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  };
}

export default AuthService;
