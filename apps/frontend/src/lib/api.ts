import { hc } from "hono/client";
import type { AppType } from "@tricore/backend";

export const api = hc<AppType>(process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.shenley.top");
