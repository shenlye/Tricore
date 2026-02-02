import type { Context } from "hono";
import type { Env } from "../../types";

export function createListCategoriesHandler() {
  return async (c: Context<{ Bindings: Env }>) => {
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
