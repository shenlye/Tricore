import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { categories } from "./categories";
import { postLinks } from "./post-links";
import { postsToTags } from "./posts-to-tags";
import { users } from "./users";

export const growthStageEnum = ["seed", "budding", "growing", "evergreen"] as const;

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

    // 数字花园字段
    growthStage: text("growthStage", { enum: growthStageEnum }).default("seed"),
    isPinned: integer("isPinned", { mode: "boolean" }).default(false),
    backlinksCount: integer("backlinksCount").default(0),

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
  // 数字花园：出链（当前文章链接到的其他文章）
  outgoingLinks: many(postLinks, { relationName: "sourcePost" }),
  // 数字花园：入链（链接到当前文章的其他文章）
  incomingLinks: many(postLinks, { relationName: "targetPost" }),
}));
