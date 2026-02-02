import type { Context } from "hono";
import type { Env } from "../../types";
import { createDb } from "../../db";
import { TagService } from "../../services/tags";

export function createListTagsHandler() {
  return async (c: Context<{ Bindings: Env }>) => {
    const db = createDb(c.env.DB);
    const tagService = new TagService(db);

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
