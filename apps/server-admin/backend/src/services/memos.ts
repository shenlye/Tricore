import type { DB } from "../db";
import { and, count, eq, isNull } from "drizzle-orm";
import { memos } from "../db/schema";

export class MemoService {
  constructor(private db: DB) {}

  async getMemoById(id: number, onlyPublished = true) {
    const conditions = [
      eq(memos.id, id),
      isNull(memos.deletedAt),
    ];

    if (onlyPublished) {
      conditions.push(eq(memos.isPublished, true));
    }

    return await this.db.query.memos.findFirst({
      where: and(...conditions),
    });
  }

  async listMemos(
    page: number,
    limit: number,
    onlyPublished = true,
  ) {
    const conditions = [
      isNull(memos.deletedAt),
    ];

    if (onlyPublished) {
      conditions.push(eq(memos.isPublished, true));
    }

    const whereClause = and(...conditions);

    const totalResult = await this.db
      .select({ count: count() })
      .from(memos)
      .where(whereClause);
    const total = Number(totalResult[0].count);

    const data = await this.db.query.memos.findMany({
      where: whereClause,
      limit,
      offset: (page - 1) * limit,
      orderBy: (memos, { desc }) => [desc(memos.createdAt)],
    });

    return { data, total };
  }

  async createMemo(values: {
    content: string;
    authorId: number;
    isPublished: boolean;
  }) {
    const inserted = await this.db
      .insert(memos)
      .values(values)
      .returning();
    return inserted[0] ?? null;
  }

  async updateMemo(
    id: number,
    values: {
      content?: string;
      isPublished?: boolean;
    },
  ) {
    if (Object.keys(values).length > 0) {
      await this.db.update(memos).set(values).where(eq(memos.id, id));
    }

    return await this.db.query.memos.findFirst({
      where: and(eq(memos.id, id), isNull(memos.deletedAt)),
    });
  }

  async deleteMemo(id: number) {
    return await this.db
      .update(memos)
      .set({ deletedAt: new Date() })
      .where(and(eq(memos.id, id), isNull(memos.deletedAt)))
      .returning();
  }

  formatMemo(memo: any) {
    return {
      id: memo.id,
      content: memo.content,
      isPublished: memo.isPublished,
      createdAt: memo.createdAt.toISOString(),
      updatedAt: memo.updatedAt.toISOString(),
    };
  }
}
