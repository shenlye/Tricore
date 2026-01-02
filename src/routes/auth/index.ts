import { OpenAPIHono } from "@hono/zod-openapi";
import { rateLimiter } from "hono-rate-limiter";
import { changePasswordHandler, loginHandler } from "./handlers";
import { changePasswordRoute, loginRoute } from "./routers";

const authRouter = new OpenAPIHono();

authRouter.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: "draft-7",
        keyGenerator: (c) => c.req.header("x-forwarded-for") || "",
    }),
);

authRouter.openapi(loginRoute, loginHandler);
authRouter.openapi(changePasswordRoute, changePasswordHandler);

export default authRouter;
