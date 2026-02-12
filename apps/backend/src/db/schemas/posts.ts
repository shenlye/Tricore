import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { categories } from "./categories";
import { postsToTags } from "./posts-to-tags";
import { users } from "./users";

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title"),
    description: text("description"),
    slug: text("slug").unique(),
    content: text("content").notNull(),
    cover: text("cover"),
    isPublished: integer("isPublished", { mode: "boolean" }).notNull().default(false),
    publishedAt: integer("publishedAt", { mode: "timestamp" }),
    categoryId: integer("categoryId").references(() => categories.id, {
      onDelete: "set null",
    }),
    authorId: integer("authorId").references(() => users.id, {
      onDelete: "set null",
    }),

    deletedAt: integer("deletedAt", { mode: "timestamp" }),

    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  t => [
    index("createdAtIdx").on(t.createdAt),
    index("categoryIdIdx").on(t.categoryId),
    index("isPublishedIdx").on(t.isPublished),
  ],
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  postsToTags: many(postsToTags),
}));
