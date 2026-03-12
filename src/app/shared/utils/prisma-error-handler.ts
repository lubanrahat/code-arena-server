// prisma-error-handler.ts
import { Prisma } from "../../../../generated/prisma/client";
import HttpStatus from "../constants/http-status";
import ErrorCodes from "../errors/error-codes";

type ErrorResponse = {
  message: string;
  statusCode: number;
  code: string;
  details: any;
};

export class PrismaErrorHandler {
  static handle(err: unknown): ErrorResponse {
    let statusCode = HttpStatus.BAD_REQUEST;
    let message = "Database Error";
    let code: string = ErrorCodes.DATABASE_ERROR;
    let details: any = null;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation
      if (err.code === "P2002") {
        statusCode = HttpStatus.CONFLICT;
        const target = (err.meta as any)?.target;
        message = target ? `${target} already exists` : "Duplicate entry";
        code = ErrorCodes.DUPLICATE_ENTRY;
        details = err.meta;
      }
      // Record not found
      else if (err.code === "P2025") {
        statusCode = HttpStatus.NOT_FOUND;
        message = "Record not found";
        code = ErrorCodes.NOT_FOUND;
        details = err.meta;
      }
      // Foreign key constraint
      else if (err.code === "P2003") {
        statusCode = HttpStatus.BAD_REQUEST;
        message = "Foreign key constraint failed";
        code = ErrorCodes.FOREIGN_KEY_CONSTRAINT;
        details = err.meta;
      } else {
        // Other known request errors
        message = err.message;
        code = err.code;
        details = err.meta;
      }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      // Validation errors (wrong types, missing args)
      statusCode = HttpStatus.BAD_REQUEST;
      message = "Validation Error";
      code = ErrorCodes.VALIDATION_ERROR;
      const match = err.message.match(/Argument `(\w+)` is missing/);
      if (match) {
        message = `Missing required field: ${match[1]}`;
      } else {
        message = "Invalid data format";
      }
      details = err.message;
    } else if (err instanceof Error) {
      // All other runtime errors (including initialization)
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = err.message || "Unexpected database error";
      code = ErrorCodes.DB_CONNECTION_ERROR;
      details = null;
    }

    return { message, statusCode, code, details };
  }
}
