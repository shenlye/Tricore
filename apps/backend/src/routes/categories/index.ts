import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import { createListCategoriesHandler } from "./handlers";
import { listCategoriesRoute } from "./routes";

export function createCategoriesRouter() {
  return new OpenAPIHono<{ Bindings: Env }>({ defaultHook })
    .openapi(listCategoriesRoute, createListCategoriesHandler());
}

export default createCategoriesRouter;
