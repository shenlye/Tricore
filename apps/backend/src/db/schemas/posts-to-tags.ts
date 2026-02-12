import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { posts } from "./posts";
import { tags } from "./tags";

export const postsToTags = sqliteTable(
  "posts_to_tags",
  {
    postId: integer("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tagId")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  t => [primaryKey({ columns: [t.postId, t.tagId] })],
);

export const postsToTagsRelations = relations(postsToTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsToTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsToTags.tagId],
    references: [tags.id],
  }),
}));
