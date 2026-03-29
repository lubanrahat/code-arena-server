import express, { type Router } from "express";
import SolutionController from "./solution.controller";
import { authenticate, optionalAuthenticate } from "../../shared/middlewares/auth.middleware";

export default function registerSolutionRoutes(): Router {
  const router = express.Router();
  const controller = new SolutionController();

  // Create a solution (auth required)
  router.post(
    "/",
    authenticate,
    controller.createSolution.bind(controller),
  );

  // Get solutions for a problem (auth optional — for user vote status)
  router.get(
    "/problem/:problemId",
    optionalAuthenticate,
    controller.getSolutionsForProblem.bind(controller),
  );

  // Get single solution (auth optional)
  router.get(
    "/:id",
    optionalAuthenticate,
    controller.getSolutionById.bind(controller),
  );

  // Vote on a solution (auth required)
  router.post(
    "/:id/vote",
    authenticate,
    controller.voteSolution.bind(controller),
  );

  // Add comment to a solution (auth required)
  router.post(
    "/:id/comments",
    authenticate,
    controller.addComment.bind(controller),
  );

  // Get comments for a solution (public)
  router.get(
    "/:id/comments",
    optionalAuthenticate,
    controller.getComments.bind(controller),
  );

  // Delete own solution (auth required)
  router.delete(
    "/:id",
    authenticate,
    controller.deleteSolution.bind(controller),
  );

  // Delete own comment (auth required)
  router.delete(
    "/comments/:commentId",
    authenticate,
    controller.deleteComment.bind(controller),
  );

  return router;
}
