import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { posts } from "./posts";

export const postLinks = sqliteTable(
  "post_links",
  {
    sourcePostId: integer("sourcePostId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    targetPostId: integer("targetPostId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    context: text("context"),
  },
  t => [primaryKey({ columns: [t.sourcePostId, t.targetPostId] })],
);

export const postLinksRelations = relations(postLinks, ({ one }) => ({
  sourcePost: one(posts, {
    fields: [postLinks.sourcePostId],
    references: [posts.id],
  }),
  targetPost: one(posts, {
    fields: [postLinks.targetPostId],
    references: [posts.id],
  }),
}));
