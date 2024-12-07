import { Session, User } from "better-auth";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { type AppLoadContext } from "react-router";
import { type PlatformProxy } from "wrangler";

interface Env {
  DB: D1Database;
  ACCOUNT_ID: string;
  CF_IMAGES_TOKEN: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_TRUSTED_ORIGINS: string;
  RESEND_API_KEY: string;
  RESEND_SENDER_EMAIL: string;
}
type UserWithRole = User & { role: string };
type Cloudflare = Omit<PlatformProxy<Env>, "dispose"> & {
  var: {
    user: UserWithRole | null;
    session: Session | null;
    db: DrizzleD1Database | null;
  };
};

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}

type GetLoadContext = (args: {
  request: Request<unknown, unknown>;
  context: { cloudflare: Cloudflare }; // load context _before_ augmentation
}) => AppLoadContext;

// Shared implementation compatible with Vite, Wrangler, and Cloudflare Pages
export const getLoadContext: GetLoadContext = ({ request, context }) => {
  return {
    cloudflare: {
      ...context.cloudflare,
      var: {
        user: null,
        session: null,
        db: null,
      },
    },
  };
};
