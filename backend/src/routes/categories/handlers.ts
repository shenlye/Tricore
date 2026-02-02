import type { Context } from "hono";
import type { Env } from "../../types";
import { createDb } from "../../db";
import { CategoryService } from "../../services/categories";

export function createListCategoriesHandler() {
  return async (c: Context<{ Bindings: Env }>) => {
    const db = createDb(c.env.DB);
    const categoryService = new CategoryService(db);

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
