import type { Env } from "../../types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "../../lib/route-factory";
import {
  createCreateLinkHandler,
  createDeleteLinkHandler,
  createGetLinkHandler,
  createListLinksHandler,
  createUpdateLinkHandler,
} from "./handlers";
import {
  createLinkRoute,
  deleteLinkRoute,
  getLinkRoute,
  listLinksRoute,
  updateLinkRoute,
} from "./routes";

export function createLinksRouter() {
  return new OpenAPIHono<{ Bindings: Env }>({ defaultHook })
    .openapi(listLinksRoute, createListLinksHandler())
    .openapi(getLinkRoute, createGetLinkHandler())
    .openapi(createLinkRoute, createCreateLinkHandler())
    .openapi(updateLinkRoute, createUpdateLinkHandler())
    .openapi(deleteLinkRoute, createDeleteLinkHandler());
}

export default createLinksRouter;
