import { and, count, eq, isNull, sql } from "drizzle-orm";
import type { DB } from "../db";
import { posts } from "../db/schema";
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

	async listPosts(page: number, limit: number, type?: "post" | "memo") {
		const whereClause = and(
			eq(posts.isPublished, true),
			isNull(posts.deletedAt),
			type ? eq(posts.type, type) : undefined,
		);

		const [data, total] = await Promise.all([
			this.db.query.posts.findMany({
				where: whereClause,
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
			}),
			this.db.select({ count: count() }).from(posts).where(whereClause),
		]);

		return {
			data,
			total: Number(total[0].count),
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
		return await this.db
			.update(posts)
			.set({
				deletedAt: new Date(),
				slug: sql`${posts.slug} || '_del_' || ${Date.now()}`,
			})
			.where(eq(posts.id, id))
			.returning();
	}

	async existsBySlug(slug: string) {
		const post = await this.db.query.posts.findFirst({
			where: eq(posts.slug, slug),
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
