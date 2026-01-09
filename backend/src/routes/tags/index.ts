import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import { listTagsHandler } from "./handlers";
import { listTagsRoute } from "./routes";

const tagsRouter = new OpenAPIHono({ defaultHook }).openapi(
	listTagsRoute,
	listTagsHandler,
);

export default tagsRouter;
