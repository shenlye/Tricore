import type { RouteHandler } from "@hono/zod-openapi";
import type { Env } from "../../types";
import type { listCategoriesRoute } from "./routes";

export function createListCategoriesHandler(): RouteHandler<typeof listCategoriesRoute, { Bindings: Env }> {
  return async (c) => {
    const categoryService = c.get("categoryService");

    const categories = await categoryService.listAll();

    return c.json(
      {
        success: true,
        data: categories,
      },
      200,
    );
  };
}
