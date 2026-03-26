import express, { Router } from "express";

import { isAuthenticated } from "../../shared/middlewares/auth.middleware";
import { PaymentController } from "./payment.controller";

export default function registerPaymentRoutes(): Router {
  const router = Router();

  router.post(
    "/subscribe",
    isAuthenticated,
    PaymentController.createSubscription,
  );
  router.post("/verify", PaymentController.verifySession);
  router.get("/verify-redirect", PaymentController.verifyRedirect);
  router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleWebhook,
  );

  return router;
}
