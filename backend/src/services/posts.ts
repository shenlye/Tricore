import { and, count, eq } from "drizzle-orm";
import type { DB } from "../db";
import { posts } from "../db/schema";

export class PostService {
    constructor(private db: DB) {}

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
        categoryId?: number | null;
    }) {
        const inserted = await this.db.insert(posts).values(values).returning();
        const newPost = inserted[0];
        if (!newPost) {
            return null;
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
