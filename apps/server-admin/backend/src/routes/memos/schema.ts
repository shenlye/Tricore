import { z } from "@hono/zod-openapi";

export const MemoSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    content: z.string().openapi({ example: "This is a memo" }),
    isPublished: z.boolean().openapi({ example: true }),
    createdAt: z.string().openapi({ example: "2023-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2023-01-01T00:00:00.000Z" }),
  })
  .openapi("Memo");

export const createMemoSchema = z
  .object({
    content: z.string().min(1, "Content is required").openapi({ example: "This is a memo" }),
    isPublished: z.boolean().default(false).openapi({ example: true }),
  })
  .openapi("CreateMemo");

export const updateMemoSchema = z
  .object({
    content: z.string().min(1, "Content is required").optional(),
    isPublished: z.boolean().optional(),
  })
  .openapi("UpdateMemo");

export const memoPaginationSchema = z.object({
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
});
