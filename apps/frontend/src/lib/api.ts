import type { AppType } from "@tricore/backend";
import process from "node:process";
import { hc } from "hono/client";

export const api = hc<AppType>(process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.shenley.top");
