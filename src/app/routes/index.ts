import { Router } from "express";
import registerHealthRoutes from "../modules/health/health.routes";
import registerAuthRoutes from "../modules/auth/auth.routes";
import registerProblemRoutes from "../modules/problems/problem.routes";

export const registerIndexRoutes = (): Router => {
  const router: Router = Router();

  router.use(registerHealthRoutes());
  router.use("/auth", registerAuthRoutes());
  router.use("/problems", registerProblemRoutes());

  return router;
};

export const IndexRouter = registerIndexRoutes();
