import type { RouteHandler } from "@hono/zod-openapi";
import type { Env } from "../../types";
import type * as routes from "./routes";

export function createGetLinkHandler(): RouteHandler<typeof routes.getLinkRoute, { Bindings: Env }> {
  return async (c) => {
    const linkService = c.get("linkService");
    const { id } = c.req.valid("param");

    const link = await linkService.getLinkById(id);

    if (!link) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Link not found",
          },
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        data: {
          ...link,
          date: link.date?.toISOString() ?? null,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
        },
      },
      200,
    );
  };
}

export function createListLinksHandler(): RouteHandler<typeof routes.listLinksRoute, { Bindings: Env }> {
  return async (c) => {
    const linkService = c.get("linkService");
    const { page, limit, orderBy } = c.req.valid("query");

    const { data, total } = await linkService.listLinks({
      page,
      pageSize: limit,
      orderBy,
    });

    return c.json(
      {
        success: true,
        data: data.map(link => ({
          ...link,
          date: link.date?.toISOString() ?? null,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
        })),
        meta: {
          total,
          page,
          limit,
        },
      },
      200,
    );
  };
}

export function createCreateLinkHandler(): RouteHandler<typeof routes.createLinkRoute, { Bindings: Env }> {
  return async (c) => {
    const linkService = c.get("linkService");
    const body = c.req.valid("json");

    const link = await linkService.createLink(body);

    return c.json(
      {
        success: true,
        data: {
          ...link,
          date: link.date?.toISOString() ?? null,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
        },
      },
      201,
    );
  };
}

export function createUpdateLinkHandler(): RouteHandler<typeof routes.updateLinkRoute, { Bindings: Env }> {
  return async (c) => {
    const linkService = c.get("linkService");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    // Check if link exists
    const existingLink = await linkService.getLinkById(id);
    if (!existingLink) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Link not found",
          },
        },
        404,
      );
    }

    const link = await linkService.updateLink(id, body);

    return c.json(
      {
        success: true,
        data: {
          ...link,
          date: link.date?.toISOString() ?? null,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
        },
      },
      200,
    );
  };
}

export function createDeleteLinkHandler(): RouteHandler<typeof routes.deleteLinkRoute, { Bindings: Env }> {
  return async (c) => {
    const linkService = c.get("linkService");
    const { id } = c.req.valid("param");

    // Check if link exists
    const existingLink = await linkService.getLinkById(id);
    if (!existingLink) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Link not found",
          },
        },
        404,
      );
    }

    await linkService.deleteLink(id);

    return c.json(
      {
        success: true,
        data: {
          message: "Link deleted successfully",
        },
      },
      200,
    );
  };
}
