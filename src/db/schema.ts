import { sql } from "drizzle-orm";
import {
    index,
    integer,
    primaryKey,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    role: text("role").notNull().default("user"),
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

export const posts = sqliteTable(
    "posts",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        title: text("title"),
        description: text("description"),
        slug: text("slug").unique(),
        content: text("content").notNull(),
        cover: text("cover"),
        isPublished: integer("isPublished", { mode: "boolean" })
            .notNull()
            .default(false),
        categoryId: integer("category_id").references(() => categories.id, {
            onDelete: "set null",
        }),
        authorId: integer("authorId").references(() => users.id, {
            onDelete: "set null",
        }),

        createdAt: integer("createdAt", { mode: "timestamp" })
            .notNull()
            .default(sql`(unixepoch())`),
        updatedAt: integer("updatedAt", { mode: "timestamp" })
            .notNull()
            .default(sql`(unixepoch())`)
            .$onUpdate(() => new Date()),
    },
    (t) => [
        index("created_at_idx").on(t.createdAt),
        index("category_id_idx").on(t.categoryId),
    ],
);

export const tags = sqliteTable("tags", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
});

export const categories = sqliteTable("categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
});

export const postsToTags = sqliteTable(
    "posts_to_tags",
    {
        postId: integer("post_id")
            .notNull()
            .references(() => posts.id, { onDelete: "cascade" }),
        tagId: integer("tag_id")
            .notNull()
            .references(() => tags.id, { onDelete: "cascade" }),
    },
    (t) => [primaryKey({ columns: [t.postId, t.tagId] })],
);
