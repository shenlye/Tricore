import { beforeAll, describe, expect, test } from "bun:test";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { app } from "../src/index";

describe("Tag and Filtering tests", () => {
	let adminToken: string;
	const tagName1 = `Tag1-${Bun.randomUUIDv7().slice(-12)}`;
	const tagName2 = `Tag2-${Bun.randomUUIDv7().slice(-12)}`;

	beforeAll(async () => {
		// Ensure admin user exists
		const passwordHash = await Bun.password.hash("admin123");
		const username = `tagadmin-${Bun.randomUUIDv7().slice(-12)}`;
		await db
			.insert(users)
			.values({
				role: "admin",
				username: username,
				email: `${username}@example.com`,
				passwordHash: passwordHash,
			})
			.onConflictDoNothing();

		// Login
		const loginRes = await app.request("/api/v1/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				identifier: username,
				password: "admin123",
			}),
		});

		let loginData = await loginRes.json();
		if (!loginData.success) {
			// Fallback to testadmin
			const loginRes2 = await app.request("/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					identifier: "testadmin",
					password: "admin123",
				}),
			});
			loginData = await loginRes2.json();
		}

		if (!loginData.success || !loginData.data?.token) {
			throw new Error(
				`Login failed in beforeAll: ${JSON.stringify(loginData)}`,
			);
		}

		adminToken = loginData.data.token;

		// Create some posts with different tags
		const _res1 = await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
			},
			body: JSON.stringify({
				title: `Post with Tag1 ${Bun.randomUUIDv7()}`,
				content: "Content",
				tags: [tagName1],
				isPublished: true,
			}),
		});

		const _res2 = await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
			},
			body: JSON.stringify({
				title: `Post with Tag1 and Tag2 ${Bun.randomUUIDv7()}`,
				content: "Content",
				tags: [tagName1, tagName2],
				isPublished: true,
			}),
		});
	});

	test("GET /api/v1/tags - should list all tags with post counts", async () => {
		const res = await app.request("/api/v1/tags");
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);

		const tag1 = data.data.find((t: any) => t.name === tagName1);
		const tag2 = data.data.find((t: any) => t.name === tagName2);

		expect(tag1).toBeDefined();
		expect(tag1.postCount).toBe(2);
		expect(tag2).toBeDefined();
		expect(tag2.postCount).toBe(1);
	});

	test("GET /api/v1/posts?tag - should filter posts by tag name", async () => {
		// Filter by Tag1
		const res1 = await app.request(`/api/v1/posts?tag=${tagName1}`);
		expect(res1.status).toBe(200);
		const data1 = await res1.json();
		expect(data1.success).toBe(true);
		expect(data1.data.length).toBe(2);

		// Filter by Tag2
		const res2 = await app.request(`/api/v1/posts?tag=${tagName2}`);
		expect(res2.status).toBe(200);
		const data2 = await res2.json();
		expect(data2.success).toBe(true);
		expect(data2.data.length).toBe(1);
		expect(data2.data[0].title).toContain("Post with Tag1 and Tag2");
	});

	test("GET /api/v1/posts?tag=non-existent - should return empty list", async () => {
		const res = await app.request("/api/v1/posts?tag=non-existent-tag");
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(data.data.length).toBe(0);
	});
});
