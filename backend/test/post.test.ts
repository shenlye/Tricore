import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import z from "zod";
import { createDb } from "../src/db";
import { users } from "../src/db/schema";
import { app } from "../src/index";
import { createPaginatedSuccessSchema, createSuccessSchema } from "../src/lib/schema";
import { PostSchema } from "../src/routes/posts/schema";
import { hashPassword } from "../src/services/auth";

describe("posts CRUD tests", () => {
  let adminToken: string;
  let testPostId: number;
  const db = createDb(env.DB);
  const testPostSlug = `test-post-${crypto.randomUUID().slice(0, 8)}`;

  beforeAll(async () => {
    // Ensure admin user exists with a known password
    const passwordHash = await hashPassword("admin123");
    await db
      .insert(users)
      .values({
        role: "admin",
        username: "testadmin",
        email: "testadmin@example.com",
        passwordHash,
      })
      .onConflictDoNothing();

    // Login to get token
    const loginRes = await app.request("/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: "testadmin",
        password: "admin123",
      }),
    }, env);
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error("Login failed:", JSON.stringify(loginData, null, 2));
      throw new Error("Login failed");
    }
    adminToken = loginData.data.token;

    // Create a shared test post that persists across all tests (beforeAll data survives isolated storage)
    const createRes = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Test Post",
        slug: testPostSlug,
        content: "This is a test post content",
        description: "Test description",
        isPublished: true,
        category: "Test Category",
        tags: ["test-tag-1", "test-tag-2"],
      }),
    }, env);
    const createData = await createRes.json();
    if (!createData.success) {
      console.error("Post creation failed:", JSON.stringify(createData, null, 2));
      throw new Error("Post creation failed");
    }
    testPostId = createData.data.id;
  });

  it("pOST /api/v1/posts - should create a new post", async () => {
    const slug = `create-test-${crypto.randomUUID().slice(0, 8)}`;
    const res = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Another Test Post",
        slug,
        content: "This is another test post content",
        description: "Another test description",
        isPublished: true,
        category: "Test Category",
        tags: ["test-tag-1"],
      }),
    }, env);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBe("Another Test Post");
    expect(data.data.slug).toBe(slug);
  });

  it("pOST /api/v1/posts - should return 401 without token", async () => {
    const res = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Unauthorized Post",
        content: "Content",
      }),
    }, env);
    expect(res.status).toBe(401);
  });

  it("gET /api/v1/posts - should return a list of posts", async () => {
    const res = await app.request("/api/v1/posts", {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    const postSummarySchema = PostSchema.omit({ content: true });
    const ListResSchema = createPaginatedSuccessSchema(postSummarySchema);
    const result = ListResSchema.safeParse(data);
    if (!result.success) {
      console.error(z.treeifyError(result.error));
    }
    expect(result.success).toBe(true);
    type PostSummary = z.infer<typeof postSummarySchema>;
    const isPostFound = data.data.some((p: PostSummary) => p.slug === testPostSlug);
    expect(isPostFound).toBe(true);
  });

  it("gET /api/v1/posts/:slug - should return a single post", async () => {
    const res = await app.request(`/api/v1/posts/${testPostSlug}`, {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    const result = createSuccessSchema(PostSchema).safeParse(data);
    if (!result.success) {
      console.error(z.treeifyError(result.error));
    }
    expect(result.success).toBe(true);
    expect(data.data.slug).toBe(testPostSlug);
  });

  it("gET /api/v1/posts/:id - should return a single post by ID", async () => {
    const res = await app.request(`/api/v1/posts/${testPostId}`, {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    const result = createSuccessSchema(PostSchema).safeParse(data);
    expect(result.success).toBe(true);
    expect(data.data.id).toBe(testPostId);
    expect(data.data.slug).toBe(testPostSlug);
  });

  it("gET /api/v1/posts/:slug - should return 404 for non-existent post", async () => {
    const res = await app.request("/api/v1/posts/non-existent-slug", {}, env);
    expect(res.status).toBe(404);
  });

  it("pATCH /api/v1/posts/:id - should update a post", async () => {
    const res = await app.request(`/api/v1/posts/${testPostId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Updated Test Post",
      }),
    }, env);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBe("Updated Test Post");
  });

  it("dELETE /api/v1/posts/:id - should delete a post and allow reuse of slug", async () => {
    // Create a post to delete
    const slug = `reuse-slug-${crypto.randomUUID().slice(0, 8)}`;
    const createRes = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Reuse Slug Post",
        slug,
        content: "Content to be deleted",
        isPublished: true,
      }),
    }, env);
    const createData = await createRes.json();
    const id = createData.data.id;

    // Delete it
    const deleteRes = await app.request(`/api/v1/posts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    }, env);
    expect(deleteRes.status).toBe(200);

    // Try creating another post with the same slug
    const recreateRes = await app.request("/api/v1/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Recreated Post",
        slug,
        content: "New content with same slug",
        isPublished: true,
      }),
    }, env);
    expect(recreateRes.status).toBe(201);
    const recreateData = await recreateRes.json();
    expect(recreateData.data.slug).toBe(slug);
  });
});
