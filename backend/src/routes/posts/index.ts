import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import {
	createPostHandler,
	deletePostHandler,
	getPostHandler,
	listPostsHandler,
	updatePostHandler,
} from "./handlers";
import {
	createPostRoute,
	deletePostRoute,
	getPostRoute,
	listPostsRoute,
	updatePostRoute,
} from "./routes";

const postsRouter = new OpenAPIHono({ defaultHook })
	.openapi(getPostRoute, getPostHandler)
	.openapi(listPostsRoute, listPostsHandler)
	.openapi(createPostRoute, createPostHandler)
	.openapi(updatePostRoute, updatePostHandler)
	.openapi(deletePostRoute, deletePostHandler);

export default postsRouter;
