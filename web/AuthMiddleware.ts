import { getAuth } from "app/lib/auth.server";
import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(async (c, next) => {
  const auth = getAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);

    return await next();
  }

  c.set("user", session.user);
  c.set("session", session.session);

  return await next();
});
