import type { AppType } from "@tricore/backend";
import { hc } from "hono/client";

let baseUrl = import.meta.env.VITE_API_BASE_URL
  || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

// 增加保险：如果环境变量忘记写 https:// 了，自动补全
if (baseUrl && !baseUrl.startsWith("http") && !baseUrl.startsWith("/")) {
  baseUrl = `https://${baseUrl}`;
}

export const client = hc<AppType>(baseUrl);
