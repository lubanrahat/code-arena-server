import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";

import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";
import { PaymentService } from "./payment.service";
import config from "../../config/env";

export class PaymentController {
  public static createSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { plan } = req.body; // "monthly" | "yearly"

    if (plan !== "monthly" && plan !== "yearly") {
      return ResponseUtil.error(res, "Invalid plan. Must be 'monthly' or 'yearly'", HttpStatus.BAD_REQUEST);
    }

    const result = await PaymentService.createSubscriptionSession(userId, plan);

    return ResponseUtil.success(
      res,
      result,
      "Subscription checkout session created successfully",
      HttpStatus.OK,
    );
  });

  public static verifySession = catchAsync(async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    if (!sessionId) {
      return ResponseUtil.error(res, "Session ID is required", HttpStatus.BAD_REQUEST);
    }
    const result = await PaymentService.verifySession(sessionId);
    return ResponseUtil.success(res, result, "Session verified", HttpStatus.OK);
  });

  public static verifyRedirect = catchAsync(async (req: Request, res: Response) => {
    const sessionId = req.query.session_id as string;
    const domainUrl = config.client.url || "http://localhost:3000";
    
    if (!sessionId) {
      return res.redirect(`${domainUrl}/payment-cancel`);
    }

    try {
      // Execute the database save synchronously before returning the web page
      await PaymentService.verifySession(sessionId);
    } catch (err) {
      console.error("Error verifying payment session redirect:", err);
    }

    // Redirect user to the frontend success page. State is now fully synced in DB.
    res.redirect(`${domainUrl}/payment-success?session_id=${sessionId}`);
  });

  public static handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const rawBody = req.body;

    const result = await PaymentService.handleWebhook(signature, rawBody);

    res.status(200).json(result);
  });
}
