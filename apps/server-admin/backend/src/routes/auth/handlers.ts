import type { RouteHandler } from "@hono/zod-openapi";
import type { Env } from "../../types";
import type * as routes from "./routers";

export function createLoginHandler(): RouteHandler<typeof routes.loginRoute, { Bindings: Env }> {
  return async (c) => {
    const authService = c.get("authService");

    const { identifier, password } = c.req.valid("json");

    const foundUser = await authService.findUserByIdentifier(identifier);

    const dummyHash = "pbkdf2:100000:0000000000000000:0000000000000000000000000000000000000000000000000000000000000000";
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
        data: { token },
      },
      200,
    );
  };
}

export function createRegisterHandler(): RouteHandler<typeof routes.registerRoute, { Bindings: Env }> {
  return async (c) => {
    const authService = c.get("authService");

    let userCount: number;
    try {
      userCount = await authService.countUsers();
    }
    catch (error: any) {
      if (error.message?.includes("no such table")) {
        return c.json(
          {
            success: false,
            error: {
              code: "DATABASE_NOT_INITIALIZED",
              message: "Database tables are missing. Please run 'pnpm run migrate:remote' first.",
            },
          },
          500,
        );
      }
      throw error;
    }

    if (userCount > 0) {
      return c.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Registration is only allowed for the first user",
          },
        },
        403,
      );
    }

    const { username, email, password } = c.req.valid("json");

    const hashedPassword = await authService.hashPassword(password);

    await authService.createUser({
      username,
      email,
      passwordHash: hashedPassword,
      role: "admin", // The first user is always an admin
    });

    return c.json(
      {
        success: true,
        data: {
          message: "User registered successfully",
        },
      },
      201,
    );
  };
}

export function createChangePasswordHandler(): RouteHandler<typeof routes.changePasswordRoute, { Bindings: Env }> {
  return async (c) => {
    const authService = c.get("authService");

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

    const isMatch = await authService.verifyPassword(oldPassword, foundUser.passwordHash);

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

    const success = await authService.updatePassword(Number(userId), newPasswordHash);

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
}
