import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import { createListTagsHandler } from "./handlers";
import { listTagsRoute } from "./routes";

export function createTagsRouter() {
  return new OpenAPIHono<{ Bindings: Env }>({ defaultHook })
    .openapi(listTagsRoute, createListTagsHandler());
}

export default createTagsRouter;
