import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title").notNull(),
	content: text("content").notNull(),
	summary: text("summary"),
	slug: text("slug").notNull().unique(),

	// mode: "timestamp" 会自动将时间转换为时间戳
	createAt: integer("createAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updateAt: integer("updateAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
});
