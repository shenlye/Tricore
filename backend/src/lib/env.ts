import type { Env } from "../types";
import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().default("dev_secret_key_for_local_development"),
  ALLOWED_ORIGINS: z.string().optional(),
});

export function validateEnv(env: Env) {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(`Environment variable configuration error: ${JSON.stringify(parsed.error.issues)}`);
  }

  return parsed.data;
}

export function getAllowedOrigins(env: Env): string[] {
  const origins = env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173";
  return origins.split(",")
    .map(s => s.trim())
    .filter(Boolean);
}
