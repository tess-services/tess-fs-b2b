import { Session, User } from "better-auth";
import { type AppLoadContext } from "react-router";
import { type PlatformProxy } from "wrangler";

type UserWithRole = User & { role: string };
type Cloudflare = Omit<PlatformProxy<Env>, "dispose"> & {
  var: {
    user: UserWithRole | null;
    session: Session | null;
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
      },
    },
  };
};
