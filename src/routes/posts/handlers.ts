import type { RouteHandler } from "@hono/zod-openapi";
import { count, eq } from "drizzle-orm";
import { db } from "../../db";
import { posts } from "../../db/schema";
import type { createPostRoute, getPostRoute, listPostsRoute } from "./routes";

export const getPostHandler: RouteHandler<typeof getPostRoute> = async (c) => {
    const { slug } = c.req.valid("param");

    const result = await db.select().from(posts).where(eq(posts.slug, slug));

    if (result.length === 0) {
        return c.json(
            {
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "文章不存在",
                },
            },
            404,
        );
    }

    return c.json(
        {
            success: true,
            data: {
                ...result[0],
                createdAt: result[0].createdAt.toISOString(),
                updatedAt: result[0].updatedAt.toISOString(),
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
        db
            .select({
                id: posts.id,
                title: posts.title,
                slug: posts.slug,
                description: posts.description,
                categories: posts.categories,
                tags: posts.tags,
                cover: posts.cover,
                createdAt: posts.createdAt,
                updatedAt: posts.updatedAt,
                isPublished: posts.isPublished,
            })
            .from(posts)
            .limit(limit)
            .offset((page - 1) * limit),
        db.select({ count: count() }).from(posts),
    ]);

    return c.json(
        {
            success: true,
            data: data.map((item) => ({
                ...item,
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
    const { title, content, slug } = c.req.valid("json");
    const payload = c.get("jwtPayload");

    const userId = payload?.sub;
    if (!userId) {
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

    const isAdmin = payload?.role === "admin";
    if (!isAdmin) {
        return c.json(
            {
                success: false,
                error: {
                    code: "FORBIDDEN",
                    message: "Forbidden: Admin access required",
                },
            },
            403,
        );
    }

    const existingPost = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

    if (existingPost.length > 0) {
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

    const result = await db
        .insert(posts)
        .values({ title, content, slug })
        .returning();

    return c.json(
        {
            success: true,
            message: "Post created successfully",
            data: {
                ...result[0],
                createdAt: result[0].createdAt.toISOString(),
                updatedAt: result[0].updatedAt.toISOString(),
            },
        },
        201,
    );
};
