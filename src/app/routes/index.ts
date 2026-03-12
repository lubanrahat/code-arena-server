import { Router } from "express";
import registerHealthRoutes from "../modules/health/health.routes";
import registerAuthRoutes from "../modules/auth/auth.routes";

export const registerIndexRoutes = (): Router => {
  const router: Router = Router();

  router.use(registerHealthRoutes());
  router.use("/auth", registerAuthRoutes());

  return router;
};

export const IndexRouter = registerIndexRoutes();
