import type { AuthService } from "./services/auth";
import type { CategoryService } from "./services/categories";
import type { PostService } from "./services/posts";
import type { TagService } from "./services/tags";

export interface Env {
  // D1 Database
  DB: D1Database;

  // Environment variables
  JWT_SECRET: string;
  ALLOWED_ORIGINS: string;
}

declare module "hono" {
  interface ContextVariableMap {
    postService: PostService;
    categoryService: CategoryService;
    tagService: TagService;
    authService: AuthService;
    jwtPayload: {
      sub: number;
      role: "admin" | "user";
      exp: number;
    };
  }
}
