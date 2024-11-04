import { createAuthClient } from "better-auth/react"

// https://remix.run/docs/en/main/guides/envvars#browser-environment-variables

const authClient = createAuthClient({
  baseURL: window.ENV.BETTER_AUTH_URL
})

export const { signIn, signUp, signOut, useSession, forgetPassword, resetPassword, verifyEmail } = authClient
