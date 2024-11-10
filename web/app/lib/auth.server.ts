import type { Auth } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { Bindings } from "server";
import * as schema from "../db/schema";
import { sendEmail } from "./sendEmail";

type User = { id: string; email: string; emailVerified: boolean; name: string; createdAt: Date; updatedAt: Date; image?: string | undefined; };

export const initAuth = (bindings: Bindings): Auth => {
  return betterAuth({
    database: drizzleAdapter(drizzle(bindings.DB), {
      provider: "sqlite",
      schema,
    }),
    secret: bindings.BETTER_AUTH_SECRET,
    baseURL: bindings.BETTER_AUTH_URL,
    trustedOrigins: bindings.BETTER_AUTH_TRUSTED_ORIGINS.split(","),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: process.env.NODE_ENV !== 'development',
      sendResetPassword: async (user: User, url: string) => {
        await sendEmail({
          apiKey: bindings.RESEND_API_KEY,
          from: bindings.RESEND_SENDER_EMAIL,
          to: user.email,
          subject: 'Reset your password',
          text: `Click the link to reset your password: ${url}`,
        })
      },
    },
    emailVerification: {
      sendVerificationEmail: async (user: User, url: string) => {
        // don't send email when development env
        if (process.env.NODE_ENV === 'development') return;
        await sendEmail({
          apiKey: bindings.RESEND_API_KEY,
          to: user.email,
          from: bindings.RESEND_SENDER_EMAIL,
          subject: 'Verify your email address',
          text: `Click the link to verify your email: ${url}`,
        })
      }
    }
  });
}