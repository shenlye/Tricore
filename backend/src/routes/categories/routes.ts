import { createRoute, z } from "@hono/zod-openapi";
import { createSuccessSchema } from "../../lib/schema";

export const CategorySchema = z.object({
	id: z.number().openapi({ example: 1 }),
	name: z.string().openapi({ example: "技术" }),
	slug: z.string().openapi({ example: "ji-shu" }),
});

export const listCategoriesRoute = createRoute({
	method: "get",
	path: "/",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: createSuccessSchema(z.array(CategorySchema)),
				},
			},
			description: "List all categories",
		},
	},
	tags: ["Categories"],
});
