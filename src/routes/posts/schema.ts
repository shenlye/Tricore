import { z } from "@hono/zod-openapi";

export const PostSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        title: z.string().openapi({ example: "Hello World" }),
        slug: z.string().openapi({ example: "hello-world" }),
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
        createdAt: z.string().openapi({ example: "2023-01-01T00:00:00.000Z" }),
        updatedAt: z.string().openapi({ example: "2023-01-01T00:00:00.000Z" }),
    })
    .openapi("Post");

export const createPostSchema = z
    .object({
        title: z
            .string()
            .min(1, "Title is required")
            .max(100, "Title is too long")
            .openapi({ example: "New Post" }),
        slug: z
            .string()
            .min(1)
            .regex(
                /^[a-z0-9-]+$/,
                "Slug can only contain lowercase letters, numbers, and hyphens",
            )
            .max(100, "Slug is too long")
            .openapi({ example: "new-post" }),
        content: z
            .string()
            .min(10, "Content is too short")
            .openapi({ example: "This is the content of the new post." }),
        summary: z
            .string()
            .optional()
            .openapi({ example: "A summary of the post" }),
    })
    .openapi("CreatePost");

export const paginationSchema = z.object({
    page: z.string().optional().default("1").openapi({ example: "1" }),
    limit: z.string().optional().default("10").openapi({ example: "10" }),
});
