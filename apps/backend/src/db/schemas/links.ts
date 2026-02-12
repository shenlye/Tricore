import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const links = sqliteTable(
  "links",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    link: text("link").notNull(),
    avatar: text("avatar"),
    desc: text("desc"),
    date: integer("date", { mode: "timestamp" }),
    feed: text("feed"),
    comment: text("comment"),
    category: text("category"),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  t => [
    index("linksCreatedAtIdx").on(t.createdAt),
  ],
);

export const linksRelations = relations(links, () => ({}));
