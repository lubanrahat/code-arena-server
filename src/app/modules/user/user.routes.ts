import express, { Router } from "express";
import UserController from "./user.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";

export default function registerUserRoutes(): Router {
  const router: Router = express.Router();
  const userController = new UserController();

  router.get("/profile", authenticate, userController.getProfile.bind(userController));
  router.put("/profile", authenticate, userController.updateProfile.bind(userController));

  return router;
}
