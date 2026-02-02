import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import { createListCategoriesHandler } from "./handlers";
import { listCategoriesRoute } from "./routes";

export function createCategoriesRouter() {
  const categoriesRouter = new OpenAPIHono<{ Bindings: Env }>({ defaultHook });

  categoriesRouter.openapi(listCategoriesRoute, createListCategoriesHandler());

  return categoriesRouter;
}

export default createCategoriesRouter;
