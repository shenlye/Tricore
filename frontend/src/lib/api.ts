import { hc } from "hono/client";
import type { AppType } from "../../../src/index";

export const client = hc<AppType>("http://localhost:3000");
