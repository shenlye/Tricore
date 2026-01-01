import { OpenAPIHono } from "@hono/zod-openapi";
import {
    createPostHandler,
    getPostHandler,
    listPostsHandler,
} from "./handlers";
import { createPostRoute, getPostRoute, listPostsRoute } from "./routes";

const postsRouter = new OpenAPIHono();

postsRouter.openapi(getPostRoute, getPostHandler);
postsRouter.openapi(listPostsRoute, listPostsHandler);
postsRouter.openapi(createPostRoute, createPostHandler);

export default postsRouter;
