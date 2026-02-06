import type { Env } from "../types";
import { createMiddleware } from "hono/factory";
import { createDb } from "../db";
import { validateEnv } from "../lib/env";
import { AuthService } from "../services/auth";
import { CategoryService } from "../services/categories";
import { MemoService } from "../services/memos";
import { PostService } from "../services/posts";
import { TagService } from "../services/tags";

let servicesCache: {
  postService: PostService;
  memoService: MemoService;
  categoryService: CategoryService;
  tagService: TagService;
  authService: AuthService;
} | null = null;

export const servicesMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  if (!servicesCache) {
    const validatedEnv = validateEnv(c.env);
    const db = createDb(c.env.DB);
    const categoryService = new CategoryService(db);
    const tagService = new TagService(db);
    const postService = new PostService(db, categoryService, tagService);
    const memoService = new MemoService(db);
    const authService = new AuthService(db, validatedEnv.JWT_SECRET);

    servicesCache = {
      categoryService,
      tagService,
      postService,
      memoService,
      authService,
    };
  }

  c.set("postService", servicesCache.postService);
  c.set("memoService", servicesCache.memoService);
  c.set("categoryService", servicesCache.categoryService);
  c.set("tagService", servicesCache.tagService);
  c.set("authService", servicesCache.authService);

  await next();
});
