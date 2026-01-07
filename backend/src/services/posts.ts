import { and, count, eq, inArray } from "drizzle-orm";
import { pinyin } from "pinyin-pro";
import type { DB } from "../db";
import { categories, posts, postsToTags, tags } from "../db/schema";

export class PostService {
    constructor(private db: DB) {}

    private async getOrCreateCategory(name: string) {
        const existing = await this.db.query.categories.findFirst({
            where: eq(categories.name, name),
        });
        if (existing) {
            return existing.id;
        }

        // chinese to pinyin slug
        const slug = pinyin(name, { toneType: "none" })
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");
        const inserted = await this.db
            .insert(categories)
            .values({ name, slug })
            .returning();
        return inserted[0].id;
    }

    private async syncTags(postId: number, tagNames: string[]) {
        const uniqueTagNames = Array.from(new Set(tagNames));

        // 使用事务保证数据一致性
        await this.db.transaction(async (tx) => {
            // 如果没有标签，删除所有关联并且退出
            if (uniqueTagNames.length === 0) {
                await tx
                    .delete(postsToTags)
                    .where(eq(postsToTags.postId, postId));
                return;
            } else {
                await tx
                    .insert(tags)
                    .values(
                        uniqueTagNames.map((tagName) => ({ name: tagName })),
                        // 如果标签已存在则什么都不做
                    )
                    .onConflictDoNothing();
            }

            // 获取所有标签的 ID
            const allTags = await tx.query.tags.findMany({
                where: inArray(tags.name, uniqueTagNames),
            });
            const tagIds = allTags.map((tag) => tag.id);

            // 先删再增
            await tx.delete(postsToTags).where(eq(postsToTags.postId, postId));

            if (tagIds.length > 0) {
                await tx.insert(postsToTags).values(
                    tagIds.map((tagId) => ({
                        postId,
                        tagId,
                    })),
                );
            }
        });
        // 不要在循环里查询
        // for (const tagName of uniqueTagNames) {
        //     let tag = await this.db.query.tags.findFirst({
        //         where: eq(tags.name, tagName),
        //     });
        //     if (!tag) {
        //         const inserted = await this.db
        //             .insert(tags)
        //             .values({ name: tagName })
        //             .returning();
        //         tag = inserted[0];
        //     }
        //     tagIds.push(tag.id);
        // }
    }

    async getPostBySlug(slug: string) {
        return await this.db.query.posts.findFirst({
            where: and(eq(posts.slug, slug), eq(posts.isPublished, true)),
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

    async listPosts(page: number, limit: number) {
        const [data, total] = await Promise.all([
            this.db.query.posts.findMany({
                where: eq(posts.isPublished, true),
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
            this.db
                .select({ count: count() })
                .from(posts)
                .where(eq(posts.isPublished, true)),
        ]);

        return {
            data,
            total: Number(total[0].count),
        };
    }

    async createPost(values: {
        title?: string | null;
        content: string;
        slug: string;
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
            categoryId = await this.getOrCreateCategory(category);
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
            await this.syncTags(newPost.id, tagNames);
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
                ? await this.getOrCreateCategory(category)
                : null;
        }

        if (Object.keys(updateData).length > 0) {
            await this.db.update(posts).set(updateData).where(eq(posts.id, id));
        }

        if (tagNames !== undefined) {
            await this.syncTags(id, tagNames);
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
        return await this.db.delete(posts).where(eq(posts.id, id)).returning();
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

    // biome-ignore lint/suspicious/noExplicitAny: 不会写
    formatPost(post: any) {
        return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            description: post.description,
            categories: post.category ? [post.category.name] : [],
            // biome-ignore lint/suspicious/noExplicitAny: 不会写
            tags: post.postsToTags?.map((pt: any) => pt.tag.name) || [],
            cover: post.cover,
            isPublished: post.isPublished,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        };
    }
}
