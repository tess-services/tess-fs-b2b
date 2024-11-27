import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { organizationClient } from "better-auth/client/plugins"

// https://remix.run/docs/en/main/guides/envvars#browser-environment-variables

const authClient = createAuthClient({
  baseURL: window.ENV.BETTER_AUTH_URL
, plugins: [adminClient(), organizationClient()]
})

export const { signIn, signUp, signOut, useSession, forgetPassword, resetPassword, verifyEmail, organization } = authClient
