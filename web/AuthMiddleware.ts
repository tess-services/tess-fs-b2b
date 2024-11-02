import { initAuth } from "app/lib/auth.server";
import type { Auth } from "better-auth";
import { drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(async (c, next) => {
  const auth: Auth = initAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);

    return await next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  c.set("db", drizzle(c.env.DB));

  return await next();
});

export const providerAuthMiddleware = createMiddleware(async (c, next) => {
  const auth: Auth = initAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.redirect("/signin");
  }

  return await next();
});
