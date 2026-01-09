import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import { listCategoriesHandler } from "./handlers";
import { listCategoriesRoute } from "./routes";

const categoriesRouter = new OpenAPIHono({ defaultHook }).openapi(
	listCategoriesRoute,
	listCategoriesHandler,
);

export default categoriesRouter;
