import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  //Application
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(8080),
  //Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  //JWT
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required"),
  //JUDGE0
  JUDGE0_API_KEY: z.string().min(1, "JUDGE0_API_KEY is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.issues);
  process.exit(1);
}

const env = parsedEnv.data;

const config = {
  app: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  },
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  judge0: {
    apiKey: env.JUDGE0_API_KEY,
  },
};

export default config;
