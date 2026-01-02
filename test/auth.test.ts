import { describe, expect, test } from "bun:test";
import app from "../src/index";

describe("Auth Security Tests", () => {
    test("should return 429 when login rate limit is exceeded", async () => {
        const limit = 10;
        const testIp = "1.2.3.4";

        for (let i = 0; i < limit; i++) {
            const res = await app.request("/api/v1/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-forwarded-for": testIp,
                },
                body: JSON.stringify({ username: "admin", password: "any" }),
            });

            expect(res.status).not.toBe(429);
        }

        const blockedRes = await app.request("/api/v1/auth/login", {
            method: "POST",
            headers: {
                "x-forwarded-for": testIp,
            },
            body: JSON.stringify({ username: "admin", password: "any" }),
        });

        expect(blockedRes.status).toBe(429);

        const ratelimitHeader = blockedRes.headers.get("ratelimit");
        expect(ratelimitHeader).toContain("limit=10");
        expect(ratelimitHeader).toContain("remaining=0");

        const body = await blockedRes.json();
        
        expect(body).toHaveProperty("error");
    });

    test("should separate rate limits by IP address", async () => {
        const ipA = "1.1.1.1";
        const ipB = "2.2.2.2";

        for (let i = 0; i < 10; i++) {
            await app.request("/api/v1/auth/login", {
                headers: { "x-forwarded-for": ipA },
            });
        }

        const resA = await app.request("/api/v1/auth/login", {
            headers: { "x-forwarded-for": ipA },
        });
        expect(resA.status).toBe(429);

        const resB = await app.request("/api/v1/auth/login", {
            headers: { "x-forwarded-for": ipB },
        });
        expect(resB.status).not.toBe(429);
    });
});
