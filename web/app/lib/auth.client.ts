import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { adminRole, ownerRole, memberRole, accessControl } from "./permissions";

// https://remix.run/docs/en/main/guides/envvars#browser-environment-variables

const authClient = createAuthClient({
  baseURL: window.ENV.BETTER_AUTH_URL,
  plugins: [
    adminClient(),
    organizationClient({
      ac: accessControl,
      roles: {
        adminRole,
        ownerRole,
        memberRole,
      },
    }),
  ],
});

export const {
  admin,
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
  verifyEmail,
  organization,
} = authClient;
