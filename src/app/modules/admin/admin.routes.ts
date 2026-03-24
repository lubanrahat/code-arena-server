import express, { type Router } from "express";
import AdminController from "./admin.controller";
import {
  authenticate,
  authorize,
} from "../../shared/middlewares/auth.middleware";
import { Role } from "../../../../generated/prisma/enums";

export default function registerAdminRoutes(): Router {
  const router = express.Router();
  const adminController = new AdminController();

  router.get(
    "/stats",
    authenticate,
    authorize(Role.ADMIN),
    adminController.getStats.bind(adminController),
  );

  router.get(
    "/users",
    authenticate,
    authorize(Role.ADMIN),
    adminController.getUsers.bind(adminController),
  );

  return router;
}
