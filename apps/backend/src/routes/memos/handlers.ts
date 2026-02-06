import type { RouteHandler } from "@hono/zod-openapi";
import type { Env } from "../../types";
import type * as routes from "./routes";
import { verify } from "hono/jwt";
import { validateEnv } from "../../lib/env";

export function createGetMemoHandler(): RouteHandler<typeof routes.getMemoRoute, { Bindings: Env }> {
  return async (c) => {
    const memoService = c.get("memoService");
    const env = validateEnv(c.env);
    const jwtSecret = env.JWT_SECRET;
    const { id } = c.req.valid("param");

    const authHeader = c.req.header("Authorization");
    let onlyPublished = true;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = await verify(token, jwtSecret, "HS256");
        if (payload.role === "admin") {
          onlyPublished = false;
        }
      }
      catch {
        // Invalid token or not an admin, keep onlyPublished as true
      }
    }

    const result = await memoService.getMemoById(id, onlyPublished);

    if (!result) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Memo not found",
          },
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        data: memoService.formatMemo(result),
      },
      200,
    );
  };
}

export function createListMemosHandler(): RouteHandler<typeof routes.listMemosRoute, { Bindings: Env }> {
  return async (c) => {
    const memoService = c.get("memoService");
    const env = validateEnv(c.env);
    const jwtSecret = env.JWT_SECRET;

    const { page: pageStr, limit: limitStr } = c.req.valid("query");

    const page = Math.max(1, Number(pageStr) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitStr) || 10));

    const authHeader = c.req.header("Authorization");
    let onlyPublished = true;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = await verify(token, jwtSecret, "HS256");
        if (payload.role === "admin") {
          onlyPublished = false;
        }
      }
      catch {
        // Invalid token or not an admin, keep onlyPublished as true
      }
    }

    const { data, total } = await memoService.listMemos(page, limit, onlyPublished);

    return c.json(
      {
        success: true,
        data: data.map(item => memoService.formatMemo(item)),
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

export function createCreateMemoHandler(): RouteHandler<typeof routes.createMemoRoute, { Bindings: Env }> {
  return async (c) => {
    const memoService = c.get("memoService");
    const { content, isPublished } = c.req.valid("json");

    const payload = c.get("jwtPayload");
    const authorId = payload?.sub;
    if (!authorId) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          },
        },
        401,
      );
    }

    const result = await memoService.createMemo({
      content,
      authorId: Number(authorId),
      isPublished,
    });

    if (!result) {
      return c.json(
        {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create memo",
          },
        },
        500,
      );
    }

    return c.json(
      {
        success: true,
        data: memoService.formatMemo(result),
      },
      201,
    );
  };
}

export function createUpdateMemoHandler(): RouteHandler<typeof routes.updateMemoRoute, { Bindings: Env }> {
  return async (c) => {
    const memoService = c.get("memoService");
    const { id } = c.req.valid("param");
    const values = c.req.valid("json");

    const result = await memoService.updateMemo(id, values);

    if (!result) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Memo not found",
          },
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        data: memoService.formatMemo(result),
      },
      200,
    );
  };
}

export function createDeleteMemoHandler(): RouteHandler<typeof routes.deleteMemoRoute, { Bindings: Env }> {
  return async (c) => {
    const memoService = c.get("memoService");
    const { id } = c.req.valid("param");

    const result = await memoService.deleteMemo(id);

    if (result.length === 0) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Memo not found",
          },
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        data: { id },
      },
      200,
    );
  };
}
