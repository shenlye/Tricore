import type { RouteHandler } from "@hono/zod-openapi";
import { count, eq } from "drizzle-orm";
import { db } from "../../db";
import { posts } from "../../db/schema";
import type { createPostRoute, getPostRoute, listPostsRoute } from "./routes";

export const getPostHandler: RouteHandler<typeof getPostRoute> = async (c) => {
    const { slug } = c.req.valid("param");

    const result = await db.query.posts.findFirst({
        where: eq(posts.slug, slug),
        with: {
            category: true,
            postsToTags: {
                with: {
                    tag: true,
                },
            },
        },
    });

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
            data: {
                ...result,
                categories: result.category ? [result.category.name] : [],
                tags: result.postsToTags.map((pt) => pt.tag.name),
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt.toISOString(),
            },
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

    const [data, total] = await Promise.all([
        db.query.posts.findMany({
            limit: limit,
            offset: (page - 1) * limit,
            columns: {
                content: false,
            },
            with: {
                category: true,
                postsToTags: {
                    with: {
                        tag: true,
                    },
                },
            },
            orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        }),
        db.select({ count: count() }).from(posts),
    ]);

    return c.json(
        {
            success: true,
            data: data.map((item) => ({
                ...item,
                categories: item.category ? [item.category.name] : [],
                tags: item.postsToTags.map((pt) => pt.tag.name),
                createdAt: item.createdAt.toISOString(),
                updatedAt: item.updatedAt.toISOString(),
            })),
            meta: {
                total: total[0].count,
                page: page,
                limit: limit,
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
        categoryId,
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

    const existingPost = await db.query.posts.findFirst({
        where: eq(posts.slug, slug),
    });

    if (existingPost) {
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

    const [newPost] = await db
        .insert(posts)
        .values({
            title,
            content,
            slug,
            description,
            authorId: Number(authorId),
            cover,
            isPublished,
            categoryId,
        })
        .returning();

    const result = await db.query.posts.findFirst({
        where: eq(posts.id, newPost.id),
        with: {
            category: true,
            postsToTags: {
                with: {
                    tag: true,
                },
            },
        },
    });

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

    const {
        category,
        postsToTags,
        categoryId: _categoryId,
        authorId: _authorId,
        createdAt,
        updatedAt,
        ...cleanResult
    } = result;

    return c.json(
        {
            success: true,
            data: {
                ...cleanResult,
                categories: category ? [category.name] : [],
                tags: postsToTags.map((pt) => pt.tag.name),
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt.toISOString(),
            },
        },
        201,
    );
};
