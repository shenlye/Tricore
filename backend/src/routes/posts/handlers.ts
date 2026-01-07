import type { RouteHandler } from "@hono/zod-openapi";
import { db } from "../../db";
import { PostService } from "../../services/posts";
import type {
    createPostRoute,
    deletePostRoute,
    getPostRoute,
    listPostsRoute,
    updatePostRoute,
} from "./routes";

export const postService = new PostService(db);
export const getPostHandler: RouteHandler<typeof getPostRoute> = async (c) => {
    const { slug } = c.req.valid("param");

    const result = await postService.getPostBySlug(slug);

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

export const listPostsHandler: RouteHandler<typeof listPostsRoute> = async (
    c,
) => {
    const { page: pageStr, limit: limitStr } = c.req.valid("query");
    const page = Math.max(1, Number(pageStr) || 1);
    const limit = Math.min(20, Math.max(1, Number(limitStr) || 10));

    const { data, total } = await postService.listPosts(page, limit);

    return c.json(
        {
            success: true,
            data: data.map((item) => postService.formatPost(item)),
            meta: {
                total,
                page,
                limit,
            },
        },
        200,
    );
};

export const createPostHandler: RouteHandler<typeof createPostRoute> = async (
    c,
) => {
    const {
        title,
        content,
        slug: providedSlug,
        description,
        cover,
        isPublished,
        category,
        tags,
    } = c.req.valid("json");
    let slug = providedSlug;
    if (!slug) {
        const datePrefix = new Date().toISOString().split("T")[0]; // 2026-01-05

        // Math.random() is not suitable for generating unique identifiers
        const randomPart = Buffer.from(
            crypto.getRandomValues(new Uint8Array(4)),
        ).toString("hex");
        slug = `${datePrefix}-${randomPart}`;
    }

    const exists = await postService.existsBySlug(slug);

    if (exists) {
        return c.json(
            {
                success: false,
                error: {
                    code: "CONFLICT",
                    message:
                        "Slug already exists, please choose a different one",
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

    // biome-ignore lint/suspicious/noExplicitAny: 不会写
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
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message.includes("UNIQUE") && message.includes("posts.slug")) {
            return c.json(
                {
                    success: false,
                    error: {
                        code: "CONFLICT",
                        message:
                            "Slug already exists, please choose a different one",
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

export const updatePostHandler: RouteHandler<typeof updatePostRoute> = async (
    c,
) => {
    const { id } = c.req.valid("param");
    const values = c.req.valid("json");

    let result: UpdatePostResult;
    try {
        result = await postService.updatePost(id, values);
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message.includes("UNIQUE") && message.includes("posts.slug")) {
            return c.json(
                {
                    success: false,
                    error: {
                        code: "CONFLICT",
                        message:
                            "Slug already exists, please choose a different one",
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

export const deletePostHandler: RouteHandler<typeof deletePostRoute> = async (
    c,
) => {
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
