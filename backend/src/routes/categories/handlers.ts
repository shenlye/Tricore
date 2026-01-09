import type { RouteHandler } from "@hono/zod-openapi";
import { db } from "../../db";
import { CategoryService } from "../../services/categories";
import type { listCategoriesRoute } from "./routes";

const categoryService = new CategoryService(db);

export const listCategoriesHandler: RouteHandler<
	typeof listCategoriesRoute
> = async (c) => {
	const categories = await categoryService.listAll();

	return c.json(
		{
			success: true,
			data: categories,
		},
		200,
	);
};
