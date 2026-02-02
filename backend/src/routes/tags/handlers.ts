import type { Context } from "hono";
import type { Env } from "../../types";

export function createListTagsHandler() {
  return async (c: Context<{ Bindings: Env }>) => {
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
