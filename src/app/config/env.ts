import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  //Application
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(8080),
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
};

export default config;
