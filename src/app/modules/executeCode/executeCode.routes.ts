import express, { type Router } from "express";
import ExecuteCodeController from "./executeCode.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { submissionCreateSchema, runCodeSchema } from "./executeCode.validation";

export default function registerExecuteCodeRoutes(): Router {
  const router: Router = express.Router();

  const executeCodeController = new ExecuteCodeController();

  router.post(
    "/",
    authenticate,
    validateRequest({ body: submissionCreateSchema }),
    executeCodeController.executeCode,
  );

  router.post(
    "/run",
    authenticate,
    validateRequest({ body: runCodeSchema }),
    executeCodeController.runCode,
  );

  return router;
}
