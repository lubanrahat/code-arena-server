import express, { type Router } from "express";
import AuthController from "./auth.controller";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { authLoginSchema, authRegisterSchema } from "./auth.validation";
import { authenticate } from "../../shared/middlewares/auth.middleware";

export default function registerAuthRoutes(): Router {
  const router: Router = express.Router();
  const authController = new AuthController();

  router.post(
    "/register",
    validateRequest({ body: authRegisterSchema }),
    authController.registerUser.bind(authController),
  );

  router.post(
    "/login",
    validateRequest({ body: authLoginSchema }),
    authController.loginUser.bind(authController),
  );

  router.get("/check", authenticate, authController.check);

  router.post("/logout", authenticate, authController.logoutUser);

  return router;
}
