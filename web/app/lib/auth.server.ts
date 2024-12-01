import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { admin, organization } from "better-auth/plugins";
import { type User } from "better-auth/types";
import * as schema from "../db/schema";
import { sendEmail } from "./sendEmail";
import { adminRole, ownerRole, memberRole, accessControl } from "./permissions";

const getBetterAuth = (bindings: Env) =>
  betterAuth({
    plugins: [
      admin(),
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
          const inviteLink = `${bindings.BETTER_AUTH_URL}/superadmin/organizations/invite?email=${data.email}&invitationId=${data.id}`;

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
      sendVerificationEmail: async (data: { user: User; url: string }) => {
        // don't send email when development env
        if (process.env.NODE_ENV === "development") return;
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
