import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/aethersense"),
  MONGODB_DB: z.string().default("aethersense"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  JWT_SECRET: z.string().default("dev-secret-change-me"),
  LOG_LEVEL: z.string().default("info"),
  // Single-tenant write guard for ingestion/writes. When unset, write
  // endpoints answer 503 WRITE_MODE_NOT_CONFIGURED instead of staying open.
  INGEST_API_TOKEN: z.string().optional(),
  // Shared secret required on provider webhook callbacks.
  WEBHOOK_SHARED_SECRET: z.string().optional(),
  MEKO_BASE_URL: z.string().optional(),
  MEKO_API_KEY: z.string().optional(),
  // Notification providers: both URL and token must be set for a channel
  // to report available. The router never fakes a successful send.
  WHATSAPP_API_URL: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  SMS_API_URL: z.string().optional(),
  SMS_API_TOKEN: z.string().optional(),
  PUSH_API_URL: z.string().optional(),
  PUSH_API_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;
export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  cached = parsed.data;
  return cached;
}

export const env = loadEnv();
