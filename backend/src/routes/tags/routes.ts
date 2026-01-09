import { createRoute, z } from "@hono/zod-openapi";
import { createSuccessSchema } from "../../lib/schema";

export const TagSchema = z.object({
	id: z.number().openapi({ example: 1 }),
	name: z.string().openapi({ example: "Hono" }),
	postCount: z.number().openapi({ example: 5 }),
});

export const listTagsRoute = createRoute({
	method: "get",
	path: "/",
	responses: {
		200: {
			content: {
				"application/json": {
					schema: createSuccessSchema(z.array(TagSchema)),
				},
			},
			description: "List all tags with post count",
		},
	},
	tags: ["Tags"],
});
