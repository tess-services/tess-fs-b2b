import { createAuthClient } from "better-auth/react"



// https://remix.run/docs/en/main/guides/envvars#browser-environment-variables

const authClient = createAuthClient({
  baseURL: window.ENV.BETTER_AUTH_URL // the base url of your auth server, TODO: How to pass for production?
})

export const { signIn, signUp, useSession } = authClient
