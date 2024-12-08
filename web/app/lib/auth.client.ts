import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { accessControl, adminRole, memberRole, ownerRole } from "./permissions";

// https://remix.run/docs/en/main/guides/envvars#browser-environment-variables

const authClient = createAuthClient({
  baseURL: window.ENV.BETTER_AUTH_URL,
  plugins: [
    adminClient(),
    organizationClient({
      ac: accessControl,
      roles: {
        admin: adminRole,
        owner: ownerRole,
        member: memberRole,
      },
    }),
  ],
});

export const {
  admin,
  signIn,
  signUp,
  signOut,
  // useSession, // useSession is not supported in React router 7, don't know why.
  forgetPassword,
  resetPassword,
  verifyEmail,
  organization,

  useActiveOrganization,
} = authClient;
