import { and, count, eq, inArray, isNull, sql } from "drizzle-orm";
import { pinyin } from "pinyin-pro";
import type { DB } from "../db";
import { posts, postsToTags } from "../db/schema";
import type { CategoryService } from "./categories";
import type { TagService } from "./tags";

export class PostService {
	constructor(
		private db: DB,
		private categoryService: CategoryService,
		private tagService: TagService,
	) {}

	async getPostBySlug(slug: string) {
		return await this.db.query.posts.findFirst({
			where: and(
				eq(posts.slug, slug),
				eq(posts.isPublished, true),
				isNull(posts.deletedAt),
			),
			with: {
				category: true,
				postsToTags: {
					with: {
						tag: true,
					},
				},
			},
		});
	}

	generateSlug(title?: string | null): string {
		if (title) {
			const pinyinText = pinyin(title, {
				toneType: "none",
				type: "array",
			}).join("-");

			return pinyinText
				.toLowerCase()
				.replace(/[^\w-]+/g, "")
				.replace(/--+/g, "-")
				.replace(/^-+|-+$/g, "");
		}

		const datePrefix = new Date().toISOString().split("T")[0];
		const randomPart = Bun.randomUUIDv7().slice(0, 6);
		return `${datePrefix}-${randomPart}`;
	}

	async listPosts(
		page: number,
		limit: number,
		type?: "post" | "memo",
		categorySlug?: string,
		tagName?: string,
	) {
		let categoryId: number | undefined;
		if (categorySlug) {
			const category = await this.categoryService.getBySlug(categorySlug);
			if (category) {
				categoryId = category.id;
			} else {
				return { data: [], total: 0 };
			}
		}

		let tagId: number | undefined;
		if (tagName) {
			const tag = await this.tagService.getByName(tagName);
			if (tag) {
				tagId = tag.id;
			} else {
				return { data: [], total: 0 };
			}
		}

		const conditions = [
		  eq(posts.isPublished, true),
		  isNull(posts.deletedAt),
		  ...(type ? [eq(posts.type, type)] : []),
		  ...(categoryId ? [eq(posts.categoryId, categoryId)] : []),
		];
		const whereClause = and(...conditions);

		const baseQuery = this.db
			.select({ id: posts.id })
			.from(posts)
			.where(whereClause);

		if (tagId) {
			baseQuery.innerJoin(
				postsToTags,
				and(eq(postsToTags.postId, posts.id), eq(postsToTags.tagId, tagId)),
			);
		}

		const totalResult = await this.db
			.select({ count: count() })
			.from(baseQuery.as("subquery"));
		const total = Number(totalResult[0].count);

		const finalWhereClause = tagId
			? and(
					whereClause,
					inArray(
						posts.id,
						this.db
							.select({ postId: postsToTags.postId })
							.from(postsToTags)
							.where(eq(postsToTags.tagId, tagId)),
					),
				)
			: whereClause;

		const data = await this.db.query.posts.findMany({
			where: finalWhereClause,
			limit: limit,
			offset: (page - 1) * limit,
			columns: {
				content: false,
			},
			with: {
				category: true,
				postsToTags: {
					with: {
						tag: true,
					},
				},
			},
			orderBy: (posts, { desc }) => [desc(posts.createdAt)],
		});

		return {
			data,
			total,
		};
	}

	async createPost(values: {
		title?: string | null;
		type?: "post" | "memo";
		content: string;
		slug?: string | null;
		description?: string | null;
		authorId: number;
		cover?: string | null;
		isPublished: boolean;
		category?: string;
		tags?: string[];
	}) {
		const { category, tags: tagNames, ...postData } = values;

		let categoryId: number | undefined;
		if (category) {
			categoryId = await this.categoryService.getOrCreate(category);
		}

		const inserted = await this.db
			.insert(posts)
			.values({
				...postData,
				categoryId,
			})
			.returning();
		const newPost = inserted[0];
		if (!newPost) {
			return null;
		}

		if (tagNames) {
			await this.tagService.syncTags(newPost.id, tagNames);
		}

		return await this.db.query.posts.findFirst({
			where: eq(posts.id, newPost.id),
			with: {
				category: true,
				postsToTags: {
					with: {
						tag: true,
					},
				},
			},
		});
	}

	async updatePost(
		id: number,
		values: Partial<Omit<typeof posts.$inferInsert, "id" | "authorId">> & {
			category?: string;
			tags?: string[];
		},
	) {
		const { category, tags: tagNames, ...postData } = values;

		const updateData = { ...postData };

		if (category !== undefined) {
			updateData.categoryId = category
				? await this.categoryService.getOrCreate(category)
				: null;
		}

		if (Object.keys(updateData).length > 0) {
			await this.db.update(posts).set(updateData).where(eq(posts.id, id));
		}

		if (tagNames !== undefined) {
			await this.tagService.syncTags(id, tagNames);
		}

		return await this.db.query.posts.findFirst({
			where: eq(posts.id, id),
			with: {
				category: true,
				postsToTags: {
					with: {
						tag: true,
					},
				},
			},
		});
	}

	async deletePost(id: number) {
			const randomSuffix = Bun.randomUUIDv7().slice(0, 8);
			return await this.db
				.update(posts)
				.set({
					deletedAt: new Date(),
					slug: sql`${posts.slug} || '_del_' || ${randomSuffix}`,
				})
			.where(eq(posts.id, id))
			.returning();
	}

	async existsBySlug(slug: string) {
			const post = await this.db.query.posts.findFirst({
				where: and(eq(posts.slug, slug), isNull(posts.deletedAt)),
				columns: {
				id: true,
			},
		});
		return !!post;
	}

	formatPost(post: any) {
		return {
			id: post.id,
			title: post.title,
			type: post.type,
			slug: post.slug,
			content: post.content,
			description: post.description,
			categories: post.category ? [post.category.name] : [],
			tags: post.postsToTags?.map((pt: any) => pt.tag.name) || [],
			cover: post.cover,
			isPublished: post.isPublished,
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
		};
	}
}
