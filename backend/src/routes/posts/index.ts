import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import {
  createCreatePostHandler,
  createDeletePostHandler,
  createGetPostHandler,
  createListPostsHandler,
  createUpdatePostHandler,
} from "./handlers";
import {
  createPostRoute,
  deletePostRoute,
  getPostRoute,
  listPostsRoute,
  updatePostRoute,
} from "./routes";

export function createPostsRouter() {
  return new OpenAPIHono<{ Bindings: Env }>({ defaultHook })
    .openapi(getPostRoute, createGetPostHandler())
    .openapi(listPostsRoute, createListPostsHandler())
    .openapi(createPostRoute, createCreatePostHandler())
    .openapi(updatePostRoute, createUpdatePostHandler())
    .openapi(deletePostRoute, createDeletePostHandler());
}

export default createPostsRouter;
