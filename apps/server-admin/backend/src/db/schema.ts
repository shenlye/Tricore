import { relations, sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const memos = sqliteTable(
  "memos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    content: text("content").notNull(),
    isPublished: integer("isPublished", { mode: "boolean" }).notNull().default(false),
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
    index("memosCreatedAtIdx").on(t.createdAt),
    index("memosIsPublishedIdx").on(t.isPublished),
  ],
);

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

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  memos: many(memos),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postsToTags: many(postsToTags),
}));

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

export const memosRelations = relations(memos, ({ one }) => ({
  author: one(users, {
    fields: [memos.authorId],
    references: [users.id],
  }),
}));

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
