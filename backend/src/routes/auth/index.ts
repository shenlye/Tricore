import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import { createChangePasswordHandler, createLoginHandler } from "./handlers";
import { changePasswordRoute, loginRoute } from "./routers";

export function createAuthRouter() {
  const authRouter = new OpenAPIHono<{ Bindings: Env }>({ defaultHook });

  authRouter
    .openapi(loginRoute, createLoginHandler())
    .openapi(changePasswordRoute, createChangePasswordHandler());

  return authRouter;
}

export default createAuthRouter;
