import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { memos } from "./memos";
import { posts } from "./posts";

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

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  memos: many(memos),
}));
