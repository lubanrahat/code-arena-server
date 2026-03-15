import express, { type Router } from "express";
import ProblemController from "./problem.controller";
import {
  authenticate,
  authorize,
} from "../../shared/middlewares/auth.middleware";
import { Role } from "../../../../generated/prisma/enums";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { problemCreateSchema } from "./problem.validation";

export default function registerProblemRoutes(): Router {
  const router = express.Router();

  const problemController = new ProblemController();

  router.post(
    "/",
    authenticate,
    authorize(Role.ADMIN),
    validateRequest({ body: problemCreateSchema }),
    problemController.createProblem.bind(problemController),
  );

  router.get("/", problemController.getAllProblems.bind(problemController));

  router.get("/:id", problemController.getProblemById.bind(problemController));

  router.delete(
    "/:id",
    authenticate,
    authorize(Role.ADMIN),
    problemController.deleteProblem.bind(problemController),
  );

  router.get("/get-all-problem-solve-by-user", authenticate, problemController.getAllProblemSolveByUser.bind(problemController));

  return router;
}
