import type { AppType } from "@tricore/backend";

import { hc } from "hono/client";

// eslint-disable-next-line node/prefer-global/process
export const api = hc<AppType>(process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.shenley.top");
