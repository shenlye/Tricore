import type { RouteHandler } from "@hono/zod-openapi";
import { db } from "../../db";
import { AuthService } from "../../services/auth";
import type { changePasswordRoute, loginRoute } from "./routers";

export const authService = new AuthService(db);
export const loginHandler: RouteHandler<typeof loginRoute> = async (c) => {
    const { identifier, password } = c.req.valid("json");

    const foundUser = await authService.findUserByIdentifier(identifier);

    const dummyHash =
        "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$q/v5V4AmI3f23aVw7V7d2A";
    const passwordHash = foundUser ? foundUser.passwordHash : dummyHash;
    const isMatch = await authService.verifyPassword(password, passwordHash);

    if (!foundUser || !isMatch) {
        return c.json(
            {
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Invalid username/email or password",
                },
            },
            401,
        );
    }

    const token = await authService.generateToken({
        id: foundUser.id,
        role: foundUser.role,
    });

    return c.json(
        {
            success: true,
            data: { token: token },
        },
        200,
    );
};

export const changePasswordHandler: RouteHandler<
    typeof changePasswordRoute
> = async (c) => {
    const { oldPassword, newPassword } = c.req.valid("json");
    const payload = c.get("jwtPayload");

    const userId = payload?.sub;
    if (!userId) {
        return c.json(
            {
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Unauthorized",
                },
            },
            401,
        );
    }

    const foundUser = await authService.findUserById(Number(userId));
    if (!foundUser) {
        return c.json(
            {
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "User not found",
                },
            },
            404,
        );
    }

    if (oldPassword === newPassword) {
        return c.json(
            {
                success: false,
                error: {
                    code: "BAD_REQUEST",
                    message: "Invalid request",
                },
            },
            400,
        );
    }

    const isMatch = await authService.verifyPassword(
        oldPassword,
        foundUser.passwordHash,
    );

    if (!isMatch) {
        return c.json(
            {
                success: false,
                error: {
                    code: "BAD_REQUEST",
                    message: "Invalid request",
                },
            },
            400,
        );
    }

    const newPasswordHash = await authService.hashPassword(newPassword);

    const success = await authService.updatePassword(
        Number(userId),
        newPasswordHash,
    );

    if (!success) {
        return c.json(
            {
                success: false,
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update password",
                },
            },
            500,
        );
    }

    return c.json(
        {
            success: true,
            data: {
                message: "Password changed successfully",
            },
        },
        200,
    );
};
