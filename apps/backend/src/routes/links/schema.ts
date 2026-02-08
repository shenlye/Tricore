import { z } from "@hono/zod-openapi";

export const LinkSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    title: z.string().openapi({ example: "Example Link" }),
    link: z.string().openapi({ example: "https://example.com" }),
    avatar: z.string().nullable().openapi({ example: "https://example.com/avatar.jpg" }),
    desc: z.string().nullable().openapi({ example: "A description of the link" }),
    date: z.string().nullable().openapi({ example: "2023-01-01T00:00:00.000Z" }),
    feed: z.string().nullable().openapi({ example: "https://example.com/feed.xml" }),
    comment: z.string().nullable().openapi({ example: "A comment about the link" }),
    category: z.string().nullable().openapi({ example: "Frontend" }),
    createdAt: z.string().openapi({ example: "2023-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2023-01-01T00:00:00.000Z" }),
  })
  .openapi("Link");

export const createLinkSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long").openapi({ example: "My Favorite Link" }),
    link: z.url({ error: "Invalid URL" }).openapi({ example: "https://example.com" }),
    avatar: z.url({ error: "Invalid avatar URL" }).optional().openapi({ example: "https://example.com/avatar.jpg" }),
    desc: z.string().max(500, "Description is too long").optional().openapi({ example: "This is a great website" }),
    date: z.coerce.date().optional().openapi({ example: "2023-01-01T00:00:00.000Z" }),
    feed: z.url({ error: "Invalid feed URL" }).optional().openapi({ example: "https://example.com/feed.xml" }),
    comment: z.string().max(500, "Comment is too long").optional().openapi({ example: "Check this out!" }),
    category: z.string().max(100, "Category is too long").optional().openapi({ example: "Frontend" }),
  })
  .openapi("CreateLink");

export const updateLinkSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long").optional(),
    link: z.url({ error: "Invalid URL" }).optional(),
    avatar: z.url({ error: "Invalid avatar URL" }).optional(),
    desc: z.string().max(500, "Description is too long").optional(),
    date: z.coerce.date().optional(),
    feed: z.url({ error: "Invalid feed URL" }).optional(),
    comment: z.string().max(500, "Comment is too long").optional(),
    category: z.string().max(100, "Category is too long").optional(),
  })
  .openapi("UpdateLink");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).openapi({
    example: 1,
    description: "页码，从 1 开始",
    type: "integer",
  }),
  limit: z.coerce.number().int().min(1).max(100).default(20).openapi({
    example: 20,
    description: "每页记录数，最大 100",
    type: "integer",
  }),
  orderBy: z.enum(["asc", "desc"]).default("desc").openapi({
    example: "desc",
    description: "排序方式",
  }),
});
