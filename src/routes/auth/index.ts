import { OpenAPIHono } from "@hono/zod-openapi";
import { rateLimiter } from "hono-rate-limiter";
import { changePasswordHandler, loginHandler } from "./handlers";
import { changePasswordRoute, loginRoute } from "./routers";

const authRouter = new OpenAPIHono();

authRouter.use(
    "*",
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: "draft-7",
        keyGenerator: (c) => {
            const xff = c.req.header("x-forwarded-for");
            const ipFromXff = xff?.split(",")[0]?.trim();

            return (
                ipFromXff ||
                c.req.header("cf-connecting-ip") ||
                c.req.header("x-real-ip") ||
                // Avoid collapsing all clients into one bucket
                `${c.req.header("user-agent") ?? "unknown"}|${c.req.path}`
            );
        },
        message: {
            error: "Too many requests, please try again later.",
        },
    }),
);

authRouter.openapi(loginRoute, loginHandler);
authRouter.openapi(changePasswordRoute, changePasswordHandler);

export default authRouter;
