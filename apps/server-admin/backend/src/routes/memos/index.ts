import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import {
  createCreateMemoHandler,
  createDeleteMemoHandler,
  createGetMemoHandler,
  createListMemosHandler,
  createUpdateMemoHandler,
} from "./handlers";
import {
  createMemoRoute,
  deleteMemoRoute,
  getMemoRoute,
  listMemosRoute,
  updateMemoRoute,
} from "./routes";

export function createMemosRouter() {
  return new OpenAPIHono<{ Bindings: Env }>({ defaultHook })
    .openapi(getMemoRoute, createGetMemoHandler())
    .openapi(listMemosRoute, createListMemosHandler())
    .openapi(createMemoRoute, createCreateMemoHandler())
    .openapi(updateMemoRoute, createUpdateMemoHandler())
    .openapi(deleteMemoRoute, createDeleteMemoHandler());
}

export default createMemosRouter;
