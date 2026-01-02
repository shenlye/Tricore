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
            const trustedIp =
                c.req.header("cf-connecting-ip") || c.req.header("x-real-ip");
            if (trustedIp) {
                return trustedIp;
            }

            const xff = c.req.header("x-forwarded-for");
            const ips = xff?.split(",");
            const lastIp = ips?.[ips.length - 1]?.trim();
            if (lastIp) return lastIp;

            return `${c.req.header("user-agent") ?? "unknown"}|${c.req.path}`;
        },
        message: {
            success: false,
            error: {
                code: "TOO_MANY_REQUESTS",
                message: "Too many requests, please try again later.",
            },
        },
    }),
);

authRouter.openapi(loginRoute, loginHandler);
authRouter.openapi(changePasswordRoute, changePasswordHandler);

export default authRouter;
