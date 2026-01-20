import type { RouteHandler } from "@hono/zod-openapi";
import type { listCategoriesRoute } from "./routes";
import { db } from "../../db";
import { CategoryService } from "../../services/categories";

const categoryService = new CategoryService(db);

export const listCategoriesHandler: RouteHandler<typeof listCategoriesRoute> = async (c) => {
  const categories = await categoryService.listAll();

  return c.json(
    {
      success: true,
      data: categories,
    },
    200,
  );
};
