import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import { type User } from "better-auth/types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { accessControl, adminRole, memberRole, ownerRole } from "./permissions";
import { sendEmail } from "./sendEmail";

const getBetterAuth = (bindings: Env) =>
  betterAuth({
    plugins: [
      admin({
        adminRole: ["admin", "orgAdmin"],
      }),
      organization({
        schema: {
          organization: {
            modelName: "organizationTable",
          },
          member: {
            modelName: "organizationMembership",
          },
        },
        allowUserToCreateOrganization: async (user: any) => {
          return user.role === "admin";
        },
        ac: accessControl,
        roles: {
          admin: adminRole,
          owner: ownerRole,
          member: memberRole,
        },
        sendInvitationEmail: async (data) => {
          const inviteLink = `${bindings.BETTER_AUTH_URL}/onboarding?email=${data.email}&invitationid=${data.id}`;

          await sendEmail({
            apiKey: bindings.RESEND_API_KEY,
            from: bindings.RESEND_SENDER_EMAIL,
            to: data.email,
            subject: "You have been invited to join an organization",
            text: `Click the link to join the organization: ${inviteLink}`,
          });
        },
      }),
    ],
    database: drizzleAdapter(drizzle(bindings.DB), {
      provider: "sqlite",
      schema,
    }),
    user: {
      modelName: "user",
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false,
        },
      },
    },
    secret: bindings.BETTER_AUTH_SECRET,
    baseURL: bindings.BETTER_AUTH_URL,
    trustedOrigins: bindings.BETTER_AUTH_TRUSTED_ORIGINS.split(","),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: process.env.NODE_ENV !== "development",

      sendResetPassword: async (data: { user: User; url: string }) => {
        await sendEmail({
          apiKey: bindings.RESEND_API_KEY,
          from: bindings.RESEND_SENDER_EMAIL,
          to: data.user.email,
          subject: "Reset your password",
          text: `Click the link to reset your password: ${data.url}`,
        });
      },
    },
    emailVerification: {
      autoSignInAfterVerification: true,
      callbackURL: `${bindings.BETTER_AUTH_URL}/onboarding`,
      sendVerificationEmail: async (data: { user: User; url: string }) => {
        await sendEmail({
          apiKey: bindings.RESEND_API_KEY,
          to: data.user.email,
          from: bindings.RESEND_SENDER_EMAIL,
          subject: "Verify your email address",

          text: `Click the link to verify your email: ${data.url}`,
        });
      },
    },
  });

let betterAuthSingleton: ReturnType<typeof getBetterAuth>;

export const getAuth = (bindings: Env) => {
  if (betterAuthSingleton) {
    return betterAuthSingleton;
  }

  betterAuthSingleton = getBetterAuth(bindings);

  return betterAuthSingleton;
};
