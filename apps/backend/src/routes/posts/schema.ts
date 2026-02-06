import { z } from "@hono/zod-openapi";

export const PostSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    title: z.string().nullable().openapi({ example: "Hello World" }),
    slug: z.string().nullable().openapi({ example: "hello-world" }),
    content: z.string().openapi({ example: "This is a post content" }),
    description: z.string().nullable().openapi({ example: "A short description" }),
    categories: z.array(z.string()).openapi({ example: ["tech"] }),
    tags: z.array(z.string()).openapi({ example: ["hono", "zod"] }),
    cover: z.string().nullable().openapi({ example: "https://example.com/cover.jpg" }),
    isPublished: z.boolean().openapi({ example: true }),
    createdAt: z.string().openapi({ example: "2023-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2023-01-01T00:00:00.000Z" }),
  })
  .openapi("Post");

export const createPostSchema = z
  .object({
    title: z.string().max(100, "Title is too long").optional().openapi({ example: "New Post" }),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
      .max(100, "Slug is too long")
      .optional()
      .openapi({ example: "new-post" }),
    content: z
      .string()
      .default("")
      .openapi({ example: "This is the content of the new post." }),
    description: z.string().optional().openapi({ example: "A short description of the post" }),
    cover: z.url().optional().openapi({ example: "https://example.com/cover.jpg" }),

    isPublished: z.boolean().default(false).openapi({ example: true }),

    category: z.string().optional().openapi({ example: "Tech" }),
    tags: z
      .array(z.string())
      .optional()
      .openapi({ example: ["Hono", "Zod"] }),
  })
  .openapi("CreatePost");

export const updatePostSchema = z
  .object({
    title: z.string().max(100, "Title is too long").optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
      .max(100, "Slug is too long")
      .optional(),
    content: z.string().optional(),
    description: z.string().optional(),
    cover: z.url().optional(),
    isPublished: z.boolean().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .openapi("UpdatePost");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).openapi({
    example: 1,
    description: "页码，从 1 开始",
    type: "integer",
  }),
  limit: z.coerce.number().int().min(1).max(100).default(10).openapi({
    example: 10,
    description: "每页记录数，最大 100",
    type: "integer",
  }),
  category: z.string().optional().openapi({
    example: "tech",
    description: "根据分类 Slug 筛选",
  }),
  tag: z.string().optional().openapi({
    example: "hono",
    description: "根据标签名称筛选",
  }),
});
