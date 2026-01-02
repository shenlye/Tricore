import { OpenAPIHono } from "@hono/zod-openapi";
import { loginHandler } from "./handlers";
import { loginRoute } from "./routers";

const authRouter = new OpenAPIHono();

authRouter.openapi(loginRoute, loginHandler);

export default authRouter;
