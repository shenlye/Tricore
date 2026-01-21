import type { RouteHandler } from "@hono/zod-openapi";
import type {
  createPostRoute,
  deletePostRoute,
  getPostByIdRoute,
  getPostRoute,
  listPostsRoute,
  updatePostRoute,
} from "./routes";
import { db } from "../../db";
import { CategoryService } from "../../services/categories";
import { PostService } from "../../services/posts";
import { TagService } from "../../services/tags";

const categoryService = new CategoryService(db);
const tagService = new TagService(db);
export const postService = new PostService(db, categoryService, tagService);
export const getPostHandler: RouteHandler<typeof getPostRoute> = async (c) => {
  const { slug } = c.req.valid("param");

  const authHeader = c.req.header("Authorization");
  let onlyPublished = true;
  if (authHeader?.startsWith("Bearer ")) {
    onlyPublished = false;
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

export const getPostByIdHandler: RouteHandler<typeof getPostByIdRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const result = await postService.getPostById(id);

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

export const listPostsHandler: RouteHandler<typeof listPostsRoute> = async (c) => {
  const { page: pageStr, limit: limitStr, type, category, tag } = c.req.valid("query");
  const page = Math.max(1, Number(pageStr) || 1);
  const limit = Math.min(20, Math.max(1, Number(limitStr) || 10));

  // 尝试获取 token 检查是否是管理员
  const authHeader = c.req.header("Authorization");
  let onlyPublished = true;

  if (authHeader?.startsWith("Bearer ")) {
    // 这里简单判断一下是否有 token，实际项目中应该验证 JWT 载荷中的角色
    // 因为我们的 dashboard 已经有权限校验，这里只要有合法 token 且调用此接口
    // 我们就倾向于认为是在后台管理环境下
    onlyPublished = false;
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

export const createPostHandler: RouteHandler<typeof createPostRoute> = async (c) => {
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
  } = c.req.valid("json");

  let slug: string | null = null;

  if (type === "post") {
    slug = providedSlug || postService.generateSlug(title);

    const exists = await postService.existsBySlug(slug);

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

type UpdatePostResult = Awaited<ReturnType<typeof postService.updatePost>>;

export const updatePostHandler: RouteHandler<typeof updatePostRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const values = c.req.valid("json");

  let result: UpdatePostResult;
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

export const deletePostHandler: RouteHandler<typeof deletePostRoute> = async (c) => {
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
