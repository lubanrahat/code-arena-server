import express, { type Router } from "express";
import ExecuteCodeController from "./executeCode.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { submissionCreateSchema } from "./executeCode.validation";

export default function registerExecuteCodeRoutes(): Router {
  const router: Router = express.Router();

  const executeCodeController = new ExecuteCodeController();

  router.post(
    "/",
    authenticate,
    validateRequest({ body: submissionCreateSchema }),
    executeCodeController.executeCode,
  );

  return router;
}
