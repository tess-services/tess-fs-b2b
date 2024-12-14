import { authMiddleware } from "AuthMiddleware";
import { UserWithRole } from "better-auth/plugins";
import { and, eq } from "drizzle-orm";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import type { AppLoadContext, RequestHandler, ServerBuild } from "react-router";
import { staticAssets } from "remix-hono/cloudflare";
import { reactRouter } from "remix-hono/handler";
import { database, DatabaseContext } from "~/db/context";
import { organizationMembership } from "~/db/schema";
import * as schema from "./app/db/schema";

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

app.use(authMiddleware);

// Single DB middleware
app.use(async (c, next) => {
  try {
    console.log("trying ot set DatabaseContext ========");

    const db = drizzle(c.env.DB, { schema });

    return DatabaseContext.run(db, async () => {
      try {
        console.log("===> DatabaseContext set");
        next();
      } catch (error) {
        console.error('Database error:', error);
        throw error;
      }
    });
  } catch (error) {
    console.error('error in create database context Database error:', error);
    throw error;
  }
});

// Static assets middleware
app.use(async (c, next) => {
  if (process.env.NODE_ENV !== "development" || import.meta.env.PROD) {
    return staticAssets()(c, next);
  }

  await next();
});

// Router middleware
app.use(
  async (c, next) => {
    if (process.env.NODE_ENV !== "development" || import.meta.env.PROD) {
      const serverBuild = await import("./build/server");

      return reactRouter({
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
    }

    // dev mode only
    if (!handler && process.env.NODE_ENV === "development") {
      // @ts-expect-error it's not typed
      const build = await import("virtual:react-router/server-build");
      const { createRequestHandler } = await import("react-router");

      handler = createRequestHandler(build, "development");
    }

    const remixContext = {
      cloudflare: {
        env: c.env,
        var: c.var,
      },
    } as unknown as AppLoadContext;

    return handler!(c.req.raw, remixContext);

  },
);

app.use("organizations/:organizationId/:role", async (c, next) => {
  const { organizationId, role } = c.req.param();
  const db = database();
  const user = c.var.user;

  if (!user) {
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

export default app;
