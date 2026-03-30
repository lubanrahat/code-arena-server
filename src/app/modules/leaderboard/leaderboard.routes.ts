import express, { Router } from "express";
import LeaderboardController from "./leaderboard.controller";
import { optionalAuthenticate } from "../../shared/middlewares/auth.middleware";

export default function registerLeaderboardRoutes(): Router {
  const router: Router = express.Router();
  const controller = new LeaderboardController();

  // Top 3 + current user rank (for sidebar widget) — must come before /:id style routes
  router.get("/top", optionalAuthenticate, controller.getTopThree.bind(controller));

  // Full paginated leaderboard
  router.get("/", optionalAuthenticate, controller.getLeaderboard.bind(controller));

  return router;
}
