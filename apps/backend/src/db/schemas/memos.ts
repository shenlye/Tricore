import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

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

export const memosRelations = relations(memos, ({ one }) => ({
  author: one(users, {
    fields: [memos.authorId],
    references: [users.id],
  }),
}));
