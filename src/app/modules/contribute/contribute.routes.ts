import { Router } from "express";
import { ContributeController } from "./contribute.controller";
import { ContributeValidation } from "./contribute.validation";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { optionalAuthenticate, authenticate, authorize } from "../../shared/middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  optionalAuthenticate,
  validateRequest({ body: ContributeValidation.createContribute }),
  ContributeController.createContribution
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  ContributeController.getAllContributions
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest({ body: ContributeValidation.updateContributeStatus }),
  ContributeController.updateContributionStatus
);

export default function registerContributeRoutes() {
  return router;
}
