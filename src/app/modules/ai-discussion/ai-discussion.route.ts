import express, { type Router } from "express";
import AiDiscussionController from "./ai-discussion.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";

export default function registerAiDiscussionRoutes(): Router {
  const router = express.Router();
  const aiDiscussionController = new AiDiscussionController();

  router.post(
    "/sync",
    authenticate,
    aiDiscussionController.upsertDiscussion.bind(aiDiscussionController),
  );

  router.get(
    "/:problemId",
    authenticate,
    aiDiscussionController.getDiscussion.bind(aiDiscussionController),
  );

  return router;
}
