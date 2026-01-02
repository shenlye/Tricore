import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import { z } from "zod";
import { env } from "../lib/env";

const jwtMiddleware = jwt({
    secret: env.JWT_SECRET,
});

export const authMiddleware = createMiddleware(
    async (c: Context, next: Next) => {
        try {
            return await jwtMiddleware(c, next);
        } catch (e) {
            console.error("JWT Verification Failed:", e);

            return c.json({ error: "Unauthorized" }, 401);
        }
    },
);

const payloadSchema = z.object({
    sub: z.string(),
    role: z.enum(["admin", "user"]),
    exp: z.number(),
});

export const adminMiddleware = createMiddleware(
    async (c: Context, next: Next) => {
        const payload = c.get("jwtPayload");

        const result = payloadSchema.safeParse(payload);
        if (!result.success) {
            return c.json({ error: "Unauthorized: Invalid session" }, 401);
        }

        if (result.data.role !== "admin") {
            return c.json({ error: "Forbidden: Admin access required" }, 403);
        }

        c.set("user", result.data);

        await next();
    },
);
