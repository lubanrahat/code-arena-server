import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";
import { logger } from "../shared/logger/logger";
import { Pool } from "pg";
import config from "../config/env";

const connectionString = `${config.database.url}`;

const pool = new Pool({ connectionString });

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

pool.on("connect", () => {
  logger.info("Database connected successfully");
});

pool.on("error", (err) => {
  logger.error("Database connection error", err);
});

export default prisma;
