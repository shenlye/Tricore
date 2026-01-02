import { describe, expect, test } from "bun:test";
import app from "../src/index";

describe("Auth Security Tests", () => {
    const doLogin = (ip: string) =>
        app.request("/api/v1/auth/login", {
            method: "POST",
            headers: {
                "x-forwarded-for": ip,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: "admin", password: "any" }),
        });

    test("should return 429 when login rate limit is exceeded", async () => {
        const testIp = "1.2.3.4";

        await Promise.all(
            Array.from({ length: 10 }).map(() => doLogin(testIp)),
        );

        const blockedRes = await doLogin(testIp);

        expect(blockedRes.status).toBe(429);

        const ratelimit = blockedRes.headers.get("ratelimit");
        expect(ratelimit).toContain("remaining=0");
    });

    test("should separate rate limits by IP address", async () => {
        const ipA = "1.1.1.1",
            ipB = "2.2.2.2";

        await Promise.all(Array.from({ length: 10 }).map(() => doLogin(ipA)));

        expect((await doLogin(ipA)).status).toBe(429);
        expect((await doLogin(ipB)).status).not.toBe(429);
    });
});
