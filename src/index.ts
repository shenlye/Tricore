import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Hono } from "hono";
import { posts } from "./db/schema";

const db = drizzle(process.env.DB_FILE_NAME!);

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/posts/:slug", async (c) => {
	const slug = c.req.param("slug");

	const result = await db.select().from(posts).where(eq(posts.slug, slug));

	if (result.length === 0) {
		return c.json({ error: "文章不存在" }, 404);
	}

	return c.json({
		data: result[0],
	});
});

app.get("/posts", async (c) => {
	const limit = 10;
	const page = Number(c.req.query("page") || "1");

	const [data, total] = await Promise.all([
		db
			.select()
			.from(posts)
			.limit(limit)
			.offset((page - 1) * limit),
		db.select({ count: count() }).from(posts),
	]);

	return c.json({
		data: data,
		meta: {
			total: total[0].count,
			page: page,
			limit: limit,
		},
	});
});

app.post("/posts", async (c) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	try {
		const { title, content, slug } = await c.req.json();
		const result = await db
			.insert(posts)
			.values({
				title: title,
				content: content,
				slug: slug,
			})
			.returning();

		return c.json(
			{
				message: "文章发布成功",
				data: result[0],
			},
			201,
		);
	} catch (error) {
		return c.json(
			{
				error: "文章发布失败",
			},
			400,
		);
	}
});
export default app;
