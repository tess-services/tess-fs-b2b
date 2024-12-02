import type {
  AppLoadContext,
  RequestHandler,
  ServerBuild,
} from "@remix-run/cloudflare";
import { logDevReady } from "@remix-run/cloudflare";
import { authMiddleware } from "AuthMiddleware";
import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { staticAssets } from "remix-hono/cloudflare";
import { remix } from "remix-hono/handler";
import { and, eq } from "drizzle-orm";
import { organizationMembership } from "~/db/schema";
import { createMiddleware } from "hono/factory";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { UserWithRole } from "better-auth/plugins";

type HonoEnv = {
  Bindings: Env;
  Variables: {
    db: DrizzleD1Database;
    user: UserWithRole;
  };
};

const app = new Hono<HonoEnv>();
let handler: RequestHandler | undefined;

app.use(poweredBy());

// NOTE: Sequence of using middleware is important,
// const dbContextMiddleware = ;
const dbContextMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  c.set("db", drizzle(c.env.DB));
  return await next();
});

app.use("*", async (c, next) => {
  return await dbContextMiddleware(c, next);
});

app.use(authMiddleware);

app.use("organizations/:organizationId/:role", async (c, next) => {
  const { organizationId, role } = c.req.param();
  const db = c.var.db;
  const user = c.var.user;

  if (!db || !user) {
    return c.redirect("/signin");
  }
  const membership = await db
    .select()
    .from(organizationMembership)
    .where(
      and(
        eq(organizationMembership.userId, user.id),
        eq(organizationMembership.organizationId, organizationId),
        eq(organizationMembership.role, role)
      )
    )
    .execute();

  if (membership.length === 0) {
    throw new Error(`Unauthorized: User is not ${role} of this organization`);
  }

  return next();
});

app.use(
  async (c, next) => {
    if (process.env.NODE_ENV !== "development" || import.meta.env.PROD) {
      return staticAssets()(c, next);
    }
    await next();
  },
  async (c, next) => {
    if (process.env.NODE_ENV !== "development" || import.meta.env.PROD) {
      const serverBuild = await import("./build/server");

      return remix({
        build: serverBuild as unknown as ServerBuild,
        mode: "production",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        getLoadContext(c) {
          return {
            cloudflare: {
              env: c.env,
              var: c.var,
            },
          };
        },
      })(c, next);
    } else {
      if (!handler) {
        // @ts-expect-error it's not typed
        const build = await import("virtual:remix/server-build");
        const { createRequestHandler } = await import("@remix-run/cloudflare");

        handler = createRequestHandler(build, "development");

        if (process.env.NODE_ENV === "development") {
          logDevReady(build);
        }
      }

      const remixContext = {
        cloudflare: {
          env: c.env,
          var: c.var,
        },
      } as unknown as AppLoadContext;

      return handler(c.req.raw, remixContext);
    }
  }
);

export default app;
