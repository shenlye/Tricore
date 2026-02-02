import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import {
  createCreatePostHandler,
  createDeletePostHandler,
  createGetPostByIdHandler,
  createGetPostHandler,
  createListPostsHandler,
  createUpdatePostHandler,
} from "./handlers";
import {
  createPostRoute,
  deletePostRoute,
  getPostByIdRoute,
  getPostRoute,
  listPostsRoute,
  updatePostRoute,
} from "./routes";

export function createPostsRouter() {
  const postsRouter = new OpenAPIHono<{ Bindings: Env }>({ defaultHook });

  postsRouter
    .openapi(getPostRoute, createGetPostHandler())
    .openapi(getPostByIdRoute, createGetPostByIdHandler())
    .openapi(listPostsRoute, createListPostsHandler())
    .openapi(createPostRoute, createCreatePostHandler())
    .openapi(updatePostRoute, createUpdatePostHandler())
    .openapi(deletePostRoute, createDeletePostHandler());

  return postsRouter;
}

export default createPostsRouter;
