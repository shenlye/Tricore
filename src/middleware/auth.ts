import type { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    if (
        !authHeader ||
        authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`
    ) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
};
