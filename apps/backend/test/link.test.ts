import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import z from "zod";
import { createDb } from "../src/db";
import { users } from "../src/db/schemas";
import { app } from "../src/index";
import { createPaginatedSuccessSchema, createSuccessSchema } from "../src/lib/schema";
import { LinkSchema } from "../src/routes/links/schema";
import { hashPassword } from "../src/services/auth";

describe("links CRUD tests", () => {
  let adminToken: string;
  let testLinkId: number;
  const db = createDb(env.DB);

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

    // Create a shared test link that persists across all tests
    const createRes = await app.request("/api/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Test Link",
        link: "https://example.com",
        avatar: "https://example.com/avatar.jpg",
        desc: "This is a test link",
        category: "Frontend",
        feed: "https://example.com/feed.xml",
        comment: "Great website",
      }),
    }, env);
    const createData = await createRes.json();
    if (!createData.success) {
      console.error("Link creation failed:", JSON.stringify(createData, null, 2));
      throw new Error("Link creation failed");
    }
    testLinkId = createData.data.id;
  });

  it("pOST /api/v1/links - should create a new link", async () => {
    const res = await app.request("/api/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Another Test Link",
        link: "https://test.com",
        desc: "Another test description",
        category: "Backend",
      }),
    }, env);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBe("Another Test Link");
    expect(data.data.link).toBe("https://test.com");
    expect(data.data.category).toBe("Backend");
  });

  it("pOST /api/v1/links - should create a link with minimal fields", async () => {
    const res = await app.request("/api/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Minimal Link",
        link: "https://minimal.com",
      }),
    }, env);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBe("Minimal Link");
    expect(data.data.link).toBe("https://minimal.com");
    expect(data.data.avatar).toBeNull();
    expect(data.data.desc).toBeNull();
    expect(data.data.category).toBeNull();
  });

  it("pOST /api/v1/links - should return 401 without token", async () => {
    const res = await app.request("/api/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Unauthorized Link",
        link: "https://unauthorized.com",
      }),
    }, env);
    expect(res.status).toBe(401);
  });

  it("pOST /api/v1/links - should return 400 for invalid URL", async () => {
    const res = await app.request("/api/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Invalid Link",
        link: "not-a-valid-url",
      }),
    }, env);
    expect(res.status).toBe(400);
  });

  it("gET /api/v1/links - should return a list of links", async () => {
    const res = await app.request("/api/v1/links", {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    const ListResSchema = createPaginatedSuccessSchema(LinkSchema);
    const result = ListResSchema.safeParse(data);
    if (!result.success) {
      console.error(z.treeifyError(result.error));
    }
    expect(result.success).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    const isLinkFound = data.data.some((l: any) => l.id === testLinkId);
    expect(isLinkFound).toBe(true);
  });

  it("gET /api/v1/links?page=1&limit=10 - should return paginated links", async () => {
    const res = await app.request("/api/v1/links?page=1&limit=10", {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.meta.page).toBe(1);
    expect(data.meta.limit).toBe(10);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("gET /api/v1/links?orderBy=asc - should return links in ascending order", async () => {
    const res = await app.request("/api/v1/links?orderBy=asc", {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("gET /api/v1/links/:id - should return a single link", async () => {
    const res = await app.request(`/api/v1/links/${testLinkId}`, {}, env);
    expect(res.status).toBe(200);
    const data = await res.json();
    const result = createSuccessSchema(LinkSchema).safeParse(data);
    if (!result.success) {
      console.error(z.treeifyError(result.error));
    }
    expect(result.success).toBe(true);
    expect(data.data.id).toBe(testLinkId);
    expect(data.data.title).toBe("Test Link");
  });

  it("gET /api/v1/links/:id - should return 404 for non-existent link", async () => {
    const res = await app.request("/api/v1/links/999999", {}, env);
    expect(res.status).toBe(404);
  });

  it("pUT /api/v1/links/:id - should update a link", async () => {
    const res = await app.request(`/api/v1/links/${testLinkId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Updated Test Link",
        category: "Updated Category",
      }),
    }, env);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBe("Updated Test Link");
    expect(data.data.category).toBe("Updated Category");
  });

  it("pUT /api/v1/links/:id - should return 401 without token", async () => {
    const res = await app.request(`/api/v1/links/${testLinkId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Unauthorized Update",
      }),
    }, env);
    expect(res.status).toBe(401);
  });

  it("pUT /api/v1/links/:id - should return 404 for non-existent link", async () => {
    const res = await app.request("/api/v1/links/999999", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Non-existent Link",
      }),
    }, env);
    expect(res.status).toBe(404);
  });

  it("dELETE /api/v1/links/:id - should delete a link", async () => {
    // Create a link to delete
    const createRes = await app.request("/api/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Link to Delete",
        link: "https://delete.com",
      }),
    }, env);
    const createData = await createRes.json();
    const id = createData.data.id;

    // Delete it
    const deleteRes = await app.request(`/api/v1/links/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    }, env);
    expect(deleteRes.status).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);

    // Verify it's deleted
    const getRes = await app.request(`/api/v1/links/${id}`, {}, env);
    expect(getRes.status).toBe(404);
  });

  it("dELETE /api/v1/links/:id - should return 401 without token", async () => {
    const res = await app.request(`/api/v1/links/${testLinkId}`, {
      method: "DELETE",
    }, env);
    expect(res.status).toBe(401);
  });

  it("dELETE /api/v1/links/:id - should return 404 for non-existent link", async () => {
    const res = await app.request("/api/v1/links/999999", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    }, env);
    expect(res.status).toBe(404);
  });
});
