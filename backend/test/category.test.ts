import { beforeAll, describe, expect, test } from "bun:test";
import { pinyin } from "pinyin-pro";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { app } from "../src/index";

describe("Category and Filtering tests", () => {
	let adminToken: string;
	const techName = `技术-${Bun.randomUUIDv7().slice(-12)}`;
	const lifeName = `生活-${Bun.randomUUIDv7().slice(-12)}`;
	const _techSlug = pinyin(techName, { toneType: "none" })
		.toLowerCase()
		.replace(/\s+/g, "-");

	beforeAll(async () => {
		// Ensure admin user exists
		const passwordHash = await Bun.password.hash("admin123");
		const username = `catadmin-${Bun.randomUUIDv7().slice(-12)}`;
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
			// Fallback to testadmin if the above fails
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

		// Create some posts with different categories
		const res1 = await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
			},
			body: JSON.stringify({
				title: `Tech Post ${Bun.randomUUIDv7()}`,
				content: "Content",
				category: techName,
				isPublished: true,
			}),
		});
		if (res1.status !== 201) {
			console.error("Failed to create tech post:", await res1.text());
		}

		const res2 = await app.request("/api/v1/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${adminToken}`,
			},
			body: JSON.stringify({
				title: `Life Post ${Bun.randomUUIDv7()}`,
				content: "Content",
				category: lifeName,
				isPublished: true,
			}),
		});
		if (res2.status !== 201) {
			console.error("Failed to create life post:", await res2.text());
		}
	});

	test("GET /api/v1/categories - should list all categories", async () => {
		const res = await app.request("/api/v1/categories");
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(data.data.length).toBeGreaterThanOrEqual(2);
		const names = data.data.map((c: any) => c.name);
		expect(names).toContain(techName);
		expect(names).toContain(lifeName);
	});

	test("GET /api/v1/posts?category - should filter posts by category slug", async () => {
		const categoriesRes = await app.request("/api/v1/categories");
		const categoriesData = await categoriesRes.json();
		const techCategory = categoriesData.data.find(
			(c: any) => c.name === techName,
		);
		const slug = techCategory.slug;

		const res = await app.request(`/api/v1/posts?category=${slug}`);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(data.data.length).toBe(1);
		expect(data.data[0].title).toContain("Tech Post");
	});

	test("GET /api/v1/posts?category=non-existent - should return empty list", async () => {
		const res = await app.request("/api/v1/posts?category=non-existent");
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(data.data.length).toBe(0);
	});
});
