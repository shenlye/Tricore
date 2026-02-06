import type { RouteHandler } from "@hono/zod-openapi";
import type { Env } from "../../types";
import type { listTagsRoute } from "./routes";

export function createListTagsHandler(): RouteHandler<typeof listTagsRoute, { Bindings: Env }> {
  return async (c) => {
    const tagService = c.get("tagService");

    const tags = await tagService.listAllWithCount();

    return c.json(
      {
        success: true,
        data: tags,
      },
      200,
    );
  };
}
