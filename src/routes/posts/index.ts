import { OpenAPIHono } from "@hono/zod-openapi";
import {
    createPostHandler,
    getPostHandler,
    listPostsHandler,
} from "./handlers";
import { createPostRoute, getPostRoute, listPostsRoute } from "./routes";

const postsRouter = new OpenAPIHono()
    .openapi(getPostRoute, getPostHandler)
    .openapi(listPostsRoute, listPostsHandler)
    .openapi(createPostRoute, createPostHandler);

export default postsRouter;
