import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { postsToTags } from "./posts-to-tags";

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  postsToTags: many(postsToTags),
}));
