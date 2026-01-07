import { eq, inArray } from "drizzle-orm";
import type { DB } from "../db";
import { postsToTags, tags } from "../db/schema";

class TagService {
    constructor(private db: DB) {}
    async syncTags(postId: number, tagNames: string[]) {
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
}

export type { TagService };
