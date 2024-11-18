import { type AppLoadContext } from "@remix-run/cloudflare";
import { Session, User } from "better-auth";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { type PlatformProxy } from "wrangler";

interface Env {
  DB: D1Database;
  ORG_BUCKET: R2Bucket
  ACCOUNT_ID: string;
  CF_IMAGES_TOKEN: string;
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose"> & {
  var: {
    user: User | null;
    session: Session | null;
    db: DrizzleD1Database | null;
  }
};

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}

type GetLoadContext = (args: {
  request: Request;
  context: { cloudflare: Cloudflare }; // load context _before_ augmentation
}) => AppLoadContext;

// Shared implementation compatible with Vite, Wrangler, and Cloudflare Pages
export const getLoadContext: GetLoadContext = ({
  context,
}) => {
  return {
    ...context,
    user: null,
    session: null,
  };
};
