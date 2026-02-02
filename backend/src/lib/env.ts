import type { Env } from "../types";
import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().min(1),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default("admin123456"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173,http://127.0.0.1:5173"),
});

export function validateEnv(env: Env) {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(`Environment variable configuration error: ${JSON.stringify(parsed.error.issues)}`);
  }

  return parsed.data;
}

export function getAllowedOrigins(env: Env): string[] {
  return env.ALLOWED_ORIGINS.split(",")
    .map(s => s.trim())
    .filter(Boolean);
}
