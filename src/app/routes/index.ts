import { Router } from "express";
import registerHealthRoutes from "../modules/health/health.routes";

export const registerIndexRoutes = (): Router => {
  const router: Router = Router();

  router.use(registerHealthRoutes());

  return router;
};

export const IndexRouter = registerIndexRoutes();
