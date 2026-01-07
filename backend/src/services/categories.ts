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
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");
        const inserted = await this.db
            .insert(categories)
            .values({ name, slug })
            .returning();
        return inserted[0].id;
    }
}

export type { CategoryService };
