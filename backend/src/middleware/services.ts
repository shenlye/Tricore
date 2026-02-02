import { createMiddleware } from "hono/factory";
import { createDb } from "../db";
import { AuthService } from "../services/auth";
import { CategoryService } from "../services/categories";
import { PostService } from "../services/posts";
import { TagService } from "../services/tags";
import type { Env } from "../types";

let servicesCache: {
  postService: PostService;
  categoryService: CategoryService;
  tagService: TagService;
  authService: AuthService;
} | null = null;

export const servicesMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  if (!servicesCache) {
    const db = createDb(c.env.DB);
    const categoryService = new CategoryService(db);
    const tagService = new TagService(db);
    const postService = new PostService(db, categoryService, tagService);
    const authService = new AuthService(db, c.env.JWT_SECRET);

    servicesCache = {
      categoryService,
      tagService,
      postService,
      authService,
    };
  }

  c.set("postService", servicesCache.postService);
  c.set("categoryService", servicesCache.categoryService);
  c.set("tagService", servicesCache.tagService);
  c.set("authService", servicesCache.authService);

  await next();
});
