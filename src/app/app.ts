import express, { type Application } from "express";
import cors from "cors";
import { requestIdMiddleware } from "./shared/middlewares/request-id.middleware";
import { requestLogger } from "./shared/middlewares/request-logger.middleware";
import { errorHandler } from "./shared/middlewares/global-error.middleware";
import { notFound } from "./shared/middlewares/not-found.middlewares";
import { IndexRouter } from "./routes";
import cookieParser from "cookie-parser";
import config from "./config/env";

function createApplication(): Application {
  const app: Application = express();

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:5173",
    config.client.url?.replace(/\/$/, ""),
    "https://code-arena-client.vercel.app",
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
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
