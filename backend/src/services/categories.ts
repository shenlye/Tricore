import { eq } from "drizzle-orm";
import { pinyin } from "pinyin-pro";
import type { DB } from "../db";
import { categories } from "../db/schema";

class CategoryService {
	constructor(private db: DB) {}
	async getOrCreate(name: string) {
		const existing = await this.db.query.categories.findFirst({
			where: eq(categories.name, name),
		});
		if (existing) {
			return existing.id;
		}

		// chinese to pinyin slug
		const slug = pinyin(name, { toneType: "none" })
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces/hyphens
			.trim()
			.replace(/\s+/g, "-") // Replace spaces with -
			.replace(/--+/g, "-"); // Replace multiple - with single -
		const inserted = await this.db
			.insert(categories)
			.values({ name, slug })
			.returning();
		return inserted[0].id;
	}

	async listAll() {
		return await this.db.query.categories.findMany({
			orderBy: (categories, { asc }) => [asc(categories.name)],
		});
	}

	async getBySlug(slug: string) {
		return await this.db.query.categories.findFirst({
			where: eq(categories.slug, slug),
		});
	}
}

export { CategoryService };
