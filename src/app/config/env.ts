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
  //GitHub OAuth
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
  //Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  //Session
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
  //Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1, "STRIPE_PUBLISHABLE_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  STRIPE_PRICE_MONTHLY: z.string().min(1, "STRIPE_PRICE_MONTHLY is required"),
  STRIPE_PRICE_YEARLY: z.string().min(1, "STRIPE_PRICE_YEARLY is required"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
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
  githubOAuth: {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  },
  googleOAuth: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
  session: {
    secret: env.SESSION_SECRET,
  },
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    priceMonthly: env.STRIPE_PRICE_MONTHLY,
    priceYearly: env.STRIPE_PRICE_YEARLY,
  },
  client: {
    url: env.CLIENT_URL,
  }
};

export default config;
