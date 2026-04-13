import type { Context, Next } from "hono";
import { auth } from "../lib/auth.js";
import { ForbiddenError, appErrorToPayload } from "../types/errors.js";
import { logger } from "../utils/logger.js";
import type { HonoVariables } from "../types/hono.js";

type AppContext = Context<{ Variables: HonoVariables }>;

export async function sessionMiddleware(c: AppContext, next: Next) {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    c.set("user", session?.user ?? null);
    c.set("session", session?.session ?? null);

    if (session?.user?.id) {
      logger.debug(
        {
          method: c.req.method,
          path: c.req.path,
          userId: session.user.id,
          sessionId: session.session?.id ?? null,
        },
        "Auth session resolved",
      );
    }
  } catch (err) {
    c.set("user", null);
    c.set("session", null);

    logger.warn(
      {
        err,
        method: c.req.method,
        path: c.req.path,
      },
      "Auth session resolution failed",
    );
  }

  await next();
}

export async function requireAuth(c: AppContext, next: Next) {
  const user = c.get("user");

  if (!user) {
    logger.debug(
      {
        method: c.req.method,
        path: c.req.path,
      },
      "Unauthorized request blocked",
    );

    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
}

export async function requireAdmin(c: AppContext, next: Next) {
  const user = c.get("user");
  const role =
    (user as (typeof user & { role?: string }) | null)?.role ?? "user";

  if (!user) {
    logger.debug(
      {
        method: c.req.method,
        path: c.req.path,
      },
      "Unauthorized admin request blocked",
    );

    return c.json({ error: "Unauthorized" }, 401);
  }

  if (role !== "admin") {
    logger.warn(
      {
        method: c.req.method,
        path: c.req.path,
        userId: user.id,
        role,
      },
      "Forbidden admin request blocked",
    );

    return c.json(
      appErrorToPayload(new ForbiddenError("Admin access required")),
      403,
    );
  }

  await next();
}
