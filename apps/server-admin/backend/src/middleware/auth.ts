import type { Context, Next } from "hono";
import type { Env } from "../types";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import { z } from "zod";
import { validateEnv } from "../lib/env";

export const authMiddleware = createMiddleware<{ Bindings: Env }>(async (c: Context, next: Next) => {
  const env = validateEnv(c.env);
  const jwtSecret = env.JWT_SECRET;

  const jwtMiddleware = jwt({
    secret: jwtSecret,
    alg: "HS256",
  });

  try {
    return await jwtMiddleware(c, next);
  }
  catch (e) {
    console.error("JWT Verification Failed:", e);

    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        },
      },
      401,
    );
  }
});

const payloadSchema = z.object({
  sub: z.number(),
  role: z.enum(["admin", "user"]),
  exp: z.number(),
});

export const adminMiddleware = createMiddleware(async (c: Context, next: Next) => {
  const payload = c.get("jwtPayload");

  const result = payloadSchema.safeParse(payload);
  if (!result.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized: Invalid session",
        },
      },
      401,
    );
  }

  if (result.data.role !== "admin") {
    return c.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Forbidden: Admin access required",
        },
      },
      403,
    );
  }

  c.set("user", result.data);

  await next();
});
