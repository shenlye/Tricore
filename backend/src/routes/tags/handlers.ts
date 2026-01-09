import type { RouteHandler } from "@hono/zod-openapi";
import { db } from "../../db";
import { TagService } from "../../services/tags";
import type { listTagsRoute } from "./routes";

const tagService = new TagService(db);

export const listTagsHandler: RouteHandler<typeof listTagsRoute> = async (
	c,
) => {
	const tags = await tagService.listAllWithCount();

	return c.json(
		{
			success: true,
			data: tags,
		},
		200,
	);
};
