import type { DB } from "../db";
import { count, eq, inArray } from "drizzle-orm";
import { postsToTags, tags } from "../db/schema";

class TagService {
  constructor(private db: DB) { }

  async listAllWithCount() {
    return await this.db
      .select({
        id: tags.id,
        name: tags.name,
        postCount: count(postsToTags.postId),
      })
      .from(tags)
      .leftJoin(postsToTags, eq(tags.id, postsToTags.tagId))
      .groupBy(tags.id)
      .orderBy(tags.name);
  }

  async getByName(name: string) {
    return await this.db.query.tags.findFirst({
      where: eq(tags.name, name),
    });
  }

  async syncTags(postId: number, tagNames: string[]) {
    const uniqueTagNames = Array.from(new Set(tagNames));

    // 如果没有标签，删除所有关联并且退出
    if (uniqueTagNames.length === 0) {
      await this.db.delete(postsToTags).where(eq(postsToTags.postId, postId));
      return;
    }

    // 1. 确保所有标签都存在
    await this.db
      .insert(tags)
      .values(uniqueTagNames.map(tagName => ({ name: tagName })))
      .onConflictDoNothing();

    // 2. 获取所有标签的 ID
    const allTags = await this.db.query.tags.findMany({
      where: inArray(tags.name, uniqueTagNames),
    });
    const tagIds = allTags.map(tag => tag.id);

    // 3. 先删再增
    await this.db.delete(postsToTags).where(eq(postsToTags.postId, postId));

    if (tagIds.length > 0) {
      await this.db.insert(postsToTags).values(
        tagIds.map(tagId => ({
          postId,
          tagId,
        })),
      );
    }
  }
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


export { TagService };
