import pino from "pino";
import { env } from "./env";

const isProduction = env.NODE_ENV === "production";

export const logger = pino({
    level: isProduction ? "info" : "debug",
    transport: isProduction
        ? undefined
        : {
              target: "pino-pretty",
              options: { colorize: true },
          },
});
