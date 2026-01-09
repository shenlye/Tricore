import { beforeAll, describe, expect, test } from "bun:test";
import z from "zod";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { app } from "../src/index";
import {
	createPaginatedSuccessSchema,
	createSuccessSchema,
} from "../src/lib/schema";
import { PostSchema } from "../src/routes/posts/schema";

describe("Posts CRUD tests", () => {
	let adminToken: string;
	let testPostId: number;
	const testPostSlug = `test-post-${Bun.randomUUIDv7().slice(0, 8)}`;

	beforeAll(async () => {
		// Ensure admin user exists with a known password
		const passwordHash = await Bun.password.hash("admin123");
		await db
			.insert(users)
			.values({
				role: "admin",
				username: "testadmin",
				email: "testadmin@example.com",
				passwordHash: passwordHash,
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
		});
		const loginData = await loginRes.json();
		if (!loginData.success) {
			console.error("Login failed:", JSON.stringify(loginData, null, 2));
			throw new Error("Login failed");
		}
		adminToken = loginData.data.token;
	});

	test("POST /api/v1/posts - should create a new post", async () => {
		const res = await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
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
		});

		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(data.data.title).toBe("Test Post");
		expect(data.data.slug).toBe(testPostSlug);
		testPostId = data.data.id;
	});

	test("POST /api/v1/posts - should return 401 without token", async () => {
		const res = await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title: "Unauthorized Post",
				content: "Content",
			}),
		});
		expect(res.status).toBe(401);
	});

	test("GET /api/v1/posts - should return a list of posts", async () => {
		const res = await app.request("/api/v1/posts");
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
		const isPostFound = data.data.some(
			(p: PostSummary) => p.slug === testPostSlug,
		);
		expect(isPostFound).toBe(true);
	});

	test("GET /api/v1/posts/:slug - should return a single post", async () => {
		const res = await app.request(`/api/v1/posts/${testPostSlug}`);
		expect(res.status).toBe(200);
		const data = await res.json();
		const result = createSuccessSchema(PostSchema).safeParse(data);
		if (!result.success) {
			console.error(z.treeifyError(result.error));
		}
		expect(result.success).toBe(true);
		expect(data.data.slug).toBe(testPostSlug);
	});

	test("GET /api/v1/posts/:slug - should return 404 for non-existent post", async () => {
		const res = await app.request("/api/v1/posts/non-existent-slug");
		expect(res.status).toBe(404);
	});

	test("PATCH /api/v1/posts/:id - should update a post", async () => {
		const res = await app.request(`/api/v1/posts/${testPostId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
			},
			body: JSON.stringify({
				title: "Updated Test Post",
			}),
		});

		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(data.data.title).toBe("Updated Test Post");
	});

	test("DELETE /api/v1/posts/:id - should delete a post and allow reuse of slug", async () => {
		// Create a post to delete
		const slug = `reuse-slug-${Bun.randomUUIDv7().slice(0, 8)}`;
		const createRes = await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
			},
			body: JSON.stringify({
				title: "Reuse Slug Post",
				slug: slug,
				content: "Content to be deleted",
				isPublished: true,
			}),
		});
		const createData = await createRes.json();
		const id = createData.data.id;

		// Delete it
		const deleteRes = await app.request(`/api/v1/posts/${id}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${adminToken}`,
			},
		});
		expect(deleteRes.status).toBe(200);

		// Try creating another post with the same slug
		const recreateRes = await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
			},
			body: JSON.stringify({
				title: "Recreated Post",
				slug: slug,
				content: "New content with same slug",
				isPublished: true,
			}),
		});
		expect(recreateRes.status).toBe(201);
		const recreateData = await recreateRes.json();
		expect(recreateData.data.slug).toBe(slug);
	});

	test("POST /api/v1/posts - should create a memo without slug", async () => {
		const res = await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
			},
			body: JSON.stringify({
				content: "This is a memo content",
				type: "memo",
				isPublished: true,
			}),
		});

		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(data.data.type).toBe("memo");
		expect(data.data.slug).toBeNull();
	});

	test("GET /api/v1/posts - should filter by type", async () => {
		// Ensure we have at least one post and one memo
		await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
			},
			body: JSON.stringify({
				title: "Another Post",
				content: "Post content",
				type: "post",
				isPublished: true,
			}),
		});

		await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
			},
			body: JSON.stringify({
				content: "Another Memo",
				type: "memo",
				isPublished: true,
			}),
		});

		// Test filtering by post
		const postRes = await app.request("/api/v1/posts?type=post");
		const postData = await postRes.json();
		expect(postData.data.every((item: any) => item.type === "post")).toBe(true);

		// Test filtering by memo
		const memoRes = await app.request("/api/v1/posts?type=memo");
		const memoData = await memoRes.json();
		expect(memoData.data.every((item: any) => item.type === "memo")).toBe(true);
	});
});
