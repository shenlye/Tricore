import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import {
  createAddPostLinkHandler,
  createCreatePostHandler,
  createDeletePostHandler,
  createGetPostHandler,
  createGetPostLinksHandler,
  createListPostsHandler,
  createRemovePostLinkHandler,
  createSearchPostsHandler,
  createUpdatePostHandler,
} from "./handlers";
import {
  addPostLinkRoute,
  createPostRoute,
  deletePostRoute,
  getPostLinksRoute,
  getPostRoute,
  listPostsRoute,
  removePostLinkRoute,
  searchPostsRoute,
  updatePostRoute,
} from "./routes";

export function createPostsRouter() {
  return new OpenAPIHono<{ Bindings: Env }>({ defaultHook })
    // 数字花园：搜索文章（必须放在 /:idOrSlug 之前）
    .openapi(searchPostsRoute, createSearchPostsHandler())
    .openapi(listPostsRoute, createListPostsHandler())
    .openapi(createPostRoute, createCreatePostHandler())
    .openapi(getPostRoute, createGetPostHandler())
    .openapi(updatePostRoute, createUpdatePostHandler())
    .openapi(deletePostRoute, createDeletePostHandler())
    // 数字花园：文章链接相关路由
    .openapi(addPostLinkRoute, createAddPostLinkHandler())
    .openapi(removePostLinkRoute, createRemovePostLinkHandler())
    .openapi(getPostLinksRoute, createGetPostLinksHandler());
}

export default createPostsRouter;
