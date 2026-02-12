import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import { createChangePasswordHandler, createLoginHandler, createMeHandler, createRegisterHandler } from "./handlers";
import { changePasswordRoute, loginRoute, meRoute, registerRoute } from "./routers";

export function createAuthRouter() {
  return new OpenAPIHono<{ Bindings: Env }>({ defaultHook })
    .openapi(loginRoute, createLoginHandler())
    .openapi(registerRoute, createRegisterHandler())
    .openapi(changePasswordRoute, createChangePasswordHandler())
    .openapi(meRoute, createMeHandler());
}

export default createAuthRouter;
