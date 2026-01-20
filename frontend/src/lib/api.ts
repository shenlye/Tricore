import type { AppType } from "@my-api/backend";
import { hc } from "hono/client";

const baseUrl
  = import.meta.env.VITE_API_BASE_URL
    || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

export const client = hc<AppType>(baseUrl);
