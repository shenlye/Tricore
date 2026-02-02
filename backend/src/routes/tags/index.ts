import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import { createListTagsHandler } from "./handlers";
import { listTagsRoute } from "./routes";

export function createTagsRouter() {
  const tagsRouter = new OpenAPIHono<{ Bindings: Env }>({ defaultHook });

  tagsRouter.openapi(listTagsRoute, createListTagsHandler());

  return tagsRouter;
}

export default createTagsRouter;
