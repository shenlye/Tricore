import { z } from "@hono/zod-openapi";

export const PostSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        title: z.string().nullable().openapi({ example: "Hello World" }),
        slug: z.string().nullable().openapi({ example: "hello-world" }),
        content: z.string().openapi({ example: "This is a post content" }),
        description: z
            .string()
            .nullable()
            .openapi({ example: "A short description" }),
        categories: z.array(z.string()).openapi({ example: ["tech"] }),
        tags: z.array(z.string()).openapi({ example: ["hono", "zod"] }),
        cover: z
            .string()
            .nullable()
            .openapi({ example: "https://example.com/cover.jpg" }),
        isPublished: z.boolean().openapi({ example: true }),
        createdAt: z.string().openapi({ example: "2023-01-01T00:00:00.000Z" }),
        updatedAt: z.string().openapi({ example: "2023-01-01T00:00:00.000Z" }),
    })
    .openapi("Post");

export const createPostSchema = z
    .object({
        title: z
            .string()
            .max(100, "Title is too long")
            .optional()
            .openapi({ example: "New Post" }),
        slug: z
            .string()
            .regex(
                /^[a-z0-9-]+$/,
                "Slug can only contain lowercase letters, numbers, and hyphens",
            )
            .max(100, "Slug is too long")
            .optional()
            .openapi({ example: "new-post" }),
        content: z
            .string()
            .min(1, "Content is required")
            .openapi({ example: "This is the content of the new post." }),
        description: z
            .string()
            .optional()
            .openapi({ example: "A short description of the post" }),
    })
    .openapi("CreatePost");

export const paginationSchema = z.object({
    page: z.string().optional().default("1").openapi({ example: "1" }),
    limit: z.string().optional().default("10").openapi({ example: "10" }),
});
