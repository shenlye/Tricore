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

// 数字花园：添加文章链接
export function createAddPostLinkHandler(): RouteHandler<typeof routes.addPostLinkRoute, { Bindings: Env }> {
  return async (c) => {
    const postService = c.get("postService");
    const { id } = c.req.valid("param");
    const { targetPostId, context } = c.req.valid("json");

    // 检查源文章是否存在
    const sourcePost = await postService.getPostByIdentifier(id, false);
    if (!sourcePost) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Source post not found",
          },
        },
        404,
      );
    }

    // 检查目标文章是否存在
    const targetPost = await postService.getPostByIdentifier(targetPostId, false);
    if (!targetPost) {
      return c.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: `Target post with ID "${targetPostId}" not found`,
          },
        },
        400,
      );
    }

    // 不能链接到自己
    if (sourcePost.id === targetPost.id) {
      return c.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Cannot link a post to itself",
          },
        },
        400,
      );
    }

    try {
      const link = await postService.addPostLink(sourcePost.id, targetPost.id, context);
      return c.json(
        {
          success: true,
          data: link,
        },
        201,
      );
    }
    catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      // SQLite 唯一约束错误 - 检查各种可能的错误信息格式
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("unique")
        || lowerMessage.includes("constraint")
        || lowerMessage.includes("primary key")
        || lowerMessage.includes("already exists")
        || lowerMessage.includes("duplicate")) {
        return c.json(
          {
            success: false,
            error: {
              code: "CONFLICT",
              message: "Link already exists",
            },
          },
          409,
        );
      }
      // 重新抛出其他错误
      throw e;
    }
  };
}

// 数字花园：删除文章链接
export function createRemovePostLinkHandler(): RouteHandler<typeof routes.removePostLinkRoute, { Bindings: Env }> {
  return async (c) => {
    const postService = c.get("postService");
    const { id, targetId } = c.req.valid("param");

    const result = await postService.removePostLink(id, targetId);

    if (!result) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Link not found",
          },
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        data: { success: true },
      },
      200,
    );
  };
}

// 数字花园：获取文章链接关系
export function createGetPostLinksHandler(): RouteHandler<typeof routes.getPostLinksRoute, { Bindings: Env }> {
  return async (c) => {
    const postService = c.get("postService");
    const { id } = c.req.valid("param");

    // 检查文章是否存在
    const post = await postService.getPostByIdentifier(id, false);
    if (!post) {
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

    const links = await postService.getPostLinks(id);

    return c.json(
      {
        success: true,
        data: links,
      },
      200,
    );
  };
}

// 数字花园：搜索文章（用于链接自动完成）
export function createSearchPostsHandler(): RouteHandler<typeof routes.searchPostsRoute, { Bindings: Env }> {
  return async (c) => {
    const postService = c.get("postService");
    const env = validateEnv(c.env);
    const jwtSecret = env.JWT_SECRET;

    const { q, limit } = c.req.valid("query");

    // 检查是否是管理员（决定是否只返回已发布文章）
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

    const results = await postService.searchPosts(q, limit, onlyPublished);

    return c.json(
      {
        success: true,
        data: results,
      },
      200,
    );
  };
}
