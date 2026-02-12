import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { posts } from "./posts";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));
