import { relations, sql } from "drizzle-orm";
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

export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
}));

export const posts = sqliteTable(
	"posts",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		title: text("title"),
		type: text("type", { enum: ["post", "memo"] })
			.notNull()
			.default("post"),
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

		deletedAt: integer("deleted_at", { mode: "timestamp" }),

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
		index("is_published_idx").on(t.isPublished),
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

export const tags = sqliteTable("tags", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull().unique(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
	postsToTags: many(postsToTags),
}));

export const categories = sqliteTable("categories", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
	posts: many(posts),
}));

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
