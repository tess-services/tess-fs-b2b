import type { Auth } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { Bindings } from "server";
import * as schema from "../db/schema";

export const initAuth = (bindings: Bindings): Auth => betterAuth({
  database: drizzleAdapter(drizzle(bindings.DB), {
    provider: "sqlite",
    schema,
  }),
  secret: bindings.BETTER_AUTH_SECRET,
  baseURL: bindings.BETTER_AUTH_URL,
  trustedOrigins: bindings.BETTER_AUTH_TRUSTED_ORIGINS.split(","),
  emailAndPassword: {
    enabled: true,
  }
});
