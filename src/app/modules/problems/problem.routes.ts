import express, { type Router } from "express";
import ProblemController from "./problem.controller";
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from "../../shared/middlewares/auth.middleware";
import { Role } from "../../../../generated/prisma/enums";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { problemCreateSchema, problemUpdateSchema } from "./problem.validation";

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

  router.patch(
    "/:id",
    authenticate,
    authorize(Role.ADMIN),
    validateRequest({ body: problemUpdateSchema }),
    problemController.updateProblem.bind(problemController),
  );

  router.get("/", optionalAuthenticate, problemController.getAllProblems.bind(problemController));


  router.get("/user/status", authenticate, problemController.getUserProblemStatus.bind(problemController));
  router.get("/get-solved-problem", authenticate, problemController.getAllProblemSolveByUser.bind(problemController));

  router.get("/:id", optionalAuthenticate, problemController.getProblemById.bind(problemController));

  router.delete(
    "/:id",
    authenticate,
    authorize(Role.ADMIN),
    problemController.deleteProblem.bind(problemController),
  );

  router.post("/:id/bookmark", authenticate, problemController.toggleBookmark.bind(problemController));

  return router;
}
