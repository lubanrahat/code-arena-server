import express, { type Application } from "express";
import cors from "cors";
import { requestIdMiddleware } from "./shared/middlewares/request-id.middleware";
import { requestLogger } from "./shared/middlewares/request-logger.middleware";
import { errorHandler } from "./shared/middlewares/global-error.middleware";
import { notFound } from "./shared/middlewares/not-found.middlewares";
import { IndexRouter } from "./routes";

function createApplication(): Application {
  const app: Application = express();

  app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
