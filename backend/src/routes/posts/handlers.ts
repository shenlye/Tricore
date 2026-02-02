import type { Context } from "hono";
import type { Env } from "../../types";
import { verify } from "hono/jwt";

export function createGetPostHandler() {
  return async (c: Context<{ Bindings: Env }>) => {
    const postService = c.get("postService");
    const jwtSecret = c.env.JWT_SECRET;
    const slug = c.req.param("slug");

    const authHeader = c.req.header("Authorization");
    let onlyPublished = true;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        await verify(token, jwtSecret, "HS256");
        onlyPublished = false;
      }
      catch {
        // Invalid token, keep onlyPublished as true
      }
    }

    const result = await postService.getPostBySlug(slug, onlyPublished);

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

export function createGetPostByIdHandler() {
  return async (c: Context<{ Bindings: Env }>) => {
    const postService = c.get("postService");
    const jwtSecret = c.env.JWT_SECRET;
    const id = Number(c.req.param("id"));

    const authHeader = c.req.header("Authorization");
    let onlyPublished = true;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        await verify(token, jwtSecret, "HS256");
        onlyPublished = false;
      }
      catch {
        // Invalid token, keep onlyPublished as true
      }
    }

    const result = await postService.getPostById(id, onlyPublished);

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

export function createListPostsHandler() {
  return async (c: Context<{ Bindings: Env }>) => {
    const postService = c.get("postService");
    const jwtSecret = c.env.JWT_SECRET;

    const url = new URL(c.req.url);
    const pageStr = url.searchParams.get("page") || "1";
    const limitStr = url.searchParams.get("limit") || "10";
    const type = url.searchParams.get("type") as "post" | "memo" | undefined;
    const category = url.searchParams.get("category") || undefined;
    const tag = url.searchParams.get("tag") || undefined;

    const page = Math.max(1, Number(pageStr) || 1);
    const limit = Math.min(20, Math.max(1, Number(limitStr) || 10));

    // 验证 JWT token 以确定是否可以访问未发布的文章
    const authHeader = c.req.header("Authorization");
    let onlyPublished = true;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        await verify(token, jwtSecret, "HS256");
        onlyPublished = false;
      }
      catch {
        // Invalid token, keep onlyPublished as true
      }
    }

    const { data, total } = await postService.listPosts(page, limit, type, category, tag, onlyPublished);

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

export function createCreatePostHandler() {
  return async (c: Context<{ Bindings: Env }>) => {
    const postService = c.get("postService");

    const {
      title,
      type,
      content,
      slug: providedSlug,
      description,
      cover,
      isPublished,
      category,
      tags,
    } = await c.req.json();

    let slug: string | null = null;

    if (type === "post") {
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
        type,
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

export function createUpdatePostHandler() {
  return async (c: Context<{ Bindings: Env }>) => {
    const postService = c.get("postService");
    const id = Number(c.req.param("id"));
    const values = await c.req.json();

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

export function createDeletePostHandler() {
  return async (c: Context<{ Bindings: Env }>) => {
    const postService = c.get("postService");
    const id = Number(c.req.param("id"));

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
