import { createAuthClient } from "better-auth/react"

// https://remix.run/docs/en/main/guides/envvars#browser-environment-variables

const authClient = createAuthClient({
  baseURL: 'http://localhost:5173' // the base url of your auth server, TODO: How to pass for production?
})

export const { signIn, signUp, signOut, useSession } = authClient
