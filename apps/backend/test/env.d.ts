import type { D1Migration } from "@cloudflare/workers-types";

declare global {
  interface Response {
    // eslint-disable-next-line ts/method-signature-style
    json(): Promise<any>;
  }
}

declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: D1Migration[];
  }
}
