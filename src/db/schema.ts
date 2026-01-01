import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    categories: text("categories").array().notNull().default([]),
    tags: text("tags").array().notNull().default([]),
    cover: text("cover"),
    isPublished: boolean("isPublished").notNull().default(false),

    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    passwordHash: text("passwordHash").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
