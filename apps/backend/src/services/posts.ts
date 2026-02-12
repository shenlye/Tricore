import type { DB } from "../db";
import type { CategoryService } from "./categories";
import type { TagService } from "./tags";
import { and, count, eq, inArray, isNull, sql } from "drizzle-orm";
import { pinyin } from "pinyin-pro";
import { postLinks, posts, postsToTags } from "../db/schemas";

export class PostService {
  constructor(
    private db: DB,
    private categoryService: CategoryService,
    private tagService: TagService,
  ) {}

  async getPostByIdentifier(identifier: string | number, onlyPublished = true) {
    const isId = typeof identifier === "number" || /^\d+$/.test(String(identifier));
    const conditions = [
      isId ? eq(posts.id, Number(identifier)) : eq(posts.slug, String(identifier)),
      isNull(posts.deletedAt),
    ];

    if (onlyPublished) {
      conditions.push(eq(posts.isPublished, true));
    }

    return await this.db.query.posts.findFirst({
      where: and(...conditions),
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
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const datePrefix = new Date().toISOString().split("T")[0];
    const randomPart = crypto.randomUUID().slice(0, 6);
    return `${datePrefix}-${randomPart}`;
  }

  async listPosts(
    page: number,
    limit: number,
    categorySlug?: string,
    tagName?: string,
    onlyPublished = true,
  ) {
    let categoryId: number | undefined;
    if (categorySlug) {
      const category = await this.categoryService.getBySlug(categorySlug);
      if (category) {
        categoryId = category.id;
      }
      else {
        return { data: [], total: 0 };
      }
    }

    let tagId: number | undefined;
    if (tagName) {
      const tag = await this.tagService.getByName(tagName);
      if (tag) {
        tagId = tag.id;
      }
      else {
        return { data: [], total: 0 };
      }
    }

    const conditions = [
      isNull(posts.deletedAt),
      ...(categoryId ? [eq(posts.categoryId, categoryId)] : []),
    ];

    if (onlyPublished) {
      conditions.push(eq(posts.isPublished, true));
    }

    const whereClause = and(...conditions);

    const baseQuery = this.db.select({ id: posts.id }).from(posts).where(whereClause);

    if (tagId) {
      baseQuery.innerJoin(
        postsToTags,
        and(eq(postsToTags.postId, posts.id), eq(postsToTags.tagId, tagId)),
      );
    }

    const totalResult = await this.db.select({ count: count() }).from(baseQuery.as("subquery"));
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
      limit,
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
      updateData.categoryId = category ? await this.categoryService.getOrCreate(category) : null;
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
    const randomSuffix = crypto.randomUUID().slice(0, 8);
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
    // 如果没有description，从content中提取前100个字符
    let description = post.description;
    if (!description && post.content) {
      // 移除markdown标记和多余空白
      const plainText = post.content
        .replace(/#{1,6}\s+/g, "") // 移除标题标记
        .replace(/!\[.*?\]\(.*?\)/g, "") // 移除图片
        .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // 移除链接，保留文本
        .replace(/[*_~`]+/g, "") // 移除加粗、斜体、删除线、代码标记
        .replace(/\n+/g, " ") // 将换行替换为空格
        .replace(/\s+/g, " ") // 合并多个空格
        .trim();

      // 截取前100个字符
      description = plainText.length > 100
        ? `${plainText.substring(0, 100)}...`
        : plainText;
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      description,
      categories: post.category ? [post.category.name] : [],
      tags: post.postsToTags?.map((pt: any) => pt.tag.name) || [],
      cover: post.cover,
      isPublished: post.isPublished,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  // 数字花园：添加文章链接
  async addPostLink(sourcePostId: number, targetPostId: number, context?: string) {
    const result = await this.db
      .insert(postLinks)
      .values({
        sourcePostId,
        targetPostId,
        context: context || null,
      })
      .returning();

    // 更新目标文章的 backlinksCount
    await this.db
      .update(posts)
      .set({
        backlinksCount: sql`${posts.backlinksCount} + 1`,
      })
      .where(eq(posts.id, targetPostId));

    return result[0];
  }

  // 数字花园：删除文章链接
  async removePostLink(sourcePostId: number, targetPostId: number) {
    const result = await this.db
      .delete(postLinks)
      .where(
        and(
          eq(postLinks.sourcePostId, sourcePostId),
          eq(postLinks.targetPostId, targetPostId),
        ),
      )
      .returning();

    if (result.length > 0) {
      // 更新目标文章的 backlinksCount
      await this.db
        .update(posts)
        .set({
          backlinksCount: sql`${posts.backlinksCount} - 1`,
        })
        .where(eq(posts.id, targetPostId));
    }

    return result.length > 0;
  }

  // 数字花园：获取文章的链接关系
  async getPostLinks(postId: number) {
    // 获取出链（当前文章链接到的其他文章）
    const outgoing = await this.db.query.postLinks.findMany({
      where: eq(postLinks.sourcePostId, postId),
      with: {
        targetPost: {
          columns: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // 获取入链（链接到当前文章的其他文章）
    const incoming = await this.db.query.postLinks.findMany({
      where: eq(postLinks.targetPostId, postId),
      with: {
        sourcePost: {
          columns: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return {
      outgoing: outgoing.map(link => ({
        id: link.targetPost.id,
        title: link.targetPost.title,
        slug: link.targetPost.slug,
        context: link.context,
      })),
      incoming: incoming.map(link => ({
        id: link.sourcePost.id,
        title: link.sourcePost.title,
        slug: link.sourcePost.slug,
        context: link.context,
      })),
    };
  }

  // 数字花园：搜索文章（用于链接自动完成）
  async searchPosts(query: string, limit: number, onlyPublished = true) {
    const conditions = [
      isNull(posts.deletedAt),
      // 使用 LIKE 进行模糊搜索（SQLite 支持）
      sql`${posts.title} LIKE ${`%${query}%`}`,
    ];

    if (onlyPublished) {
      conditions.push(eq(posts.isPublished, true));
    }

    const results = await this.db.query.posts.findMany({
      where: and(...conditions),
      limit,
      columns: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return results;
  }
}
