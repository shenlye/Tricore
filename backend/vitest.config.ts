import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsPath = path.join(__dirname, "drizzle");
const migrations = fs.existsSync(migrationsPath)
  ? fs
      .readdirSync(migrationsPath)
      .filter(file => file.endsWith(".sql"))
      .sort()
      .map((file) => {
        const sql = fs.readFileSync(path.join(migrationsPath, file), "utf-8");
        return {
          name: file,
          queries: sql.split("--> statement-breakpoint").map(q => q.trim()).filter(Boolean),
        };
      })
  : [];

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
          },
        },
      },
    },
    setupFiles: ["./test/setup.ts"],
  },
});
