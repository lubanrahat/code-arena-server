import express, { type Application } from "express";
import cors from "cors";
import { requestIdMiddleware } from "./shared/middlewares/request-id.middleware";
import { requestLogger } from "./shared/middlewares/request-logger.middleware";
import { errorHandler } from "./shared/middlewares/global-error.middleware";
import { notFound } from "./shared/middlewares/not-found.middlewares";
import { IndexRouter } from "./routes";
import cookieParser from "cookie-parser";

function createApplication(): Application {
  const app: Application = express();

  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "https://localhost:3000",
        "http://localhost:5173",
        "https://code-arena-client.vercel.app",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie", "cookie"],
    }),
  );

  // Stripe webhook needs raw body
  app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Global request processing middlewares
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  // Global route middlewares
  app.use("/api/v1", IndexRouter);

  // Global Error handling middleware
  app.use(errorHandler);
  // Global Not Found middleware
  app.use(notFound);

  return app;
}

export default createApplication;
