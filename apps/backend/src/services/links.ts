import type { DB } from "../db";
import { asc, count, desc, eq } from "drizzle-orm";
import { links } from "../db/schemas";

export class LinkService {
  constructor(private db: DB) {}

  async getLinkById(id: number) {
    return await this.db.query.links.findFirst({
      where: eq(links.id, id),
    });
  }

  async listLinks(options?: { page?: number; pageSize?: number; orderBy?: "asc" | "desc" }) {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 20;
    const orderBy = options?.orderBy || "desc";
    const offset = (page - 1) * pageSize;

    const [data, totalResult] = await Promise.all([
      this.db.query.links.findMany({
        limit: pageSize,
        offset,
        orderBy: orderBy === "asc" ? asc(links.createdAt) : desc(links.createdAt),
      }),
      this.db.select({ count: count() }).from(links),
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      data,
      total,
    };
  }

  async createLink(data: {
    title: string;
    link: string;
    avatar?: string;
    desc?: string;
    date?: Date;
    feed?: string;
    comment?: string;
    category?: string;
  }) {
    const result = await this.db
      .insert(links)
      .values({
        title: data.title,
        link: data.link,
        avatar: data.avatar,
        desc: data.desc,
        date: data.date,
        feed: data.feed,
        comment: data.comment,
        category: data.category,
      })
      .returning();

    return result[0] ?? null;
  }

  async updateLink(
    id: number,
    data: {
      title?: string;
      link?: string;
      avatar?: string;
      desc?: string;
      date?: Date;
      feed?: string;
      comment?: string;
      category?: string;
    },
  ) {
    const result = await this.db
      .update(links)
      .set({
        title: data.title,
        link: data.link,
        avatar: data.avatar,
        desc: data.desc,
        date: data.date,
        feed: data.feed,
        comment: data.comment,
        category: data.category,
      })
      .where(eq(links.id, id))
      .returning();

    return result[0] ?? null;
  }

  async deleteLink(id: number) {
    const result = await this.db.delete(links).where(eq(links.id, id)).returning();

    return result[0] ?? null;
  }
}
