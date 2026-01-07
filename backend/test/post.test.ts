import { describe, expect, test } from "bun:test";
import z from "zod";
import { app } from "../src/index";
import {
    createPaginatedSuccessSchema,
    createSuccessSchema,
} from "../src/lib/schema";
import { PostSchema } from "../src/routes/posts/schema";

describe("Posts CRUD tests", () => {
    test("GET /api/v1/posts - should return a list of posts", async () => {
        const res = await app.request("/api/v1/posts");
        expect(res.status).toBe(200);
        const data = await res.json();
        const ListResSchema = createPaginatedSuccessSchema(
            PostSchema.omit({ content: true }),
        );
        expect(ListResSchema.safeParse(data).success).toBe(true);
    });

    test("GET /api/v1/posts/:slug - should return a single post", async () => {
        const res = await app.request("/api/v1/posts/1");
        expect(res.status).toBe(200);
        const data = await res.json();
        const result = createSuccessSchema(PostSchema).safeParse(data);
        if (!result.success) {
            console.error(z.treeifyError(result.error));
        }
        expect(result.success).toBe(true);
    });
});
