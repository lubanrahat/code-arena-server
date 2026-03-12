import express, { type Application } from "express";
import cors from "cors";

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

  return app;
}

export default createApplication;
