import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import z from "zod";
import { createDb } from "../src/db";
import { users } from "../src/db/schema";
import { app } from "../src/index";
import { createPaginatedSuccessSchema, createSuccessSchema } from "../src/lib/schema";
import { MemoSchema } from "../src/routes/memos/schema";
import { hashPassword } from "../src/services/auth";

describe("memos CRUD tests", () => {
  let adminToken: string;
  let testMemoId: number;
  const db = createDb(env.DB);

  beforeAll(async () => {
    const passwordHash = await hashPassword("admin123");
    await db
      .insert(users)
      .values({
        role: "admin",
        username: "testadmin_memo",
        email: "testadmin_memo@example.com",
        passwordHash,
      })
      .onConflictDoNothing();

    const loginRes = await app.request("/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: "testadmin_memo",
        password: "admin123",
      }),
    }, env);
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error("Login failed:", JSON.stringify(loginData, null, 2));
      throw new Error("Login failed");
    }
    adminToken = loginData.data.token;

    // Create a shared test memo that persists across all tests (beforeAll data survives isolated storage)
    const createRes = await app.request("/api/v1/memos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        content: "This is a test memo",
        isPublished: true,
      }),
    }, env);
    const createData = await createRes.json();
    if (!createData.success) {
      console.error("Memo creation failed:", JSON.stringify(createData, null, 2));
      throw new Error("Memo creation failed");
    }
    testMemoId = createData.data.id;
  });

  it("pOST /api/v1/memos - should create a new memo", async () => {
    const res = await app.request("/api/v1/memos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        content: "Another test memo",
        isPublished: true,
      }),
    }, env);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.content).toBe("Another test memo");
    expect(data.data.isPublished).toBe(true);
  });

  it("pOST /api/v1/memos - should return 401 without token", async () => {
    const res = await app.request("/api/v1/memos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "Unauthorized memo",
      }),
    }, env);
    expect(res.status).toBe(401);
  });

  it("gET /api/v1/memos - should return a list of memos", async () => {
    const res = await app.request("/api/v1/memos", {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    const ListResSchema = createPaginatedSuccessSchema(MemoSchema);
    const result = ListResSchema.safeParse(data);
    if (!result.success) {
      console.error(z.treeifyError(result.error));
    }
    expect(result.success).toBe(true);
    expect(data.data.length).toBeGreaterThanOrEqual(1);
  });

  it("gET /api/v1/memos/:id - should return a single memo", async () => {
    const res = await app.request(`/api/v1/memos/${testMemoId}`, {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    const result = createSuccessSchema(MemoSchema).safeParse(data);
    if (!result.success) {
      console.error(z.treeifyError(result.error));
    }
    expect(result.success).toBe(true);
    expect(data.data.id).toBe(testMemoId);
  });

  it("gET /api/v1/memos/:id - should return 404 for non-existent memo", async () => {
    const res = await app.request("/api/v1/memos/999999", {}, env);
    expect(res.status).toBe(404);
  });

  it("pATCH /api/v1/memos/:id - should update a memo", async () => {
    const res = await app.request(`/api/v1/memos/${testMemoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        content: "Updated memo content",
      }),
    }, env);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.content).toBe("Updated memo content");
  });

  it("dELETE /api/v1/memos/:id - should delete a memo", async () => {
    // Create a memo to delete
    const createRes = await app.request("/api/v1/memos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        content: "Memo to be deleted",
        isPublished: true,
      }),
    }, env);
    const createData = await createRes.json();
    const id = createData.data.id;

    // Delete it
    const deleteRes = await app.request(`/api/v1/memos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    }, env);
    expect(deleteRes.status).toBe(200);

    // Verify it's gone (public access)
    const getRes = await app.request(`/api/v1/memos/${id}`, {}, env);
    expect(getRes.status).toBe(404);
  });
});
