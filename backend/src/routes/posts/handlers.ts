import type { RouteHandler } from "@hono/zod-openapi";
import type { Env } from "../../types";
import type * as routes from "./routes";
import { verify } from "hono/jwt";
import { validateEnv } from "../../lib/env";

export function createGetPostHandler(): RouteHandler<typeof routes.getPostRoute, { Bindings: Env }> {
  return async (c) => {
    const postService = c.get("postService");
    const env = validateEnv(c.env);
    const jwtSecret = env.JWT_SECRET;
    const { idOrSlug } = c.req.valid("param");

    const authHeader = c.req.header("Authorization");
    let onlyPublished = true;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = await verify(token, jwtSecret, "HS256");
        if (payload.role === "admin") {
          onlyPublished = false;
        }
      }
      catch {
        // Invalid token or not an admin, keep onlyPublished as true
      }
    }

    const result = await postService.getPostByIdentifier(idOrSlug, onlyPublished);

    if (!result) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Post not found",
          },
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        data: postService.formatPost(result),
      },
      200,
    );
  };
}

export function createListPostsHandler(): RouteHandler<typeof routes.listPostsRoute, { Bindings: Env }> {
  return async (c) => {
    const postService = c.get("postService");
    const env = validateEnv(c.env);
    const jwtSecret = env.JWT_SECRET;

    const { page: pageStr, limit: limitStr, category, tag } = c.req.valid("query");

    const page = Math.max(1, Number(pageStr) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitStr) || 10));

    // 验证 JWT token 以确定是否可以访问未发布的文章
    const authHeader = c.req.header("Authorization");
    let onlyPublished = true;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = await verify(token, jwtSecret, "HS256");
        if (payload.role === "admin") {
          onlyPublished = false;
        }
      }
      catch {
        // Invalid token or not an admin, keep onlyPublished as true
      }
    }

    const { data, total } = await postService.listPosts(page, limit, category, tag, onlyPublished);

    return c.json(
      {
        success: true,
        data: data.map(item => postService.formatPost(item)),
        meta: {
          total,
          page,
          limit,
        },
      },
      200,
    );
  };
}

export function createCreatePostHandler(): RouteHandler<typeof routes.createPostRoute, { Bindings: Env }> {
  return async (c) => {
    const postService = c.get("postService");

    const {
      title,
      slug: providedSlug,
      content,
      description,
      cover,
      isPublished,
      category,
      tags,
    } = c.req.valid("json");

    let slug: string | null = null;

    slug = providedSlug || postService.generateSlug(title);

    const exists = await postService.existsBySlug(slug!);

    if (exists) {
      return c.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "Slug already exists, please choose a different one",
          },
        },
        409,
      );
    }

    const payload = c.get("jwtPayload");

    const authorId = payload?.sub;
    if (!authorId) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          },
        },
        401,
      );
    }

    let result: any;
    try {
      result = await postService.createPost({
        title,
        content,
        slug,
        description,
        authorId: Number(authorId),
        cover,
        isPublished,
        category,
        tags,
      });
    }
    catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("UNIQUE") && message.includes("posts.slug")) {
        return c.json(
          {
            success: false,
            error: {
              code: "CONFLICT",
              message: "Slug already exists, please choose a different one",
            },
          },
          409,
        );
      }
      throw e;
    }

    if (!result) {
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to retrieve created post",
          },
        },
        500,
      );
    }

    return c.json(
      {
        success: true,
        data: postService.formatPost(result),
      },
      201,
    );
  };
}

export function createUpdatePostHandler(): RouteHandler<typeof routes.updatePostRoute, { Bindings: Env }> {
  return async (c) => {
    const postService = c.get("postService");
    const { id } = c.req.valid("param");
    const values = c.req.valid("json");

    let result: any;
    try {
      result = await postService.updatePost(id, values);
    }
    catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("UNIQUE") && message.includes("posts.slug")) {
        return c.json(
          {
            success: false,
            error: {
              code: "CONFLICT",
              message: "Slug already exists, please choose a different one",
            },
          },
          409,
        );
      }
      throw e;
    }

    if (!result) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Post not found",
          },
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        data: postService.formatPost(result),
      },
      200,
    );
  };
}

export function createDeletePostHandler(): RouteHandler<typeof routes.deletePostRoute, { Bindings: Env }> {
  return async (c) => {
    const postService = c.get("postService");
    const { id } = c.req.valid("param");

    const result = await postService.deletePost(id);

    if (result.length === 0) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Post not found",
          },
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        data: { id },
      },
      200,
    );
  };
}
