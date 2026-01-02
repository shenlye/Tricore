import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing in environment variables.");
}

const jwtMiddleware = jwt({
    secret: jwtSecret,
});

export const authMiddleware = createMiddleware(
    async (c: Context, next: Next) => {
        try {
            return await jwtMiddleware(c, next);
        } catch {
            return c.json({ error: "Unauthorized" }, 401);
        }
    },
);

export const adminMiddleware = createMiddleware(
    async (c: Context, next: Next) => {
        const payload = c.get("jwtPayload");
        if (payload?.role !== "admin") {
            return c.json({ error: "Forbidden: Admins only" }, 403);
        }
        await next();
    },
);
