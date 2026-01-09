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
			.replace(/\s+/g, "-") // Replace spaces with -
			.replace(/[^\w-]+/g, "") // Remove all non-word chars
			.replace(/--+/g, "-") // Replace multiple - with single -
			.replace(/^-+/, "") // Trim - from start of text
			.replace(/-+$/, ""); // Trim - from end of text
		const inserted = await this.db
			.insert(categories)
			.values({ name, slug })
			.returning();
		return inserted[0].id;
	}
}

export { CategoryService };
